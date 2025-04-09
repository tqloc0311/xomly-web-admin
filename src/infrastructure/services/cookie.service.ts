import Cookies from "js-cookie";
import { AuthTokens } from "@/domain/entities/auth.entity";
import { User } from "@/domain/entities/user.entity";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";

export enum CookieKeys {
  TOKENS = "auth_tokens",
  USER = "auth_user",
}

export class CookieService {
  private static instance: CookieService;
  private static expires = 7; // 7 days
  private readonly cookieOptions = {
    expires: CookieService.expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  private constructor() {}

  public static getInstance(): CookieService {
    if (!CookieService.instance) {
      CookieService.instance = new CookieService();
    }
    return CookieService.instance;
  }

  // Client-side cookie methods
  getStoredTokens(): AuthTokens | null {
    try {
      const tokens = Cookies.get(CookieKeys.TOKENS);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      throw new AuthError("Failed to retrieve stored tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  setStoredTokens(tokens: AuthTokens): void {
    try {
      Cookies.set(CookieKeys.TOKENS, JSON.stringify(tokens), this.cookieOptions);
    } catch (error) {
      throw new AuthError("Failed to store tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  clearStoredTokens(): void {
    try {
      Cookies.remove(CookieKeys.TOKENS, { path: "/" });
    } catch (error) {
      throw new AuthError("Failed to clear stored tokens", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  getStoredUser(): User | null {
    try {
      const user = Cookies.get(CookieKeys.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      throw new AuthError("Failed to retrieve stored user", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  setStoredUser(user: User): void {
    try {
      Cookies.set(CookieKeys.USER, JSON.stringify(user), this.cookieOptions);
    } catch (error) {
      throw new AuthError("Failed to store user data", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  clearStoredUser(): void {
    try {
      Cookies.remove(CookieKeys.USER, { path: "/" });
    } catch (error) {
      throw new AuthError("Failed to clear stored user data", AuthErrorCodes.TOKEN_ERROR);
    }
  }

  // Server-side cookie options for NextResponse
  getServerCookieOptions() {
    return {
      expires: new Date(Date.now() + CookieService.expires * 24 * 60 * 60 * 1000), // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
  }
}
