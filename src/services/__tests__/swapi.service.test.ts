import { AxiosHeaders } from 'axios';
import { swapiService } from '../swapi.service';
import { HttpClient } from '../../utils/http-client';

// Mock the HttpClient
jest.mock('../../utils/http-client');

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// Helper function to create a mock Axios response
const createMockAxiosResponse = <T>(data: T, status = 200, statusText = 'OK') => ({
  data,
  status,
  statusText,
  headers: new AxiosHeaders(),
  config: {
    headers: new AxiosHeaders()
  },
  request: {}
});

describe('SWAPIService', () => {
  let service: typeof swapiService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  
  const mockCharacter = {
    name: 'Luke Skywalker',
    height: '172',
    homeworld: 'https://swapi.dev/api/planets/1/'
  };
  
  const mockPlanet = {
    name: 'Tatooine',
    climate: 'arid'
  };

  beforeEach(() => {
    // Create a fresh mock HTTP client for each test
    mockHttpClient = new MockHttpClient('https://swapi.dev/api') as jest.Mocked<HttpClient>;
    
    // Reset the service instance before each test
    service = swapiService;
    
    // Replace the HTTP client with our mock
    (service as any).http = mockHttpClient;
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementation
    mockHttpClient.get.mockResolvedValue(createMockAxiosResponse({}));
  });

  describe('getCharacter', () => {
    it('should fetch and return character data', async () => {
      // Mock the HTTP client response for character data
      mockHttpClient.get.mockResolvedValueOnce(createMockAxiosResponse({
        count: 1,
        next: null,
        previous: null,
        results: [{
          ...mockCharacter,
          films: [],
          species: [],
          vehicles: [],
          starships: [],
          created: '',
          edited: '',
          url: 'https://swapi.dev/api/people/1/'
        }]
      }));

      // Mock the HTTP client response for planet data
      mockHttpClient.get.mockResolvedValueOnce(createMockAxiosResponse(mockPlanet));

      const result = await service.getCharacter(1);
      
      expect(result).toEqual({
        ...mockCharacter,
        homeworld: mockPlanet.name,
        climate: mockPlanet.climate
      });
      
      // Verify fetch was called with the correct URL
      expect(mockHttpClient.get).toHaveBeenCalledWith('https://swapi.dev/api/people/1/');
    });

    it('should throw an error when character is not found', async () => {
      // Mock a 404 response
      const error = new Error('Not found');
      (error as any).response = { status: 404 };
      mockHttpClient.get.mockRejectedValueOnce(error);
      
      await expect(service.getCharacter(999)).rejects.toThrow('Character not found');
      
      // Verify the correct URL was called
      expect(mockHttpClient.get).toHaveBeenCalledWith('https://swapi.dev/api/people/999/');
    });
  });

  describe('getPlanet', () => {
    it('should fetch and return planet data', async () => {
      const planetId = 1;
      const planetUrl = `https://swapi.dev/api/planets/${planetId}/`;
      
      mockHttpClient.get.mockResolvedValueOnce(createMockAxiosResponse({
        ...mockPlanet,
        url: planetUrl
      }));

      const result = await service.getPlanet(planetId);
      
      expect(result).toEqual({
        ...mockPlanet,
        url: planetUrl
      });
      expect(mockHttpClient.get).toHaveBeenCalledWith(planetUrl);
    });

    it('should throw an error when planet is not found', async () => {
      const planetId = 999;
      const planetUrl = `https://swapi.dev/api/planets/${planetId}/`;
      
      mockHttpClient.get.mockRejectedValueOnce({
        response: {
          status: 404
        }
      });
      
      await expect(service.getPlanet(planetId)).rejects.toThrow('Planet not found');
    });
  });

  describe('getCharacters', () => {
    it('should fetch and return a list of characters', async () => {
      const mockCharacters = {
        count: 1,
        next: null,
        previous: null,
        results: [{
          ...mockCharacter,
          url: 'https://swapi.dev/api/people/1/'
        }]
      };
      
      mockHttpClient.get.mockResolvedValueOnce(createMockAxiosResponse(mockCharacters));

      // Mock planet response for each character
      mockHttpClient.get.mockResolvedValue(createMockAxiosResponse(mockPlanet));

      const result = await service.getCharacters();
      
      expect(result).toEqual([{
        ...mockCharacter,
        homeworld: mockPlanet.name,
        climate: mockPlanet.climate
      }]);
      
      // Verify the correct URL was called
      expect(mockHttpClient.get).toHaveBeenCalledWith('https://swapi.dev/api/people/');
    });
  });
});
