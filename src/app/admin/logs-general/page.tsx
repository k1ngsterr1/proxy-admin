"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AdminLayout from "@/components/layout/AdminLayout"

import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axios"
import { Input } from "@/components/ui/input"

const getGeneralLogs = async () => {
    const response = await apiClient.get("/orders/admin/general-log")
    return response.data.data;
}

export default function LogsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: generalLogsData, isLoading: isGeneralLoading, error } = useQuery({
        queryKey: ["generalLogs"],
        queryFn: getGeneralLogs,
        staleTime: 1000 * 60 * 5,
        retry: 2
    });

    // const filteredLogs = generalLogsData?.filter((order: any) =>
    //     order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    if (error) {
        return (
            <AdminLayout>
                <Card>
                    <CardHeader>
                        <CardTitle>Ошибка загрузки логов</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-destructive">{error.message}</div>
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
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Поиск по номеру заказа"
                            className="w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Tabs defaultValue="orders">
                        <TabsContent value="orders">
                            {(isGeneralLoading) ? (
                                <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Загрузка данных...
                                </div>
                            ) : (
                                <>
                                    {generalLogsData?.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[180px]">Email</TableHead>
                                                    <TableHead className="w-[180px]">Тип заказа</TableHead>
                                                    <TableHead>Дата</TableHead>
                                                    <TableHead>Сумма</TableHead>
                                                    <TableHead>Номер заказа</TableHead>
                                                    <TableHead>Цель использования</TableHead>
                                                    <TableHead>Статус</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {generalLogsData.map((order: any) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-mono text-xs">{order?.user?.email || 'N/A'}</TableCell>
                                                        <TableCell className="font-mono text-xs">{order?.type || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {order.createdAt ? (
                                                                <>
                                                                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </>
                                                            ) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="font-medium">${Number.parseFloat(order.totalPrice || 0).toFixed(2)}</TableCell>
                                                        <TableCell className="font-mono text-xs">{order.orderId || 'N/A'}</TableCell>
                                                        <TableCell className="font-mono text-xs">{order.goal || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    order.status === "PAID"
                                                                        ? "bg-green-500/10 text-green-500"
                                                                        : "bg-yellow-500/10 text-yellow-500"
                                                                }
                                                                variant="outline"
                                                            >
                                                                {order.status === "PAID" ? "Оплачен" : order.status || 'N/A'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">Совпадений не найдено</div>
                                    )}
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}