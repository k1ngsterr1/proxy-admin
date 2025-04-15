"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/layout/AdminLayout";

import { useGetLogs } from "@/lib/api/logs";
import { useUserStore } from "@/components/model/user-store";

// Helper function to format date as YYYY-MM-DD
const formatDateKey = (date: Date) => {
  return date.toISOString().split("T")[0];
};

// Helper function to format date for display
const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = formatDateKey(today) === dateStr;
  const isYesterday = formatDateKey(yesterday) === dateStr;

  if (isToday) return "Сегодня";
  if (isYesterday) return "Вчера";

  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function UserLogsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { data: logs, isLoading } = useGetLogs(userId ?? "");
  const { email } = useUserStore();

  useEffect(() => {
    console.log("Fetching logs for userId:", userId);
  }, [userId]);

  const [activeTab, setActiveTab] = useState("orders");

  // Sort orders by creation date (newest first)
  const sortedOrders = logs?.orders
    ? [...logs.orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // Sort payments by creation date (newest first)
  const sortedPayments = logs?.payments
    ? [...logs.payments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // Group orders by date
  const ordersByDate: Record<string, typeof sortedOrders> = {};
  sortedOrders.forEach((order) => {
    const dateKey = formatDateKey(new Date(order.createdAt));
    if (!ordersByDate[dateKey]) {
      ordersByDate[dateKey] = [];
    }
    ordersByDate[dateKey].push(order);
  });

  // Group payments by date
  const paymentsByDate: Record<string, typeof sortedPayments> = {};
  sortedPayments.forEach((payment) => {
    const dateKey = formatDateKey(new Date(payment.createdAt));
    if (!paymentsByDate[dateKey]) {
      paymentsByDate[dateKey] = [];
    }
    paymentsByDate[dateKey].push(payment);
  });

  // Get sorted date keys (newest first)
  const orderDateKeys = Object.keys(ordersByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const paymentDateKeys = Object.keys(paymentsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Логи пользователя {email}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="orders"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="orders">
                Заказы ({logs?.orders?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Платежи ({logs?.payments?.length || 0})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загрузка данных...
              </div>
            ) : (
              <TabsContent value="orders">
                {orderDateKeys.length > 0 ? (
                  <div className="space-y-6">
                    {orderDateKeys.map((dateKey) => (
                      <div key={dateKey}>
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <h3 className="font-medium">
                            {formatDateDisplay(dateKey)}
                          </h3>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">
                                ID заказа
                              </TableHead>
                              <TableHead className="w-[180px]">
                                Тип заказа
                              </TableHead>
                              <TableHead>Время</TableHead>
                              <TableHead>Сумма</TableHead>
                              <TableHead>Номер заказа</TableHead>
                              <TableHead>Цель использования</TableHead>
                              <TableHead>Статус</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ordersByDate[dateKey].map((order: any) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">
                                  {order.id}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {order.type}
                                </TableCell>
                                <TableCell>
                                  {new Date(order.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  $
                                  {Number.parseFloat(order.totalPrice).toFixed(
                                    2
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {order.orderId ?? "N/A"}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {order.goal}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      order.status === "PAID"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-yellow-500/10 text-yellow-500"
                                    }
                                    variant="outline"
                                  >
                                    {order.status === "PAID"
                                      ? "Оплачен"
                                      : order.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Заказы не найдены
                  </div>
                )}
              </TabsContent>
            )}
            <TabsContent value="payments">
              {paymentDateKeys.length > 0 ? (
                <div className="space-y-6">
                  {paymentDateKeys.map((dateKey) => (
                    <div key={dateKey}>
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <h3 className="font-medium">
                          {formatDateDisplay(dateKey)}
                        </h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">
                              ID платежа
                            </TableHead>
                            <TableHead>ID Пользователя</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Метод</TableHead>
                            <TableHead>Время</TableHead>
                            <TableHead>Дата обновления</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentsByDate[dateKey].map((payment: any) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-mono text-xs">
                                {payment.id}
                              </TableCell>
                              <TableCell>{payment.userId}</TableCell>
                              <TableCell className="font-medium">
                                ${Number.parseFloat(payment.price).toFixed(2)}
                              </TableCell>
                              <TableCell>{payment.method}</TableCell>
                              <TableCell>
                                {new Date(payment.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  payment.updatedAt
                                ).toLocaleDateString()}{" "}
                                {new Date(payment.updatedAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Платежи отсутствуют
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
