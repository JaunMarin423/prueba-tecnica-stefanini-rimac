import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    // Create a custom agent that ignores SSL certificate errors in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const httpsAgent = isDevelopment 
      ? new https.Agent({ rejectUnauthorized: false })
      : new https.Agent();

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
      },
      timeout: 10000, // 10 seconds
      httpsAgent,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(
            `[HTTP Response Error] Status: ${error.response.status}`,
            error.response.data
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error('[HTTP No Response]', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('[HTTP Request Setup Error]', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }
}
