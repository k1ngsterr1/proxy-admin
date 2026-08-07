"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { getGeneralLogs } from "@/lib/api/logs";

const LoadingState = () => (
  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
    Загрузка данных...
  </div>
);

function OrderTable({ orders, searchTerm }: { orders: any[]; searchTerm: string }) {
  if (!orders.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {searchTerm ? "Совпадений не найдено" : "Логи отсутствуют"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Тип заказа</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Номер заказа</TableHead>
            <TableHead>Цель использования</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.user?.email || "N/A"}</TableCell>
              <TableCell>{order.type || "N/A"}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
              <TableCell>${Number(order.totalPrice || 0).toFixed(2)}</TableCell>
              <TableCell>{order.orderId || "N/A"}</TableCell>
              <TableCell>{order.goal || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  className={order.status === "PAID" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}
                  variant="outline"
                >
                  {order.status === "PAID" ? "Оплачен" : order.status || "N/A"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentTable({ payments, searchTerm }: { payments: any[]; searchTerm: string }) {
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
              <TableCell className="font-mono text-xs">{payment.user?.email || "N/A"}</TableCell>
              <TableCell>{payment.method || "N/A"}</TableCell>
              <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["generalLogs", page, limit, showAll],
    queryFn: () => getGeneralLogs({ page, limit, all: showAll }),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const normalizedSearch = searchTerm.toLowerCase();
  const orders = (data?.orders ?? []).filter(
    (order) =>
      order.orderId?.toLowerCase().includes(normalizedSearch) ||
      order.user?.email?.toLowerCase().includes(normalizedSearch),
  );
  const payments = (data?.payments ?? []).filter(
    (payment) =>
      payment.user?.email?.toLowerCase().includes(normalizedSearch) ||
      payment.method?.toLowerCase().includes(normalizedSearch),
  );
  const total = activeTab === "orders" ? data?.totalOrders ?? 0 : data?.totalPayments ?? 0;
  const totalPages = activeTab === "orders" ? data?.totalOrderPages ?? 0 : data?.totalPaymentPages ?? 0;

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader><CardTitle>Ошибка загрузки логов</CardTitle></CardHeader>
          <CardContent><div className="py-8 text-center text-destructive">{error.message}</div></CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader><CardTitle>Логи пользователей</CardTitle></CardHeader>
        <CardContent>
          <Input
            type="search"
            placeholder="Поиск по email, номеру заказа или методу оплаты"
            className="mb-4 w-full"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value)
              setPage(1)
            }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="payments">Платежи</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              {isLoading ? <LoadingState /> : <OrderTable orders={orders} searchTerm={searchTerm} />}
            </TabsContent>
            <TabsContent value="payments">
              {isLoading ? <LoadingState /> : <PaymentTable payments={payments} searchTerm={searchTerm} />}
            </TabsContent>
          </Tabs>
          {!isLoading && (
            <div className="mt-4">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                showAll={showAll}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setShowAll(false)
                  setLimit(nextLimit)
                  setPage(1)
                }}
                onShowAll={() => {
                  setShowAll(true)
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
