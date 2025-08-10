"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = exports.weatherService = void 0;
const http_client_1 = require("../utils/http-client");
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY || '';
        if (!this.apiKey) {
            console.warn('OPENWEATHER_API_KEY is not set. Weather data will be mocked.');
        }
        this.http = new http_client_1.HttpClient(BASE_URL);
    }
    async getWeatherData(endpoint, params = {}) {
        try {
            // If no API key is set, return mock data
            if (!this.apiKey) {
                return this.getMockWeatherData();
            }
            const response = await this.http.get(endpoint, {
                params: {
                    ...params,
                    appid: this.apiKey,
                    units: 'metric', // Use metric units (Celsius)
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching weather data:', error);
            // Return mock data in case of error
            return this.getMockWeatherData();
        }
    }
    async getWeatherByCity(city, countryCode) {
        const query = countryCode ? `${city},${countryCode}` : city;
        return this.getWeatherData('/weather', { q: query });
    }
    async getWeatherByCoordinates(lat, lon) {
        return this.getWeatherData('/weather', { lat, lon });
    }
    getMockWeatherData() {
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
exports.WeatherService = WeatherService;
exports.weatherService = new WeatherService();
