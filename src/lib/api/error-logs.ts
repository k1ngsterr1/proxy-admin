import apiClient from "@/lib/axios";

export type ErrorLog = {
  id: string;
  userId: string | null;
  method: string;
  path: string;
  ip: string | null;
  statusCode: number;
  message: string;
  stack: string | null;
  createdAt: string;
};

export type ErrorLogsResponse = {
  data: ErrorLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const errorLogsApi = {
  getAll: async ({
    page,
    limit,
    all = false,
  }: {
    page: number;
    limit: number;
    all?: boolean;
  }) => {
    const { data } = await apiClient.get<ErrorLogsResponse>("/admin/error-logs", {
      params: { page, limit, all },
    });
    return data;
  },
};
