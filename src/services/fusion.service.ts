import { swapiService, Character, Planet } from './swapi.service';
import { weatherService, WeatherResponse, WeatherService } from './weather.service';
import { DynamoDBService } from './dynamodb.service';


// Map Star Wars planets to real-world locations for weather data
const PLANET_TO_LOCATION: Record<string, { city: string; countryCode: string }> = {
  'Tatooine': { city: 'Tunis', countryCode: 'TN' }, // Desert planet
  'Alderaan': { city: 'Zurich', countryCode: 'CH' }, // Peaceful, mountainous
  'Yavin IV': { city: 'Manaus', countryCode: 'BR' }, // Jungle moon
  'Hoth': { city: 'Vostok Station', countryCode: 'AQ' }, // Ice planet
  'Dagobah': { city: 'Cairns', countryCode: 'AU' }, // Swamp planet
  'Bespin': { city: 'La Paz', countryCode: 'BO' }, // Gas giant, high altitude city
  'Endor': { city: 'Portland', countryCode: 'US' }, // Forest moon
  'Naboo': { city: 'Venice', countryCode: 'IT' }, // Picturesque with water
  'Coruscant': { city: 'New York', countryCode: 'US' }, // City planet
  'Kamino': { city: 'Male', countryCode: 'MV' }, // Water planet
};

export interface CharacterBasicInfo {
  name: string;
  height: string;
  mass: string;
  gender: string;
  birth_year: string;
  homeworld: string;
}

export interface FusedCharacterData {
  character: CharacterBasicInfo;
  homeworld: {
    name: string;
    climate: string;
    terrain: string;
    population: string;
  };
  weather: {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  metadata: {
    cached: boolean;
    timestamp: string;
  };
}

export interface FusedCharacterListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CharacterBasicInfo[];
  weather: {
    location: string;
    temperature: number;
    condition: string;
  };
  metadata: {
    timestamp: string;
  };
}

export class FusionService {
  private static readonly CACHE_TTL = parseInt(process.env.CACHE_TTL || '1800', 10);
  private weatherService: WeatherService;
  // Using static methods from DynamoDBService directly

  constructor() {
    this.weatherService = new WeatherService();
  }

  async getFusedData(characterId?: string): Promise<FusedCharacterData | FusedCharacterListResponse> {
    if (characterId) {
      return this.getSingleCharacterData(characterId);
    } else {
      return this.getCharactersList();
    }
  }

  private async getSingleCharacterData(characterId: string): Promise<FusedCharacterData> {
    const cacheKey = `CHARACTER#${characterId}`;
    const cachedData = await this.getCachedData(cacheKey);
    
    if (cachedData?.data) {
      return { ...cachedData.data as FusedCharacterData, metadata: { ...cachedData.data.metadata, cached: true } };
    }
    
    try {
      const characterIdNum = parseInt(characterId, 10);
      if (isNaN(characterIdNum) || characterIdNum < 1) {
        throw new Error('Invalid character ID. Must be a positive number.');
      }
      
      const character = await swapiService.getCharacter(characterIdNum);
      
      // Get homeworld details
      const homeworldUrl = character.homeworld;
      const homeworldId = homeworldUrl.split('/').filter(Boolean).pop();
      const homeworld = await swapiService.getPlanet(parseInt(homeworldId || '1', 10));
      
      // Get weather data based on planet
      const location = PLANET_TO_LOCATION[homeworld.name] || { city: 'London', countryCode: 'GB' };
      const weather = await this.weatherService.getWeatherByCity(location.city, location.countryCode);
      
      const result: FusedCharacterData = {
        character: {
          name: character.name,
          height: character.height,
          mass: character.mass,
          gender: character.gender,
          birth_year: character.birth_year,
          homeworld: homeworld.name
        },
        homeworld: {
          name: homeworld.name,
          climate: homeworld.climate,
          terrain: homeworld.terrain,
          population: homeworld.population
        },
        weather: {
          location: `${location.city}, ${location.countryCode}`,
          temperature: weather.main.temp,
          condition: weather.weather[0]?.description || 'Unknown',
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed
        },
        metadata: {
          cached: false,
          timestamp: new Date().toISOString()
        }
      };
      
      // Cache the result
      await this.cacheData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Error getting character data for ID ${characterId}:`, error);
      throw new Error(`Failed to fetch character data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getCharactersList(): Promise<FusedCharacterListResponse> {
    const cacheKey = 'CHARACTERS_LIST';
    const cachedData = await this.getCachedData(cacheKey);
    
    if (cachedData?.data) {
      return cachedData.data as FusedCharacterListResponse;
    }
    
    try {
      // Get default weather for the list view (using Tatooine's location as default)
      const defaultLocation = PLANET_TO_LOCATION['Tatooine'] || { city: 'London', countryCode: 'GB' };
      const weather = await this.weatherService.getWeatherByCity(defaultLocation.city, defaultLocation.countryCode);
      
      // Get first page of characters
      const characterList = await swapiService.getCharacters();
      
      // Map to basic character info
      const results: CharacterBasicInfo[] = await Promise.all(
        characterList.results.map(async (character: any) => {
          // Extract homeworld ID from URL
          const homeworldId = character.homeworld.split('/').filter(Boolean).pop();
          let homeworldName = 'Unknown';
          
          try {
            // Get homeworld name (with basic caching)
            const homeworldCacheKey = `PLANET#${homeworldId}`;
            const cachedHomeworld = await this.getCachedData(homeworldCacheKey);
            
            if (cachedHomeworld?.data?.name) {
              homeworldName = cachedHomeworld.data.name;
            } else {
              const planet = await swapiService.getPlanet(parseInt(homeworldId, 10));
              homeworldName = planet.name;
              await this.cacheData(homeworldCacheKey, { name: planet.name });
            }
          } catch (error) {
            console.error(`Error fetching homeworld ${homeworldId}:`, error);
          }
          
          return {
            name: character.name,
            height: character.height,
            mass: character.mass,
            gender: character.gender,
            birth_year: character.birth_year,
            homeworld: homeworldName,
            url: character.url
          };
        })
      );
      
      const result: FusedCharacterListResponse = {
        count: characterList.count,
        next: characterList.next,
        previous: characterList.previous,
        results,
        weather: {
          location: `${defaultLocation.city}, ${defaultLocation.countryCode}`,
          temperature: weather.main.temp,
          condition: weather.weather[0]?.description || 'Unknown'
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
      
      // Cache the result for 5 minutes
      await this.cacheData(cacheKey, result, 300);
      
      return result;
    } catch (error) {
      console.error('Error getting characters list:', error);
      throw new Error(`Failed to fetch characters list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getCachedData(key: string) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const item = await DynamoDBService.getItemStatic(key, 'DATA');
      
      if (!item) return null;
      
      // Check if cache is still valid
      if (item.ttl < now) {
        console.log('Cache expired');
        return null;
      }
      
      return item as { data: any; createdAt: string };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  private async cacheData(key: string, data: any, customTtl?: number) {
    try {
      const ttl = Math.floor(Date.now() / 1000) + (customTtl || FusionService.CACHE_TTL);
      
      await DynamoDBService.putItemStatic({
        PK: key,
        SK: 'DATA',
        data,
        ttl,
        type: 'CACHE',
      });
      
      // Only store in history for individual character requests
      if (key.startsWith('CHARACTER#')) {
        await DynamoDBService.putItemStatic({
          PK: `HISTORY#${Date.now()}`,
          SK: key,
          data,
          ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days TTL for history
          type: 'HISTORY',
        });
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }
}

export const fusionService = new FusionService();
