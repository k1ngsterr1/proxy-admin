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
  Tag,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api/articles";
import { useRouter } from "next/navigation";

export default function ArticlesList() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

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
          <Link href="/admin/articles/tags">
            <Button size="sm" variant="outline">
              <Tag size={16} className="mr-2" />
              Теги
            </Button>
          </Link>
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
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Показано {articles.length} из {total} статей (страница {page} из{" "}
              {totalPages})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} className="mr-1" />
                Назад
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Вперед
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
