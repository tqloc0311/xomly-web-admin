import { AuthRepository } from "../repositories/auth.repository";
import { User } from "../entities/user.entity";
import { AuthTokens, AuthCredentials } from "../entities/auth.entity";

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(credentials: AuthCredentials): Promise<{ credentials: AuthTokens; user: User }> {
    return this.authRepository.login(credentials);
  }

  async loginWithCustomToken(customToken: string): Promise<{ credentials: AuthTokens; user: User }> {
    return this.authRepository.loginWithCustomToken(customToken);
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

  getStoredUser(): User | null {
    return this.authRepository.getStoredUser();
  }

  setStoredUser(user: User): void {
    this.authRepository.setStoredUser(user);
  }

  clearStoredUser(): void {
    this.authRepository.clearStoredUser();
  }
}
