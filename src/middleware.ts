import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository";
import { AuthUseCase } from "./domain/use-cases/auth.use-case";

export async function middleware(request: NextRequest) {
  const tokens = request.cookies.get("auth_tokens");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isStaticFile =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname === "/favicon.ico";

  // Skip middleware for API routes and static files
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Handle token from URL parameter
  const tokenFromUrl = request.nextUrl.searchParams.get("token");
  if (tokenFromUrl) {
    try {
      const authRepository = new AuthRepositoryImpl();
      const authUseCase = new AuthUseCase(authRepository);
      await authUseCase.loginWithCustomToken(tokenFromUrl);

      const mainUrl = new URL("/", request.url);
      return NextResponse.redirect(mainUrl);
    } catch (error) {
      console.error("Failed to login with custom token:", error);
      // If login fails, redirect to login page
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is not logged in and trying to access protected routes
  if (!tokens && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login page
  if (tokens && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user has tokens and is on a protected route, verify the token
  if (tokens && !isLoginPage) {
    try {
      const authRepository = new AuthRepositoryImpl();
      // Only attempt to refresh if the token is close to expiring
      const shouldRefresh = await authRepository.shouldRefreshToken();

      if (shouldRefresh) {
        const newTokens = await authRepository.refreshTokens();
        if (!newTokens) {
          // If refresh failed, clear the invalid tokens and redirect to login
          const response = NextResponse.redirect(new URL("/login", request.url));
          response.cookies.delete("auth_tokens");
          return response;
        }
      }

      return NextResponse.next();
    } catch (error) {
      // If any error occurs, clear the invalid tokens and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_tokens");
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
