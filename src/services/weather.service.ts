import { HttpClient } from '../utils/http-client';

interface Coordinates {
  lat: number;
  lon: number;
}

export interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WeatherResponse {
  coord: Coordinates;
  weather: Weather[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  private http: HttpClient;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENWEATHER_API_KEY is not set. Weather data will be mocked.');
    }
    this.http = new HttpClient(BASE_URL);
  }

  private async getWeatherData(endpoint: string, params: Record<string, string | number> = {}) {
    try {
      // If no API key is set, return mock data
      if (!this.apiKey) {
        return this.getMockWeatherData();
      }

      const response = await this.http.get<WeatherResponse>(endpoint, {
        params: {
          ...params,
          appid: this.apiKey,
          units: 'metric', // Use metric units (Celsius)
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return mock data in case of error
      return this.getMockWeatherData();
    }
  }

  async getWeatherByCity(city: string, countryCode?: string): Promise<WeatherResponse> {
    const query = countryCode ? `${city},${countryCode}` : city;
    return this.getWeatherData('/weather', { q: query });
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherResponse> {
    return this.getWeatherData('/weather', { lat, lon });
  }

  private getMockWeatherData(): WeatherResponse {
    return {
      coord: { lon: -0.1257, lat: 51.5085 },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      base: 'stations',
      main: {
        temp: 22.5,
        feels_like: 22.3,
        temp_min: 20.5,
        temp_max: 24.5,
        pressure: 1012,
        humidity: 65,
        sea_level: 1012,
        grnd_level: 1009
      },
      visibility: 10000,
      wind: {
        speed: 3.6,
        deg: 200,
        gust: 5.8
      },
      clouds: {
        all: 0
      },
      dt: Math.floor(Date.now() / 1000),
      sys: {
        type: 2,
        id: 2019646,
        country: 'GB',
        sunrise: Math.floor(Date.now() / 1000) - 3600 * 5, // 5 hours ago
        sunset: Math.floor(Date.now() / 1000) + 3600 * 7 // 7 hours from now
      },
      timezone: 0,
      id: 2643743,
      name: 'London',
      cod: 200
    };
  }
}

export const weatherService = new WeatherService();

export { WeatherService };
