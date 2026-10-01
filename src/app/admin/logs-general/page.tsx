"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, FilterX } from "lucide-react";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { LogColumnHeader } from '@/components/logs/log-column-header';
import { buildGeneralLogParams, createLogTableQuery, type LogTableQuery } from '@/components/logs/log-query';
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

const dateFields = [
  { key: 'createdFrom', label: 'Создан с (UTC)', type: 'date' as const },
  { key: 'createdTo', label: 'Создан по (UTC)', type: 'date' as const },
  { key: 'updatedFrom', label: 'Обновлён с (UTC)', type: 'date' as const },
  { key: 'updatedTo', label: 'Обновлён по (UTC)', type: 'date' as const },
];
const amountFields = [{ key: 'amountMin', label: 'От, $', type: 'number' as const }, { key: 'amountMax', label: 'До, $', type: 'number' as const }];
const dateSortOptions = [{ value: 'createdAt', label: 'Дата создания' }, { value: 'updatedAt', label: 'Дата обновления' }];

function OrderTable({
  orders,
  searchTerm,
  query, onChange, status, onStatusChange,
}: {
  orders: OrderLog[];
  searchTerm: string;
  query: LogTableQuery; onChange: (query: LogTableQuery) => void;
  status: OrderLogStatus | 'ALL'; onStatusChange: (status: OrderLogStatus | 'ALL') => void;
}) {

  return (
    <div className="overflow-x-auto">
      <Table className="text-xs [&_td]:px-3 [&_th]:px-3">
        <TableHeader>
          <TableRow>
            <LogColumnHeader label="Email" sortField="email" query={query} onChange={onChange} fields={[{key:'email',label:'Содержит'}]} />
            <LogColumnHeader label="ID в нашей БД" sortField="id" query={query} onChange={onChange} fields={[{key:'id',label:'Содержит'}]} />
            <LogColumnHeader label="Тип заказа" sortField="type" query={query} onChange={onChange} fields={[{key:'type',label:'Тип',options:['ipv6','isp','resident'].map(value=>({value,label:value}))}]} />
            <LogColumnHeader label="Даты" sortField="createdAt" query={query} onChange={onChange} fields={dateFields} sortOptions={dateSortOptions} />
            <LogColumnHeader label="Сумма" sortField="amount" query={query} onChange={onChange} fields={amountFields} />
            <LogColumnHeader label="Заказ Proxy-Seller" sortField="orderNumber" query={query} onChange={onChange} fields={[{key:'providerOrder',label:'orderId / orderNumber'}]} sortOptions={[{value:'orderNumber',label:'orderNumber'},{value:'orderId',label:'orderId'}]} />
            <LogColumnHeader label="Цель использования" sortField="goal" query={query} onChange={onChange} fields={[{key:'goal',label:'Содержит'}]} />
            <LogColumnHeader label="Статус" sortField="status" query={query} onChange={onChange}>
              <select aria-label="Фильтр статуса" className="h-9 w-full rounded border bg-background px-2 text-sm" value={status} onChange={e=>onStatusChange(e.target.value as OrderLogStatus|'ALL')}>
                <option value="ALL">Все статусы</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
              </select>
            </LogColumnHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!orders.length && <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">{searchTerm || Object.values(query.filters).some(Boolean) || status !== 'ALL' ? 'Совпадений не найдено' : 'Логи отсутствуют'}</TableCell></TableRow>}
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
                  Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
                </div>
                <div className="mt-1 text-muted-foreground">
                  Обновлён: {new Date(order.updatedAt).toLocaleString('ru-RU')}
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
  query, onChange,
}: {
  payments: PaymentLog[];
  searchTerm: string;
  query: LogTableQuery; onChange: (query: LogTableQuery) => void;
}) {

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <LogColumnHeader label="Email" sortField="email" query={query} onChange={onChange} fields={[{key:'email',label:'Содержит'}]} />
            <LogColumnHeader label="Метод" sortField="method" query={query} onChange={onChange} fields={[{key:'method',label:'Содержит'}]} />
            <LogColumnHeader label="Дата" sortField="createdAt" query={query} onChange={onChange} fields={dateFields} sortOptions={dateSortOptions} />
            <LogColumnHeader label="Сумма" sortField="amount" query={query} onChange={onChange} fields={amountFields} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!payments.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{searchTerm || Object.values(query.filters).some(Boolean) ? 'Совпадений не найдено' : 'Платежи отсутствуют'}</TableCell></TableRow>}
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">
                {payment.user?.email || "N/A"}
              </TableCell>
              <TableCell>{payment.method || "N/A"}</TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                <div>Создан: {new Date(payment.createdAt).toLocaleString('ru-RU')}</div>
                <div className="mt-1 text-muted-foreground">Обновлён: {new Date(payment.updatedAt).toLocaleString('ru-RU')}</div>
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
  const [ordersQuery, setOrdersQuery] = useState(createLogTableQuery);
  const [paymentsQuery, setPaymentsQuery] = useState(createLogTableQuery);
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);
  const orderStatus = activeTab === "orders" ? status : "ALL";
  const columns = buildGeneralLogParams({ orders: ordersQuery, payments: paymentsQuery, page, limit, all: showAll, search, status: orderStatus });
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["generalLogs", columns],
    queryFn: () =>
      getGeneralLogs({
        page,
        limit,
        all: showAll,
        search,
        status: orderStatus,
        columns,
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
              variant="ghost" size="icon" title="Сбросить фильтры и сортировку" aria-label="Сбросить фильтры и сортировку"
              onClick={() => { setOrdersQuery(createLogTableQuery()); setPaymentsQuery(createLogTableQuery()); setStatus('ALL'); setSearchTerm(''); setSearch(''); setPage(1); }}>
              <FilterX className="h-4 w-4" />
            </Button>
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
          {error && <div role="alert" className="mb-4 text-sm text-destructive">Ошибка загрузки логов: {error.message}</div>}
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
                <OrderTable orders={orders} searchTerm={searchTerm} query={ordersQuery} onChange={next=>{setOrdersQuery(next);setPage(1);}} status={status} onStatusChange={next=>{setStatus(next);setPage(1);}} />
              )}
            </TabsContent>
            <TabsContent value="payments">
              {loading ? (
                <LoadingState />
              ) : (
                <PaymentTable payments={payments} searchTerm={searchTerm} query={paymentsQuery} onChange={next=>{setPaymentsQuery(next);setPage(1);}} />
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
