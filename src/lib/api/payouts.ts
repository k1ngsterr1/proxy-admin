import apiClient from "../axios";

export type PayoutStatus = "PENDING" | "PAID" | "CANCELED";

export interface PayoutRequest {
  id: string;
  partnerId: string;
  wallet: string;
  amount: string;
  status: PayoutStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface PayoutResponse {
  payout: PayoutRequest[];
}

export interface UpdatePayoutDto {
  id: string;
  status: PayoutStatus;
}

export const payoutsApi = {
  getAll: async (): Promise<PayoutResponse> => {
    try {
      const response = await apiClient.get<PayoutResponse>(
        "/user/admin/payout-requests"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<PayoutRequest> => {
    try {
      const response = await apiClient.get(`/user/admin/payout-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payout request with id ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (updateDto: UpdatePayoutDto): Promise<void> => {
    try {
      await apiClient.post("/user/admin/finish-payout", updateDto);
    } catch (error) {
      console.error("Error updating payout status:", error);
      throw error;
    }
  },

  // Дополнительный метод для получения истории выплат (если потребуется)
  getHistory: async (partnerId?: string) => {
    try {
      const params = partnerId ? { partnerId } : {};
      const response = await apiClient.get("/user/admin/payout-history", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payout history:", error);
      throw error;
    }
  },
};
