import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      await ApiService.init();
      const savedUser = await ApiService.getUser();
      const tokens = await ApiService.getTokens();
      if (savedUser && tokens.accessToken) {
        setUser(savedUser);
      }
    } catch {
      await ApiService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    await ApiService.login(email, pass);
    setUser({ email: email.trim().toLowerCase() });
  };

  const logout = async () => {
    await ApiService.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
