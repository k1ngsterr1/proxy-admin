import apiClient from '../axios';
import type { User } from '@/types';

export interface UserResponse {
  users: User[];
  total: number;
}

export interface UserCreateDto {
  email: string;
  name?: string;
  password: string;
  ipAddress?: string;
  proxyUsage?: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  ipAddress?: string;
  proxyUsage?: string;
  isBlocked?: boolean;
}

export interface BalanceAdjustmentDto {
  email: string;
  amount: number;
  isAddition: boolean;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/user/info');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/user/${id}`);
    return data;
  },

  create: async (userData: UserCreateDto): Promise<User> => {
    const { data } = await apiClient.post<User>('/user', userData);
    return data;
  },

  update: async (id: string, userData: UserUpdateDto): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/user/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/user/${id}`);
  },

  blockUser: async (email: string, block: boolean): Promise<User> => {
    const { data } = await apiClient.post<User>(`/user/ban`, { email, isBanned: block });
    return data;
  },

  unblockUser: async (email: string, block: boolean): Promise<User> => {
    const { data } = await apiClient.post<User>(`/user/unban`, { email, isBanned: block });
    return data;
  },

  adjustBalance: async ({ email, amount, isAddition }: BalanceAdjustmentDto): Promise<User> => {
    const { data } = await apiClient.post<User>(`/user/add-balance`, {
      email,
      amount: isAddition ? amount : -amount
    });
    return data;
  }
};
