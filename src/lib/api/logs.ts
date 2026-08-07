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

export type GeneralLogsResponse = {
  orders: any[];
  payments: any[];
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
}: {
  page: number;
  limit: number;
  all?: boolean;
}): Promise<GeneralLogsResponse> => {
  const { data } = await apiClient.get<GeneralLogsResponse>('/orders/admin/general-log', {
    params: { page, limit, all },
  });
  return data;
};
