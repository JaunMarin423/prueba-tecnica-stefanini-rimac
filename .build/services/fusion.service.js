"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fusionService = exports.FusionService = void 0;
const swapi_service_1 = require("./swapi.service");
const weather_service_1 = require("./weather.service");
const dynamodb_service_1 = require("./dynamodb.service");
// Map Star Wars planets to real-world locations for weather data
const PLANET_TO_LOCATION = {
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
class FusionService {
    // Using static methods from DynamoDBService directly
    constructor() {
        this.weatherService = new weather_service_1.WeatherService();
    }
    async getFusedData(characterId) {
        const cacheKey = `CHARACTER#${characterId}`;
        const cachedData = await this.getCachedData(cacheKey);
        if (cachedData && cachedData.data) {
            return cachedData.data;
        }
        const characterIdNum = parseInt(characterId, 10);
        const character = await swapi_service_1.swapiService.getCharacter(characterIdNum);
        // Get homeworld details
        const homeworldUrl = character.homeworld;
        const homeworldId = homeworldUrl.split('/').filter(Boolean).pop();
        const homeworld = await swapi_service_1.swapiService.getPlanet(parseInt(homeworldId || '1', 10));
        // Get weather data based on planet
        const location = PLANET_TO_LOCATION[homeworld.name] || { city: 'London', countryCode: 'GB' };
        const weather = await this.weatherService.getWeatherByCity(location.city, location.countryCode);
        const result = {
            character: {
                name: character.name,
                height: character.height,
                mass: character.mass,
                gender: character.gender,
                birth_year: character.birth_year
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
    }
    async getCachedData(key) {
        try {
            const now = Math.floor(Date.now() / 1000);
            const item = await dynamodb_service_1.DynamoDBService.getItem(key, 'DATA');
            if (!item)
                return null;
            // Check if cache is still valid
            if (item.ttl < now) {
                console.log('Cache expired');
                return null;
            }
            return item;
        }
        catch (error) {
            console.error('Error getting cached data:', error);
            return null;
        }
    }
    async cacheData(key, data) {
        try {
            const ttl = Math.floor(Date.now() / 1000) + FusionService.CACHE_TTL;
            await dynamodb_service_1.DynamoDBService.putItem({
                PK: key,
                SK: 'DATA',
                data,
                ttl,
                type: 'CACHE',
            });
            // Also store in history
            await dynamodb_service_1.DynamoDBService.putItem({
                PK: `HISTORY#${Date.now()}`,
                SK: key,
                data,
                ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days TTL for history
                type: 'HISTORY',
            });
        }
        catch (error) {
            console.error('Error caching data:', error);
        }
    }
}
exports.FusionService = FusionService;
FusionService.CACHE_TTL = parseInt(process.env.CACHE_TTL || '1800', 10);
exports.fusionService = new FusionService();
