import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";

export interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // Remove leading slash from endpoint if present
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = new URL(normalizedEndpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new AuthError("Unauthorized", AuthErrorCodes.TOKEN_ERROR);
        case 403:
          throw new AuthError("Forbidden", AuthErrorCodes.TOKEN_ERROR);
        case 404:
          throw new AuthError("Not found", AuthErrorCodes.SERVER_ERROR);
        case 429:
          throw new AuthError("Too many requests", AuthErrorCodes.SERVER_ERROR);
        case 500:
          throw new AuthError("Server error", AuthErrorCodes.SERVER_ERROR);
        default:
          throw new AuthError(`HTTP error! status: ${response.status}`, AuthErrorCodes.SERVER_ERROR);
      }
    }

    return response.json();
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      const { params, ...restConfig } = config;
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        ...restConfig,
        method: "GET",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError("Network error", AuthErrorCodes.NETWORK_ERROR);
      }
      throw new AuthError("Request failed", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async post<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    try {
      const { params, ...restConfig } = config;
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        ...restConfig,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...restConfig.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError("Network error", AuthErrorCodes.NETWORK_ERROR);
      }
      throw new AuthError("Request failed", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async put<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    try {
      const { params, ...restConfig } = config;
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        ...restConfig,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...restConfig.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError("Network error", AuthErrorCodes.NETWORK_ERROR);
      }
      throw new AuthError("Request failed", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      const { params, ...restConfig } = config;
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        ...restConfig,
        method: "DELETE",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new AuthError("Network error", AuthErrorCodes.NETWORK_ERROR);
      }
      throw new AuthError("Request failed", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }
}
