"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pageSizes = [100, 200, 300];

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  showAll?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onShowAll?: () => void;
};

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  showAll = false,
  onPageChange,
  onLimitChange,
  onShowAll,
}: PaginationControlsProps) {
  const displayTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <span className="text-sm text-muted-foreground">Всего: {total}</span>
      <div className="flex items-center gap-2">
        <Select
          value={showAll ? "all" : String(limit)}
          onValueChange={(value) => {
            if (value === "all") {
              onShowAll?.();
              return;
            }

            onLimitChange(Number(value));
          }}
        >
          <SelectTrigger className="w-[92px]" aria-label="Количество строк на странице">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
            {onShowAll && <SelectItem value="all">Все</SelectItem>}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Предыдущая страница"
          aria-label="Предыдущая страница"
          disabled={showAll || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[76px] text-center text-sm text-muted-foreground">
          {showAll ? "Все" : `${page} / ${displayTotalPages}`}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Следующая страница"
          aria-label="Следующая страница"
          disabled={showAll || page >= displayTotalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
