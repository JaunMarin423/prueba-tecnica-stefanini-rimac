import { HttpClient } from '../utils/http-client';

export interface Planet {
  name: string;
  climate: string;
  terrain: string;
  population: string;
  films: string[];
  residents: string[];
  url: string;
}

export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  url: string;
}

export interface SwapiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE_URL = 'https://swapi.dev/api';

class SwapiService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient(BASE_URL);
  }

  async getPlanets(page = 1): Promise<SwapiResponse<Planet>> {
    const response = await this.http.get<SwapiResponse<Planet>>(`/planets/?page=${page}`);
    return response.data;
  }

  async getPlanet(id: number): Promise<Planet> {
    const response = await this.http.get<Planet>(`/planets/${id}/`);
    return response.data;
  }

  async getCharacters(page = 1): Promise<SwapiResponse<Character>> {
    const response = await this.http.get<SwapiResponse<Character>>(`/people/?page=${page}`);
    return response.data;
  }

  async getCharacter(id: number): Promise<Character> {
    const response = await this.http.get<Character>(`/people/${id}/`);
    return response.data;
  }

  async searchPlanets(search: string): Promise<SwapiResponse<Planet>> {
    const response = await this.http.get<SwapiResponse<Planet>>(`/planets/?search=${encodeURIComponent(search)}`);
    return response.data;
  }

  async searchCharacters(search: string): Promise<SwapiResponse<Character>> {
    const response = await this.http.get<SwapiResponse<Character>>(`/people/?search=${encodeURIComponent(search)}`);
    return response.data;
  }
}

export const swapiService = new SwapiService();
