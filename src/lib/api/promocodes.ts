import apiClient from '../axios';

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  limit: number;
  usageCount: number;
}

export interface CreatePromoCodeDto {
  promocode: string;
  discount: number;
  limit: number;
}

export const promocodesApi = {
  getAll: async (): Promise<PromoCode[]> => {
    const { data } = await apiClient.get<PromoCode[]>('/user/promocode');
    return data;
  },

  create: async (promoCode: CreatePromoCodeDto): Promise<PromoCode> => {
    const { data } = await apiClient.post<PromoCode>('/user/promocode', promoCode);
    return data;
  },

  delete: async (code: string): Promise<void> => {
    await apiClient.delete(`/user/promocode/delete/${code}`);
  }
};
