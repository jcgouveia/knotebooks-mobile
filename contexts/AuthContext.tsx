import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '@/types/api';
import { OAuthUserInfo } from '@/types/auth';
import { apiService } from '@/services/apiService';
import { oauthService } from '@/services/oauthService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (providerId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        apiService.setToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const authResponse: AuthResponse = await apiService.login(username, password);
      
      await AsyncStorage.setItem('auth_token', authResponse.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(authResponse.user));
      
      setUser(authResponse.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithOAuth = async (providerId: string) => {
    try {
      const oauthUser: OAuthUserInfo = await oauthService.signInWithProvider(providerId);
      
      // Convert OAuth user to our User format and create a mock token
      const user: User = {
        id: oauthUser.id,
        email: oauthUser.email,
        name: oauthUser.name,
        avatar: oauthUser.avatar
      };
      
      const token = `oauth-${providerId}-${Date.now()}`;
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', providerId);
      
      apiService.setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };
  const logout = async () => {
    try {
      await apiService.logout();
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('auth_provider');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('auth_provider');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}