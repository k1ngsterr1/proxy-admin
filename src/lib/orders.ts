"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "./axios";

export const useOrdersData = (type: string, userId: string) => {
    return useQuery({
        queryKey: ["orders", type, userId],
        queryFn: async ({ queryKey }) => {
            const [_key, type, userId] = queryKey;
            const { data } = await apiClient.get(`/products/admin/user-proxy/${type}?userId=${userId}`);
            return data;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });
};
