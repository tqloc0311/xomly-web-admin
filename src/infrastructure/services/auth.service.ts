import { AuthTokens, ServerAuthResponse } from "@/domain/entities/auth.entity";
import { User } from "@/domain/entities/user.entity";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";
import { ApiServiceFactory } from "../network/api-service.factory";

export class AuthService {
  private apiClient;

  constructor() {
    this.apiClient = ApiServiceFactory.getInstance().getApiClient();
  }

  async loginWithIdToken(idToken: string): Promise<{ credentials: AuthTokens; user: User }> {
    try {
      const data = await this.apiClient.post<ServerAuthResponse>("/auth/login", {
        idToken,
      });

      if (!data.credentials?.accessToken || !data.credentials?.refreshToken || !data.user) {
        throw new AuthError("Invalid response format", AuthErrorCodes.SERVER_ERROR);
      }

      return {
        credentials: data.credentials,
        user: data.user,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to login", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ credentials: AuthTokens; user: User }> {
    try {
      const data = await this.apiClient.post<ServerAuthResponse>("/auth/refresh-token", {
        refreshToken,
      });

      if (!data.credentials?.accessToken || !data.credentials?.refreshToken || !data.user) {
        throw new AuthError("Invalid response format", AuthErrorCodes.SERVER_ERROR);
      }

      return {
        credentials: data.credentials,
        user: data.user,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to refresh token", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }
}
