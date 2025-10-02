"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleForm from "@/components/articles/ArticleForm";
import AdminLayout from "@/components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { articlesApi, Article } from "@/lib/api/articles";

export default function EditArticlePage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: article,
    isLoading,
    error,
  } = useQuery<Article>({
    queryKey: ["article", id],
    queryFn: () => articlesApi.getById(id),
    staleTime: 0, // Данные всегда считаются устаревшими
    gcTime: 0, // Не кешируем данные (новое название для cacheTime)
    refetchOnMount: true, // Перезагружаем при монтировании
    refetchOnWindowFocus: true, // Перезагружаем при фокусе окна
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
          <div className="flex justify-center items-center h-64">
            <p>Загрузка...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div>
          <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Ошибка при загрузке статьи
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>
        {/* Явно передаем язык из существующей статьи */}
        <ArticleForm article={article} isEditing={true} lang={article?.lang} />
      </div>
    </AdminLayout>
  );
}
