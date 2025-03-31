import { User } from "../entities/user.entity";
import { AuthTokens, AuthCredentials } from "../entities/auth.entity";

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<{ credentials: AuthTokens; user: User }>;
  loginWithCustomToken(customToken: string): Promise<{ credentials: AuthTokens; user: User }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  getStoredTokens(): AuthTokens | null;
  setStoredTokens(tokens: AuthTokens): void;
  clearStoredTokens(): void;
  getStoredUser(): User | null;
  setStoredUser(user: User): void;
  clearStoredUser(): void;
  refreshTokens(): Promise<{ credentials: AuthTokens; user: User } | null>;
  shouldRefreshToken(): Promise<boolean>;
}
