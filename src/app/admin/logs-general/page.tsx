"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getGeneralLogs,
  type OrderLog,
  type OrderLogStatus,
  type PaymentLog,
} from "@/lib/api/logs";

const statusLabels: Record<OrderLogStatus, string> = {
  PAID: "Оплачен",
  PENDING: "Ожидает оплаты",
  PROCESSING: "В обработке",
  CANCELED: "Отменён",
};

const LoadingState = () => (
  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
    Загрузка данных...
  </div>
);

function OrderTable({
  orders,
  searchTerm,
}: {
  orders: OrderLog[];
  searchTerm: string;
}) {
  if (!orders.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {searchTerm ? "Совпадений не найдено" : "Логи отсутствуют"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="text-xs [&_td]:px-3 [&_th]:px-3">
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>ID в нашей БД</TableHead>
            <TableHead>Тип заказа</TableHead>
            <TableHead>Даты</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Заказ Proxy-Seller</TableHead>
            <TableHead>Цель использования</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="max-w-[170px] break-words font-mono text-xs">
                {order.user?.email || "N/A"}
              </TableCell>
              <TableCell className="min-w-[150px] max-w-[180px] break-all font-mono text-xs">
                {order.id}
              </TableCell>
              <TableCell>{order.type || "N/A"}</TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                <div>
                  Обновлён: {new Date(order.updatedAt).toLocaleString()}
                </div>
                <div className="mt-1 text-muted-foreground">
                  Создан: {new Date(order.createdAt).toLocaleString()}
                </div>
              </TableCell>
              <TableCell>${Number(order.totalPrice || 0).toFixed(2)}</TableCell>
              <TableCell className="min-w-[200px] font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">orderId: </span>
                  {order.orderId || "—"}
                </div>
                <div className="mt-1">
                  <span className="text-muted-foreground">orderNumber: </span>
                  {order.orderNumber || "—"}
                </div>
              </TableCell>
              <TableCell>{order.goal || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  className={`whitespace-nowrap ${order.status === "PAID" ? "bg-green-500/10 text-green-500" : order.status === "CANCELED" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}
                  variant="outline"
                >
                  {statusLabels[order.status] || order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentTable({
  payments,
  searchTerm,
}: {
  payments: PaymentLog[];
  searchTerm: string;
}) {
  if (!payments.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {searchTerm ? "Совпадений не найдено" : "Платежи отсутствуют"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Метод</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">
                {payment.user?.email || "N/A"}
              </TableCell>
              <TableCell>{payment.method || "N/A"}</TableCell>
              <TableCell>
                {new Date(payment.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>${Number(payment.price || 0).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<OrderLogStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);
  const orderStatus = activeTab === "orders" ? status : "ALL";
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["generalLogs", page, limit, showAll, search, orderStatus],
    queryFn: () =>
      getGeneralLogs({
        page,
        limit,
        all: showAll,
        search,
        status: orderStatus,
      }),
    staleTime: 1000 * 30,
    retry: 2,
  });

  const loading = isLoading || search !== searchTerm.trim();
  const orders = data?.orders ?? [];
  const payments = data?.payments ?? [];
  const total =
    activeTab === "orders"
      ? (data?.totalOrders ?? 0)
      : (data?.totalPayments ?? 0);
  const totalPages =
    activeTab === "orders"
      ? (data?.totalOrderPages ?? 0)
      : (data?.totalPaymentPages ?? 0);

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Ошибка загрузки логов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-destructive">
              {error.message}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Логи пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              type="search"
              placeholder="Поиск по email, ID, номеру заказа или методу оплаты"
              aria-label="Поиск логов"
              className="min-w-[220px] flex-1"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            {activeTab === "orders" && (
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as OrderLogStatus | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]" aria-label="Статус заказа">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Все статусы</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="icon"
              title="Обновить логи"
              aria-label="Обновить логи"
              disabled={isFetching || loading}
              onClick={() => refetch()}
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(1);
            }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="payments">Платежи</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              {loading ? (
                <LoadingState />
              ) : (
                <OrderTable orders={orders} searchTerm={searchTerm} />
              )}
            </TabsContent>
            <TabsContent value="payments">
              {loading ? (
                <LoadingState />
              ) : (
                <PaymentTable payments={payments} searchTerm={searchTerm} />
              )}
            </TabsContent>
          </Tabs>
          {!loading && (
            <div className="mt-4">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                showAll={showAll}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setShowAll(false);
                  setLimit(nextLimit);
                  setPage(1);
                }}
                onShowAll={() => {
                  setShowAll(true);
                  setPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
