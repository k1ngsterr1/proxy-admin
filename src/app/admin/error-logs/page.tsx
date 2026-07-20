"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorLogsApi } from "@/lib/api/error-logs";

function statusVariant(statusCode: number) {
  return statusCode >= 500 ? "destructive" : "outline";
}

export default function ErrorLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["errorLogs", page, limit],
    queryFn: () => errorLogsApi.getAll({ page, limit }),
    staleTime: 1000 * 30,
  });

  const normalizedSearch = search.toLowerCase();
  const logs = (data?.data ?? []).filter((log) =>
    [log.path, log.method, log.message, log.userId ?? "", log.ip ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Ошибки приложения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="search"
            placeholder="Поиск по адресу, сообщению, IP или пользователю"
            className="mb-4 w-full"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Загрузка ошибок...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">{error.message}</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Ошибки не найдены</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead>Запрос</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Пользователь</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusVariant(log.statusCode)}>{log.statusCode}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{log.method} {log.path}</TableCell>
                      <TableCell className="min-w-[280px]">
                        <details>
                          <summary className="cursor-pointer">{log.message}</summary>
                          {log.stack && <pre className="mt-2 max-w-[520px] whitespace-pre-wrap break-words text-xs text-muted-foreground">{log.stack}</pre>}
                        </details>
                      </TableCell>
                      <TableCell>{log.ip || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{log.userId || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && !error && (
            <div className="mt-4">
              <PaginationControls
                page={page}
                totalPages={data?.totalPages ?? 0}
                total={data?.total ?? 0}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit)
                  setPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
