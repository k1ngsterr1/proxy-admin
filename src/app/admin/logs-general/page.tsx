"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { Input } from "@/components/ui/input";

const getGeneralLogs = async () => {
  const response = await apiClient.get("/orders/admin/general-log");
  const data = response.data;
  if (!Array.isArray(data.orders) || !Array.isArray(data.payments)) {
    throw new Error('"orders" or "payments" is not an array');
  }
  return {
    orders: data.orders,
    payments: data.payments,
  };
};

const LoadingState = () => (
  <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
    <Loader2 className="h-5 w-5 animate-spin" />
    Загрузка данных...
  </div>
);

const OrderTable = ({ orders, searchTerm }: any) => {
  if (!orders?.length) {
    return <div className="text-center py-8 text-muted-foreground">{searchTerm ? "Совпадений не найдено" : "Логи отсутствуют"}</div>;
  }

  return (
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
        {orders.map((order: any) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order?.user?.email || "N/A"}</TableCell>
            <TableCell>{order?.type || "N/A"}</TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
            <TableCell>${parseFloat(order.totalPrice || 0).toFixed(2)}</TableCell>
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
  );
};

const PaymentTable = ({ payments, searchTerm }: any) => {
  if (!payments?.length) {
    return <div className="text-center py-8 text-muted-foreground">{searchTerm ? "Совпадений не найдено" : "Платежи отсутствуют"}</div>;
  }

  return (
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
        {payments.map((payment: any) => (
          <TableRow key={payment.id}>
            <TableCell className="font-mono text-xs">{payment?.user?.email || "N/A"}</TableCell>
            <TableCell>{payment.method || "N/A"}</TableCell>
            <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
            <TableCell>${parseFloat(payment.price || 0).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["generalLogs"],
    queryFn: getGeneralLogs,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const filteredOrders = data?.orders?.filter(
    (order: any) =>
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = data?.payments?.filter(
    (payment: any) =>
      payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Ошибка загрузки логов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-destructive">
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
          <Input
            type="text"
            placeholder="Поиск по email, номеру заказа или методу оплаты"
            className="w-full mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Tabs defaultValue="orders">
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="payments">Платежи</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              {isLoading ? (
                <LoadingState />
              ) : (
                <OrderTable orders={filteredOrders} searchTerm={searchTerm} />
              )}
            </TabsContent>

            <TabsContent value="payments">
              {isLoading ? (
                <LoadingState />
              ) : (
                <PaymentTable payments={filteredPayments} searchTerm={searchTerm} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}