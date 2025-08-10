import { handler as getCombinedData } from '../../src/functions/getCombinedData/handler';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { createAPIGatewayEvent, createContext } from './test-utils';
import axios from 'axios';
import { setupTestEnvironment } from './setup';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the HttpClient interceptors
const mockRequestInterceptor = jest.fn((config) => {
  console.log(`[MOCK HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

const mockResponseInterceptor = jest.fn((response) => response);

// Create a proper mock for axios instance
const createAxiosInstance = () => {
  // Create a minimal implementation of AxiosInstance
  const instance = {
    ...mockedAxios,
    interceptors: {
      request: {
        use: mockRequestInterceptor,
        eject: jest.fn(),
        clear: jest.fn(),
      },
      response: {
        use: mockResponseInterceptor,
        eject: jest.fn(),
        clear: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    patch: jest.fn(),
    defaults: {
      ...mockedAxios.defaults,
      headers: {
        ...mockedAxios.defaults.headers,
        common: {},
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      },
    },
  };
  return instance as unknown as jest.Mocked<typeof axios>;
};

// Mock axios.create to return our mocked instance
mockedAxios.create.mockImplementation(createAxiosInstance);

// Mock the callback function
const mockCallback: Callback<APIGatewayProxyResult> = (error, result) => {
  if (error) throw error;
  return result as APIGatewayProxyResult;
};

// Set up mock responses
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset the axios instance mock
  const instance = createAxiosInstance();
  mockedAxios.create.mockImplementation(() => instance);
  
  // Mock successful responses
  instance.get.mockImplementation((url) => {
    if (url.includes('swapi.dev/api/people/1')) {
      return Promise.resolve({
        data: MOCK_CHARACTER,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url, method: 'get' },
      });
    }
    if (url.includes('api.openweathermap.org')) {
      return Promise.resolve({
        data: MOCK_WEATHER,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url, method: 'get' },
      });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
});

// Mock SWAPI and OpenWeather API responses
const MOCK_CHARACTER = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.dev/api/planets/1/',
  films: [],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.dev/api/people/1/'
};

const MOCK_PLANET = {
  name: 'Tatooine',
  climate: 'arid',
  terrain: 'desert'
};

const MOCK_WEATHER = {
  weather: [{ description: 'clear sky' }],
  main: { temp: 25, humidity: 60 },
  wind: { speed: 3.1 },
  name: 'Tatooine'
};

describe('GET /fusionados/{id}', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestEnvironment();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return combined character and weather data', async () => {
    // Create test event
    const event = createAPIGatewayEvent('GET', '/fusionados/1', undefined, { id: '1' });
    const context = createContext();
    
    // Execute the handler with the correct signature
    const response = await getCombinedData(event, context, mockCallback) as APIGatewayProxyResult;
    
    // Verify response is defined and has the expected structure
    // Verify the API was called with the correct URL
    expect(mockedAxios.create().get).toHaveBeenCalledWith(expect.stringContaining('swapi.dev/api/people/1'));
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Parse the response body
    const body = JSON.parse(response.body);
    
    // Check if the response has the expected structure
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    // Verify the data structure matches what the handler returns
    const { data } = body;
    expect(data).toHaveProperty('character');
    expect(data).toHaveProperty('weather');
    
    // Verify character data
    expect(data.character).toMatchObject(MOCK_CHARACTER);
    
    // Verify weather data
    expect(data.weather).toMatchObject({
      description: expect.any(String),
      temperature: expect.any(Number)
    });
  });
  
  it('should return 404 for non-existent character', async () => {
    // Mock 404 response from SWAPI
    nock('https://swapi.dev')
      .get('/api/people/999')
      .reply(404, { detail: 'Not found' });
    
    const event = createAPIGatewayEvent('GET', '/fusionados/999', undefined, { id: '999' });
    const context = createContext();
    
    // Execute the handler with the correct signature
    const response = await getCombinedData(event, context, mockCallback) as APIGatewayProxyResult;
    
    // Verify response is defined and has the expected structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode');
    expect(response).toHaveProperty('body');
    
    // Type assertion to tell TypeScript that response is APIGatewayProxyResult
    const typedResponse = response as import('aws-lambda').APIGatewayProxyResult;
    
    expect(typedResponse.statusCode).toBe(404);
    expect(JSON.parse(typedResponse.body).message).toContain('not found');
  });
});
