import { AuthRepository } from "@/domain/repositories/auth.repository";
import { User } from "@/domain/entities/user.entity";
import { AuthTokens, AuthCredentials } from "@/domain/entities/auth.entity";
import { AuthService } from "@/infrastructure/services/auth.service";
import { FirebaseAuthService } from "@/infrastructure/services/firebase-auth.service";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";
import { CookieService } from "@/infrastructure/services/cookie.service";

export class AuthRepositoryImpl implements AuthRepository {
  private authService: AuthService;
  private firebaseAuthService: FirebaseAuthService;
  private cookieService: CookieService;

  constructor() {
    this.authService = new AuthService();
    this.firebaseAuthService = new FirebaseAuthService();
    this.cookieService = CookieService.getInstance();
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

      // Cookies are set in the middleware for server-side operations
      // For client-side operations, we still set them here
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
    return this.cookieService.getStoredTokens();
  }

  setStoredTokens(tokens: AuthTokens): void {
    this.cookieService.setStoredTokens(tokens);
  }

  clearStoredTokens(): void {
    this.cookieService.clearStoredTokens();
  }

  getStoredUser(): User | null {
    return this.cookieService.getStoredUser();
  }

  setStoredUser(user: User): void {
    this.cookieService.setStoredUser(user);
  }

  clearStoredUser(): void {
    this.cookieService.clearStoredUser();
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
