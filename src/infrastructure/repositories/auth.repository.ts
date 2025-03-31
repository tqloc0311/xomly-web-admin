import { AuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/entities/user.entity";
import { AuthTokens, AuthCredentials } from "@/domain/entities/auth.entity";
import { AuthService } from "@/infrastructure/services/auth.service";
import { FirebaseAuthService } from "@/infrastructure/services/firebase-auth.service";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";
import Cookies from "js-cookie";

const TOKENS_COOKIE_KEY = "auth_tokens";
const USER_COOKIE_KEY = "auth_user";

export class AuthRepositoryImpl implements AuthRepository {
  private authService: AuthService;
  private firebaseAuthService: FirebaseAuthService;

  constructor() {
    this.authService = new AuthService();
    this.firebaseAuthService = new FirebaseAuthService();
  }

  async login(credentials: AuthCredentials): Promise<{ credentials: AuthTokens; user: User }> {
    try {
      const { idToken } = await this.firebaseAuthService.signInWithEmailAndPassword(
        credentials.email,
        credentials.password,
      );

      const serverResponse = await this.authService.loginWithIdToken(idToken);
      this.setStoredTokens(serverResponse.credentials);
      this.setStoredUser(serverResponse.user);
      return serverResponse;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to login", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async loginWithCustomToken(customToken: string): Promise<{ credentials: AuthTokens; user: User }> {
    try {
      const { idToken } = await this.firebaseAuthService.signInWithCustomToken(customToken);

      const serverResponse = await this.authService.loginWithIdToken(idToken);

      // TODO: this doesn't work
      this.setStoredTokens(serverResponse.credentials);
      this.setStoredUser(serverResponse.user);
      return serverResponse;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to login with custom token", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.firebaseAuthService.signOut();
      this.clearStoredTokens();
      this.clearStoredUser();
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to logout", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.firebaseAuthService.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.firebaseAuthService.onAuthStateChanged(callback);
  }

  getStoredTokens(): AuthTokens | null {
    try {
      const tokens = Cookies.get(TOKENS_COOKIE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      throw new AuthError("Failed to retrieve stored tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  setStoredTokens(tokens: AuthTokens): void {
    console.log("🚀 ~ auth.repository.ts:89 ~ AuthRepositoryImpl ~ setStoredTokens ~ tokens:", tokens);

    try {
      Cookies.set(TOKENS_COOKIE_KEY, JSON.stringify(tokens), {
        expires: 7, // Token expires in 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    } catch (error) {
      throw new AuthError("Failed to store tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  clearStoredTokens(): void {
    try {
      Cookies.remove(TOKENS_COOKIE_KEY);
    } catch (error) {
      throw new AuthError("Failed to clear stored tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  getStoredUser(): User | null {
    try {
      const user = Cookies.get(USER_COOKIE_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      throw new AuthError("Failed to retrieve stored user", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  setStoredUser(user: User): void {
    try {
      Cookies.set(USER_COOKIE_KEY, JSON.stringify(user), {
        expires: 7, // User data expires in 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    } catch (error) {
      throw new AuthError("Failed to store user data", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  clearStoredUser(): void {
    try {
      Cookies.remove(USER_COOKIE_KEY);
    } catch (error) {
      throw new AuthError("Failed to clear stored user data", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  async refreshTokens(): Promise<{ credentials: AuthTokens; user: User } | null> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens?.refreshToken) {
        return null;
      }

      const serverResponse = await this.authService.refreshToken(tokens.refreshToken);
      this.setStoredTokens(serverResponse.credentials);
      this.setStoredUser(serverResponse.user);
      return serverResponse;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to refresh tokens", AuthErrorCodes.UNKNOWN_ERROR);
    }
  }

  async shouldRefreshToken(): Promise<boolean> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens?.accessToken) {
        return false;
      }

      // Check if the token is close to expiring (within 5 minutes)
      const tokenData = JSON.parse(atob(tokens.accessToken.split(".")[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      return expirationTime - currentTime < fiveMinutes;
    } catch (error) {
      // If we can't parse the token, assume it needs refresh
      return true;
    }
  }
}
