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
        const user = JSON.parse(userData);
        apiService.setToken(token);
        apiService.setUser(user);
        setUser(user);
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
      
      const user: User = {
        id: username,
        username,
        name: username
      }
      apiService.setUser(user);
      setUser(user);
    } 
    catch (error) {
      throw error;
    }
  };

  const loginWithOAuth = async (providerId: string) => {
    try {
      const oauthUser: OAuthUserInfo = await oauthService.signInWithProvider(providerId);
      
      // Convert OAuth user to our User format and create a mock token
      const user: User = {
        id: oauthUser.id,
        username: oauthUser.email,
        name: oauthUser.name,
        avatar: oauthUser.avatar
      };
      
      const token = `oauth-${providerId}-${Date.now()}`;
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      await AsyncStorage.setItem('auth_provider', providerId);
      
      apiService.setToken(token);
      apiService.setUser(user);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call result
      try {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
        await AsyncStorage.removeItem('auth_provider');
        apiService.setToken('');
        setUser(null);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
        // Still clear user state even if storage fails
        apiService.setToken('');
        setUser(null);
      }
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