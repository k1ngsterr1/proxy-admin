"use client"

import { useMutation } from '@tanstack/react-query';
import apiClient from './axios';
import Cookies from 'js-cookie';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// Helper to check if code is running in browser environment
const isBrowser = () => typeof window !== 'undefined';

// Cookie options
const cookieOptions = {
  expires: 7, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      if (isBrowser()) {
        // Set in both localStorage and cookies for compatibility
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Set cookies for middleware
        Cookies.set('accessToken', data.accessToken, cookieOptions);
        Cookies.set('refreshToken', data.refreshToken, cookieOptions);
      }
    },
  });
};

export const logout = () => {
  if (isBrowser()) {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear cookies
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
  }
};

export const isAuthenticated = () => {
  if (!isBrowser()) return false;
  return !!Cookies.get('accessToken') || !!localStorage.getItem('accessToken');
};

export const getAccessToken = () => {
  if (!isBrowser()) return null;
  return Cookies.get('accessToken') || localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  if (!isBrowser()) return null;
  return Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
};
