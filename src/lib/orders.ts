"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "./axios";

export const useOrdersData = (type: string, userId: string) => {
    return useQuery({
        queryKey: ["orders", type, userId],
        queryFn: async ({ queryKey }) => {
            const [_key, type, userId] = queryKey;
            const { data } = await apiClient.get(`/products/admin/user-proxy/${type}?userId=${userId}`);

            if (data?.data?.items) {
                data.data.items.sort((a: any, b: any) => {
                    const dateA = type === "resident"
                        ? a?.package_info?.expired_at
                        : a?.date_end;
                    const dateB = type === "resident"
                        ? b?.package_info?.expired_at
                        : b?.date_end;

                    return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
                });
            }

            return data;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });
};
