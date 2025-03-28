import { User, AuthCredentials } from "../entities/user.entity";
import { AuthTokens } from "../entities/auth.entity";

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<AuthTokens>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  getStoredTokens(): AuthTokens | null;
  setStoredTokens(tokens: AuthTokens): void;
  clearStoredTokens(): void;
  refreshTokens(): Promise<AuthTokens | null>;
  shouldRefreshToken(): Promise<boolean>;
}
