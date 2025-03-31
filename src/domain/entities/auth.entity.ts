import { User } from "./user.entity";

export interface ServerAuthResponse {
  credentials: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
