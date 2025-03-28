"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { User, AuthCredentials } from "@/domain/entities/user.entity";
import { AuthUseCase } from "@/domain/use-cases/auth.use-case";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository";
import { AuthTokens } from "@/domain/entities/auth.entity";

interface AuthContextType {
  currentUser: User | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  tokens: AuthTokens | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const authUseCase = new AuthUseCase(new AuthRepositoryImpl());

  useEffect(() => {
    const unsubscribe = authUseCase.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Load stored tokens on mount
    const storedTokens = authUseCase.getStoredTokens();
    if (storedTokens) {
      setTokens(storedTokens);
    }

    return () => unsubscribe();
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      setIsLoading(true);
      const newTokens = await authUseCase.login(credentials);

      console.log("🚀 ~ use-auth.tsx:45 ~ login ~ newTokens:", newTokens);

      setTokens(newTokens);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authUseCase.logout();
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading, tokens }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
