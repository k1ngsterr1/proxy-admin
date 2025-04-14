"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  payoutsApi,
  type PayoutRequest,
  type PayoutStatus,
} from "@/lib/api/payouts";

export default function PartnerPayoutList() {
  const queryClient = useQueryClient();
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PayoutStatus>("PAID");

  const { data, isLoading } = useQuery({
    queryKey: ["payout-requests"],
    queryFn: payoutsApi.getAll,
  });

  // Extract the payout array from the response
  const payoutRequests = data?.payout || [];

  const updateStatusMutation = useMutation({
    mutationFn: payoutsApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-requests"] });
      setIsDialogOpen(false);
      setSelectedPayout(null);
      toast.success("Статус выплаты успешно обновле��");
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении статуса выплаты");
      console.error(error);
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedPayout) return;

    updateStatusMutation.mutate({
      id: selectedPayout.id,
      status: newStatus,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number.parseFloat(amount));
  };

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Ожидает
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Оплачено
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Отменено
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выплаты партнёрам</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Кошелек</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Дата запроса</TableHead>
                <TableHead>Дата выплаты</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Запросы на выплату не найдены
                  </TableCell>
                </TableRow>
              ) : (
                payoutRequests.map((payout: PayoutRequest) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.wallet}</TableCell>
                    <TableCell>{formatAmount(payout.amount)}</TableCell>
                    <TableCell>{formatDate(payout.createdAt)}</TableCell>
                    <TableCell>
                      {payout.paidAt ? formatDate(payout.paidAt) : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-right">
                      {payout.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setNewStatus("PAID");
                              setIsDialogOpen(true);
                            }}
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setNewStatus("CANCELED");
                              setIsDialogOpen(true);
                            }}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {newStatus === "PAID"
                  ? "Подтвердить выплату"
                  : "Отменить выплату"}
              </DialogTitle>
              <DialogDescription>
                {newStatus === "PAID"
                  ? "Вы уверены, что хотите подтвердить выплату партнеру?"
                  : "Вы уверены, что хотите отменить выплату партнеру?"}
              </DialogDescription>
            </DialogHeader>

            {selectedPayout && (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-muted-foreground">Кошелек:</div>
                  <div>{selectedPayout.wallet}</div>

                  <div className="text-muted-foreground">Сумма:</div>
                  <div>{formatAmount(selectedPayout.amount)}</div>

                  <div className="text-muted-foreground">Дата запроса:</div>
                  <div>{formatDate(selectedPayout.createdAt)}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Статус выплаты</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) =>
                      setNewStatus(value as PayoutStatus)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">Оплачено</SelectItem>
                      <SelectItem value="CANCELED">Отменено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button
                variant={newStatus === "PAID" ? "default" : "destructive"}
                onClick={handleUpdateStatus}
                className="!mt-4"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending
                  ? "Обработка..."
                  : newStatus === "PAID"
                  ? "Подтвердить выплату"
                  : "Отменить выплату"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
