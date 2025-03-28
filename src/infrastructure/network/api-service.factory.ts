import { ApiClient } from "./api-client";

export class ApiServiceFactory {
  private static instance: ApiServiceFactory;
  private apiClient: ApiClient;

  private constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/";
    this.apiClient = new ApiClient(baseURL);
  }

  public static getInstance(): ApiServiceFactory {
    if (!ApiServiceFactory.instance) {
      ApiServiceFactory.instance = new ApiServiceFactory();
    }
    return ApiServiceFactory.instance;
  }

  public getApiClient(): ApiClient {
    return this.apiClient;
  }
}
