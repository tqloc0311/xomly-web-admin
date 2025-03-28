export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthErrorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  FIREBASE_ERROR: "FIREBASE_ERROR",
  TOKEN_ERROR: "TOKEN_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AuthErrorCode = (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];
