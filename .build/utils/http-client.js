"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
class HttpClient {
    constructor(baseURL, defaultHeaders = {}) {
        // Create a custom agent that ignores SSL certificate errors in development
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const httpsAgent = isDevelopment
            ? new https_1.default.Agent({ rejectUnauthorized: false })
            : new https_1.default.Agent();
        this.client = axios_1.default.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...defaultHeaders,
            },
            timeout: 10000, // 10 seconds
            httpsAgent,
        });
        // Add request interceptor for logging
        this.client.interceptors.request.use((config) => {
            console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            console.error('[HTTP Request Error]', error);
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(`[HTTP Response Error] Status: ${error.response.status}`, error.response.data);
            }
            else if (error.request) {
                // The request was made but no response was received
                console.error('[HTTP No Response]', error.request);
            }
            else {
                // Something happened in setting up the request that triggered an Error
                console.error('[HTTP Request Setup Error]', error.message);
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        return this.client.get(url, config);
    }
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
}
exports.HttpClient = HttpClient;
