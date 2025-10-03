"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
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

export default function TagsManagement() {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState("");
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  // Получение всех тегов
  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tags"],
    queryFn: articlesApi.getAllTags,
  });

  // Мутация для создания тега
  const createTagMutation = useMutation({
    mutationFn: articlesApi.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewTagName("");
    },
  });

  // Мутация для удаления тега
  const deleteTagMutation = useMutation({
    mutationFn: articlesApi.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setDeleteTagId(null);
    },
  });

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const handleDeleteTag = (id: string) => {
    deleteTagMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление тегами</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Форма создания нового тега */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Создать новый тег</Label>
            <div className="flex gap-2">
              <Input
                id="tag-name"
                type="text"
                placeholder="Название тега"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
              >
                <Plus size={16} className="mr-2" />
                {createTagMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </div>
          </div>
        </div>

        {/* Список существующих тегов */}
        <div className="space-y-4">
          <Label>Существующие теги ({tags.length})</Label>

          {isLoading ? (
            <div className="flex justify-center py-8">Загрузка...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Ошибка при загрузке тегов
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Теги не найдены. Создайте первый тег выше.
            </div>
          ) : (
            <div className="grid gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{tag.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: {tag.id}
                    </span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTagId(tag.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Удалить тег</DialogTitle>
                      </DialogHeader>
                      <p>
                        Вы уверены, что хотите удалить тег "
                        {tags.find((t) => t.id === deleteTagId)?.name}"?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Это действие удалит тег из всех статей, где он
                        используется.
                      </p>
                      <DialogFooter className="mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Отмена</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteTagId && handleDeleteTag(deleteTagId)
                          }
                          disabled={deleteTagMutation.isPending}
                        >
                          {deleteTagMutation.isPending
                            ? "Удаление..."
                            : "Удалить"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
