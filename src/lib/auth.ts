"use client"

import { useMutation } from '@tanstack/react-query';
import apiClient from './axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './token-storage';

interface LoginCredentials {
  seedPhrase: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/admin-login', credentials);
      return data;
    },
    onSuccess: (data) => {
      saveTokens(data);
    },
  });
};

export const logout = () => {
  clearTokens();
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export { getAccessToken, getRefreshToken };
