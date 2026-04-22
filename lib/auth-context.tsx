"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, LoginCredentials, RegisterCredentials } from "./types";
import { authAPI } from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode - uses localStorage for the frontend demo
const DEMO_MODE = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        const storedUser = localStorage.getItem("pcpartpicker_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } else {
        const response = await authAPI.checkSession();
        if (response.authenticated && response.user) {
          setUser(response.user);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo login - accept any valid-looking email/password
        const demoUser: User = {
          user_id: 1,
          username: credentials.email.split("@")[0],
          email: credentials.email,
          roles: ["user"],
          build_count: 0,
        };
        localStorage.setItem("pcpartpicker_user", JSON.stringify(demoUser));
        setUser(demoUser);
      } else {
        const response = await authAPI.login(credentials);
        if (response.user) {
          setUser(response.user);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo registration
        const demoUser: User = {
          user_id: Date.now(),
          username: credentials.username,
          email: credentials.email,
          roles: ["user"],
          build_count: 0,
        };
        localStorage.setItem("pcpartpicker_user", JSON.stringify(demoUser));
        setUser(demoUser);
      } else {
        const response = await authAPI.register(credentials);
        if (response.user) {
          setUser(response.user);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        localStorage.removeItem("pcpartpicker_user");
      } else {
        await authAPI.logout();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
