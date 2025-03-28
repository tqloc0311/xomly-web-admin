import { AuthTokens } from "@/domain/entities/auth.entity";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";
import { ApiServiceFactory } from "../network/api-service.factory";

export class AuthService {
  private apiClient;

  constructor() {
    this.apiClient = ApiServiceFactory.getInstance().getApiClient();
  }

  async loginWithIdToken(idToken: string): Promise<AuthTokens> {
    try {
      const data = await this.apiClient.post<AuthTokens>("/auth/login", {
        idToken,
      });

      if (!data.accessToken || !data.refreshToken) {
        throw new AuthError("Invalid response format", AuthErrorCodes.SERVER_ERROR);
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to login", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const data = await this.apiClient.post<AuthTokens>("/auth/refresh-token", {
        refreshToken,
      });

      if (!data.accessToken || !data.refreshToken) {
        throw new AuthError("Invalid response format", AuthErrorCodes.SERVER_ERROR);
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to refresh token", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }
}
