"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapiService = void 0;
const http_client_1 = require("../utils/http-client");
const BASE_URL = 'https://swapi.dev/api';
class SwapiService {
    constructor() {
        this.http = new http_client_1.HttpClient(BASE_URL);
    }
    async getPlanets(page = 1) {
        const response = await this.http.get(`/planets/?page=${page}`);
        return response.data;
    }
    async getPlanet(id) {
        const response = await this.http.get(`/planets/${id}/`);
        return response.data;
    }
    async getCharacters(page = 1) {
        const response = await this.http.get(`/people/?page=${page}`);
        return response.data;
    }
    async getCharacter(id) {
        const response = await this.http.get(`/people/${id}/`);
        return response.data;
    }
    async searchPlanets(search) {
        const response = await this.http.get(`/planets/?search=${encodeURIComponent(search)}`);
        return response.data;
    }
    async searchCharacters(search) {
        const response = await this.http.get(`/people/?search=${encodeURIComponent(search)}`);
        return response.data;
    }
}
exports.swapiService = new SwapiService();
