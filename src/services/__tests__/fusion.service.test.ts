import { FusionService } from '../fusion.service';
import { swapiService } from '../swapi.service';
import { weatherService } from '../weather.service';

// Mock the dependencies
jest.mock('../swapi.service', () => ({
  swapiService: {
    getCharacter: jest.fn(),
    getCharacters: jest.fn(),
    getPlanet: jest.fn(),
  }
}));

jest.mock('../weather.service', () => ({
  weatherService: {
    getWeatherByCity: jest.fn(),
  }
}));

describe('FusionService', () => {
  let service: FusionService;

  const mockCharacter = {
    name: 'Luke Skywalker',
    height: '172',
    mass: '77',
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: 'Tatooine',
    climate: 'arid',
    films: [],
    species: [],
    vehicles: [],
    starships: [],
    created: '',
    edited: '',
    url: 'https://swapi.dev/api/people/1/'
  };

  const mockWeatherData = {
    description: 'clear sky',
    temperature: 25,
    humidity: 60,
    windSpeed: 3.1,
    location: 'Tatooine'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (swapiService.getCharacter as jest.Mock).mockResolvedValue(mockCharacter);
    (weatherService.getWeatherByCity as jest.Mock).mockResolvedValue(mockWeatherData);
    
    // Create the service with the mocked dependencies
    service = new FusionService();
  });

  describe('getFusedData', () => {
    it('should combine character data with weather data', async () => {
      const result = await service.getFusedData('1');
      
      expect(result).toEqual({
        character: {
          name: mockCharacter.name,
          height: mockCharacter.height,
          mass: mockCharacter.mass,
          gender: mockCharacter.gender,
          birth_year: mockCharacter.birth_year,
          homeworld: 'Tatooine'
        },
        weather: mockWeatherData
      });
      
      expect(swapiService.getCharacter).toHaveBeenCalledWith(1); // Note: The service converts string ID to number
      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Tunis');
    });
    
    it('should return a list of characters with weather information when no characterId is provided', async () => {
      const mockCharacters = {
        count: 1,
        results: [{
          ...mockCharacter,
          homeworld: 'https://swapi.dev/api/planets/1/'
        }]
      };
      
      (swapiService.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
      
      const result = await service.getFusedData();
      
      expect(result).toMatchObject({
        count: 1,
        results: [{
          name: mockCharacter.name,
          height: mockCharacter.height,
          mass: mockCharacter.mass,
          gender: mockCharacter.gender,
          birth_year: mockCharacter.birth_year,
          homeworld: 'Tatooine'
        }],
        weather: mockWeatherData
      });
      
      expect(swapiService.getCharacters).toHaveBeenCalled();
      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Tunis');
    });
  });

  describe('getFusedData', () => {
    it('should return character data with weather information when characterId is provided', async () => {
      const characterId = '1';
      const planetData = {
        name: 'Tatooine',
        climate: 'arid',
        terrain: 'desert',
        population: '200000',
        url: 'https://swapi.dev/api/planets/1/'
      };
      
      // Mock the swapiService.getCharacter method
      (swapiService.getCharacter as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        homeworld: 'https://swapi.dev/api/planets/1/'
      });
      
      // Mock the swapiService.getPlanet method
      (swapiService.getPlanet as jest.Mock).mockResolvedValue(planetData);
      
      // Mock the weatherService.getWeatherByCity method
      (weatherService.getWeatherByCity as jest.Mock).mockResolvedValue(mockWeatherData);
      
      const result = await service.getFusedData(characterId);
      
      expect(result).toMatchObject({
        character: {
          name: mockCharacter.name,
          height: mockCharacter.height,
          mass: mockCharacter.mass,
          gender: mockCharacter.gender,
          birth_year: mockCharacter.birth_year,
          homeworld: planetData.name
        },
        planet: planetData,
        weather: mockWeatherData
      });
      
      expect(swapiService.getCharacter).toHaveBeenCalledWith(1);
      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Tunis');
    });
    
    it('should return a list of characters with weather information when no characterId is provided', async () => {
      const planetData = {
        name: 'Tatooine',
        climate: 'arid',
        terrain: 'desert',
        population: '200000',
        url: 'https://swapi.dev/api/planets/1/'
      };
      
      const mockCharacters = {
        count: 1,
        results: [{
          ...mockCharacter,
          homeworld: 'https://swapi.dev/api/planets/1/'
        }]
      };
      
      // Mock the swapiService.getCharacters method
      (swapiService.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
      
      // Mock the swapiService.getPlanet method
      (swapiService.getPlanet as jest.Mock).mockResolvedValue(planetData);
      
      // Mock the weatherService.getWeatherByCity method
      (weatherService.getWeatherByCity as jest.Mock).mockResolvedValue(mockWeatherData);
      
      const result = await service.getFusedData();
      
      expect(result).toMatchObject({
        count: 1,
        results: [{
          name: mockCharacter.name,
          height: mockCharacter.height,
          mass: mockCharacter.mass,
          gender: mockCharacter.gender,
          birth_year: mockCharacter.birth_year,
          homeworld: planetData.name
        }],
        weather: mockWeatherData
      });
      
      expect(swapiService.getCharacters).toHaveBeenCalled();
      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Tunis');
    });
    
    it('should handle errors when fetching character data', async () => {
      const characterId = '999';
      
      // Mock the swapiService.getCharacter method to throw an error
      (swapiService.getCharacter as jest.Mock).mockRejectedValue(new Error('Character not found'));
      
      await expect(service.getFusedData(characterId)).rejects.toThrow('Character not found');
    });
    
    it('should handle errors when fetching weather data', async () => {
      const characterId = '1';
      const planetData = {
        name: 'Tatooine',
        climate: 'arid',
        terrain: 'desert',
        population: '200000',
        url: 'https://swapi.dev/api/planets/1/'
      };
      
      // Mock the swapiService.getCharacter method
      (swapiService.getCharacter as jest.Mock).mockResolvedValue({
        ...mockCharacter,
        homeworld: 'https://swapi.dev/api/planets/1/'
      });
      
      // Mock the swapiService.getPlanet method
      (swapiService.getPlanet as jest.Mock).mockResolvedValue(planetData);
      
      // Mock the weatherService.getWeatherByCity method to throw an error
      (weatherService.getWeatherByCity as jest.Mock).mockRejectedValue(new Error('Weather service unavailable'));
      
      const result = await service.getFusedData(characterId);
      
      // The service should still return the character data even if weather fetch fails
      expect(result).toMatchObject({
        character: {
          name: mockCharacter.name,
          height: mockCharacter.height,
          mass: mockCharacter.mass,
          gender: mockCharacter.gender,
          birth_year: mockCharacter.birth_year,
          homeworld: planetData.name
        },
        planet: planetData
      });
      
      // The weather property should be undefined or null when the weather fetch fails
      expect(result.weather).toBeUndefined();
    });
  });
});
