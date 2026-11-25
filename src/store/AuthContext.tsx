import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@/services';
import type { User } from '@/shared/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        await ApiClient.init();
        const savedUser = await ApiClient.getUser();
        const tokens = await ApiClient.getTokens();
        if (active && savedUser && tokens.accessToken) {
          setUser(savedUser);
        }
      } catch {
        await ApiClient.clearAuth();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await ApiClient.login(email, pass);
    setUser({ email: email.trim().toLowerCase() });
  };

  const logout = async () => {
    await ApiClient.clearAuth();
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
