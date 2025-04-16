"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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

export default function UserLogsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { data: logs, isLoading } = useGetLogs(userId ?? "");
  const { email } = useUserStore();

  console.log("logs", logs);

  useEffect(() => {
    console.log("Fetching logs for userId:", userId);
  }, [userId]);

  const [activeTab, setActiveTab] = useState("orders");

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
                Заказы ({logs?.orders?.length})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Платежи ({logs?.payments?.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загрузка данных...
              </div>
            ) : (
              <TabsContent value="orders">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">ID заказа</TableHead>
                      <TableHead className="w-[180px]">Тип заказа</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Номер заказа</TableHead>
                      <TableHead>Цель использования</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {order.type}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number.parseFloat(order.totalPrice).toFixed(2)}
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
                            {order.status === "PAID" ? "Оплачен" : order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {logs?.orders?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Заказы не найдены
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="payments">
              {logs?.payments?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">ID платежа</TableHead>
                      <TableHead>ID Пользователя</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Метод</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Дата обновления</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.payments.map((payment: any) => (
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
                          {new Date(payment.createdAt).toLocaleDateString()}{" "}
                          {new Date(payment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.updatedAt).toLocaleDateString()}{" "}
                          {new Date(payment.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
