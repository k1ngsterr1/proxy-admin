import apiClient from '../axios';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const userApi = {
  getInfo: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/user/info');
    return data;
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<User>('/user/profile', userData);
    return data;
  }
};
