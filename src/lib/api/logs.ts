import { useQuery } from "@tanstack/react-query";
import apiClient from "../axios";

export const useGetLogs = (userId: string) => {
    return useQuery(
        {
            queryKey: ['logs'],
            queryFn: async () => apiClient.get(`/payment/admin/get-history/${userId}`),
            retry: 1,
            staleTime: 5 * 60 * 1000,
        }
    )
}