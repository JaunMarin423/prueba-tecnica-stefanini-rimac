import { AxiosHeaders } from 'axios';
import { WeatherService, WeatherResponse } from '../weather.service';
import { HttpClient } from '../../utils/http-client';

// Mock the HttpClient
jest.mock('../../utils/http-client');

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// Helper function to create Axios headers
const createAxiosHeaders = () => {
  const headers = new AxiosHeaders();
  return headers;
};

describe('WeatherService', () => {
  let service: WeatherService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  
  // Mock data
  const mockWeatherData = {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
    ],
    base: 'stations',
    main: {
      temp: 22.5,
      feels_like: 22.5,
      temp_min: 20,
      temp_max: 25,
      pressure: 1012,
      humidity: 64
    },
    visibility: 10000,
    wind: {
      speed: 3.6,
      deg: 200
    },
    clouds: {
      all: 0
    },
    dt: 1630000000,
    sys: {
      type: 2,
      id: 2019646,
      country: 'GB',
      sunrise: 1629950000,
      sunset: 1630000000
    },
    timezone: 3600,
    id: 2643743,
    name: 'London',
    cod: 200
  };

  // Mock Axios response
  const mockWeatherResponse = {
    data: mockWeatherData,
    status: 200,
    statusText: 'OK',
    headers: createAxiosHeaders(),
    config: {
      headers: createAxiosHeaders()
    },
    request: {}
  };

  beforeEach(() => {
    // Create a fresh mock HTTP client for each test
    mockHttpClient = new MockHttpClient('https://api.openweathermap.org/data/2.5') as jest.Mocked<HttpClient>;
    
    // Create a fresh service instance for each test
    service = new WeatherService();
    
    // Replace the HTTP client with our mock
    (service as any).http = mockHttpClient;
    
    // Set a mock API key for testing
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the default mock implementation
    mockHttpClient.get.mockResolvedValue(mockWeatherResponse);
  });

  describe('getWeatherByCity', () => {
    it('should fetch and return weather data for a city', async () => {
      const result = await service.getWeatherByCity('Test City');
      
      // Verify the response matches the expected structure
      expect(result).toEqual(mockWeatherResponse);
      
      // Verify the HTTP client was called with the correct parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/weather',
        expect.objectContaining({
          q: 'Test City',
          appid: 'test-api-key',
          units: 'metric'
        })
      );
    });

    it('should throw an error if the city is not found', async () => {
      // Mock a 404 response
      const error = new Error('City not found');
      (error as any).response = { status: 404 };
      mockHttpClient.get.mockRejectedValueOnce(error);
      
      await expect(service.getWeatherByCity('Nonexistent City')).rejects.toThrow('Failed to fetch weather data');
    });

    it('should handle network errors', async () => {
      // Mock a network error
      mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(service.getWeatherByCity('Test City')).rejects.toThrow('Failed to fetch weather data');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch and return weather data for coordinates', async () => {
      const result = await service.getWeatherByCoordinates(51.5085, -0.1257);
      
      // Verify the response matches the expected structure
      expect(result).toEqual(mockWeatherResponse);
      
      // Verify the HTTP client was called with the correct parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/weather',
        expect.objectContaining({
          lat: 51.5085,
          lon: -0.1257,
          appid: 'test-api-key',
          units: 'metric'
        })
      );
    });
  });
  
  describe('getMockWeatherData', () => {
    it('should return mock weather data when API key is not set', async () => {
      // Set API key to empty string
      (service as any).apiKey = '';
      
      const result = await (service as any).getMockWeatherData();
      
      // Verify the response has the expected structure
      expect(result).toHaveProperty('weather');
      expect(result).toHaveProperty('main');
      expect(result).toHaveProperty('wind');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('location', 'Test City');
    });
  });

  describe('temperature conversion', () => {
    it('should handle temperature conversion in the response', async () => {
      // Test that the service properly handles temperature values in the response
      const testData = {
        ...mockWeatherData,
        main: {
          ...mockWeatherData.main,
          temp: 298.15, // 25°C
          feels_like: 300.15, // 27°C
          temp_min: 293.15, // 20°C
          temp_max: 303.15 // 30°C
        }
      };
      
      mockHttpClient.get.mockResolvedValueOnce({
        ...mockWeatherResponse,
        data: testData
      });
      
      const result = await service.getWeatherByCity('Test City');
      
      // Verify the temperature values are in the expected format
      expect(result.main.temp).toBe(298.15);
      expect(result.main.feels_like).toBe(300.15);
      expect(result.main.temp_min).toBe(293.15);
      expect(result.main.temp_max).toBe(303.15);
    });
  });

  describe('temperature handling', () => {
    it('should return temperature values in the correct format', async () => {
      const testData = {
        ...mockWeatherData,
        main: {
          ...mockWeatherData.main,
          temp: 298.15, // 25°C
          feels_like: 300.15, // 27°C
          temp_min: 293.15, // 20°C
          temp_max: 303.15 // 30°C
        }
      };
      
      mockHttpClient.get.mockResolvedValueOnce({
        ...mockWeatherResponse,
        data: testData
      });
      
      const result = await service.getWeatherByCity('Test City');
      
      // Verify the temperature values are in the expected format
      expect(result.main.temp).toBe(298.15);
      expect(result.main.feels_like).toBe(300.15);
      expect(result.main.temp_min).toBe(293.15);
      expect(result.main.temp_max).toBe(303.15);
    });
  });
});
