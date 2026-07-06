"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api/articles";
import { useRouter } from "next/navigation";

export default function ArticlesList() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["articles", lang, page, limit],
    queryFn: () => articlesApi.getAllPaginated(lang, page, limit),
  });

  const articles = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  // Логирование для отладки
  console.log("Articles data:", {
    data,
    articles,
    totalPages,
    total,
    isLoading,
    error,
  });

  const deleteMutation = useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setDeleteId(null);
    },
  });

  const handleLangChange = (newLang: "ru" | "en") => {
    setLang(newLang);
    setPage(1); // Сбрасываем на первую страницу при смене языка
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Сбрасываем на первую страницу при изменении лимита
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Статьи</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={lang === "ru" ? "default" : "outline"}
              onClick={() => handleLangChange("ru")}
            >
              🇷🇺 Рус
            </Button>
            <Button
              size="sm"
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => handleLangChange("en")}
            >
              🇺🇸 Eng
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-2" />
                Новая статья
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать статью</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <Link href="/admin/articles/new?lang=ru">
                  <Button variant="outline" className="w-full">
                    🇷🇺 На русском
                  </Button>
                </Link>
                <Link href="/admin/articles/new?lang=en">
                  <Button variant="outline" className="w-full">
                    🇺🇸 На английском
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Ошибка при загрузке статей
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Изображение</TableHead>
                <TableHead>Заголовок</TableHead>
                <TableHead>Теги</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Статьи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {article.mainImage || article.mainImageUrl ? (
                        <img
                          src={article.mainImage || article.mainImageUrl}
                          alt="Главное изображение"
                          className="w-16 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                          Нет фото
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{article.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {article.tags && article.tags.length > 0 ? (
                          article.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Нет тегов
                          </span>
                        )}
                        {article.tags && article.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/articles/edit/${article.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(article.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Удалить статью</DialogTitle>
                            </DialogHeader>
                            <p>
                              Вы уверены, что хотите удалить статью "
                              {articles.find((a) => a.id === deleteId)?.title}"?
                            </p>
                            <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Отмена</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  deleteId && handleDelete(deleteId)
                                }
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending
                                  ? "Удаление..."
                                  : "Удалить"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Пагинация */}
        {!isLoading && !error && (articles.length > 0 || totalPages > 0) && (
          <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Показано {(page - 1) * limit + 1}-
                  {Math.min(page * limit, total)} из {total} статей
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    На странице:
                  </span>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => handleLimitChange(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  Первая
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const showPages = 7; // Количество видимых номеров страниц

                    if (totalPages <= showPages) {
                      // Показываем все страницы
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Показываем с многоточием
                      if (page <= 4) {
                        for (let i = 1; i <= 5; i++) pages.push(i);
                        pages.push(-1); // многоточие
                        pages.push(totalPages);
                      } else if (page >= totalPages - 3) {
                        pages.push(1);
                        pages.push(-1);
                        for (let i = totalPages - 4; i <= totalPages; i++)
                          pages.push(i);
                      } else {
                        pages.push(1);
                        pages.push(-1);
                        for (let i = page - 1; i <= page + 1; i++)
                          pages.push(i);
                        pages.push(-2);
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((pageNum, idx) => {
                      if (pageNum === -1 || pageNum === -2) {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="min-w-[36px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Последняя
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
