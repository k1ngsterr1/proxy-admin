import { useQuery } from "@tanstack/react-query";
import apiClient from "../axios";

export const useGetLogs = (userId: string) => {
    return useQuery(
        {
            queryKey: ['logs', userId],
            queryFn: async ({ queryKey }) => {
                const [, userId] = queryKey
                console.log("Fetching logs for userId:", userId)
                const { data } = await apiClient.get(`/payment/admin/get-history/${userId}`)
                console.log("logs", data)
                return data;
            },
            enabled: !!userId,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        }
    )
}

export type OrderLogStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELED';

export type OrderLog = {
  id: string;
  orderId: string | null;
  orderNumber: string | null;
  type: string;
  goal: string;
  status: OrderLogStatus;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string } | null;
};

export type PaymentLog = {
  id: string;
  method: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string } | null;
};

export type GeneralLogsResponse = {
  orders: OrderLog[];
  payments: PaymentLog[];
  totalOrders: number;
  totalPayments: number;
  page: number;
  limit: number;
  totalOrderPages: number;
  totalPaymentPages: number;
};

export const getGeneralLogs = async ({
  page,
  limit,
  all = false,
  search = '',
  status = 'ALL',
}: {
  page: number;
  limit: number;
  all?: boolean;
  search?: string;
  status?: OrderLogStatus | 'ALL';
}): Promise<GeneralLogsResponse> => {
  const { data } = await apiClient.get<GeneralLogsResponse>('/orders/admin/general-log', {
    params: { page, limit, all, search, status },
  });
  return data;
};
