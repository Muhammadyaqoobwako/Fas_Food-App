import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

interface CashierInfo {
  username: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  cashier: CashierInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [cashier, setCashier] = useState<CashierInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await apiService.login(username, password);
      if (result.success && result.token && result.cashier) {
        setToken(result.token);
        setCashier({ username: result.cashier.username, role: result.cashier.role || 'cashier' });
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('AuthContext Login Error:', err);
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setToken(null);
    setCashier(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        cashier,
        isLoggedIn: !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
