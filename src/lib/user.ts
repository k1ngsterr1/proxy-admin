"use client"

import { useQuery } from '@tanstack/react-query';
import apiClient from './axios';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/user/me');
      return data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};
