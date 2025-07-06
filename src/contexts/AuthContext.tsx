"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getUser, isAuthenticated, clearAuthData } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getUser();
      const authStatus = isAuthenticated();
      setUser(currentUser);
      setAuthenticated(authStatus);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    clearAuthData();
    setUser(null);
    setAuthenticated(false);
    window.location.href = '/';
  };

  const refreshUser = () => {
    const currentUser = getUser();
    const authStatus = isAuthenticated();
    setUser(currentUser);
    setAuthenticated(authStatus);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: authenticated,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 