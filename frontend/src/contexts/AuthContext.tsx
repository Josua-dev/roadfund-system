import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isInspector: boolean;
  isOfficer: boolean;
  isCitizen: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('rf_token');
    const storedUser  = localStorage.getItem('rf_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rf_token');
        localStorage.removeItem('rf_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('rf_token', data.token);
    localStorage.setItem('rf_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rf_token');
    localStorage.removeItem('rf_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('rf_user', JSON.stringify(updatedUser));
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => {
    return !!user && roles.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin:     !!user && user.role === 'admin',
    isInspector: !!user && user.role === 'inspector',
    isOfficer:   !!user && user.role === 'maintenance_officer',
    isCitizen:   !!user && user.role === 'citizen',
    isStaff:     !!user && ['admin', 'inspector', 'maintenance_officer'].includes(user.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
