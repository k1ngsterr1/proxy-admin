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

export const getGeneralLogs = async () => {
  const { data } = await apiClient.get('/orders/admin/general-log');
  return data;
};