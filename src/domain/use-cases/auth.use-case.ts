import { AuthRepository } from "../repositories/auth.repository";
import { User, AuthCredentials } from "../entities/user.entity";
import { AuthTokens } from "../entities/auth.entity";

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(credentials: AuthCredentials): Promise<AuthTokens> {
    return this.authRepository.login(credentials);
  }

  async logout(): Promise<void> {
    return this.authRepository.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }

  getStoredTokens(): AuthTokens | null {
    return this.authRepository.getStoredTokens();
  }

  setStoredTokens(tokens: AuthTokens): void {
    this.authRepository.setStoredTokens(tokens);
  }

  clearStoredTokens(): void {
    this.authRepository.clearStoredTokens();
  }
}
