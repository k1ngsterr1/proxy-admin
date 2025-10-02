"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ArticleEditor from "./Editor";
import {
  articlesApi,
  Article,
  CreateArticleDto,
  UpdateArticleDto,
} from "@/lib/api/articles";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ArticleFormProps {
  article?: Article;
  isEditing?: boolean;
  lang?: "ru" | "en";
}

export default function ArticleForm({
  article,
  isEditing = false,
  lang = "ru",
}: ArticleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Если редактируем статью, берем язык из статьи, иначе используем пропс lang
  const [articleLang, setArticleLang] = useState<"ru" | "en">(
    article?.lang || lang
  );
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");

  // При инициализации компонента для редактирования, добавляем существующие изображения в контент
  useEffect(() => {
    // Если редактируем статью, обновляем язык из статьи
    if (isEditing && article?.lang) {
      console.log("Setting language from article:", article.lang);
      setArticleLang(article.lang);
    }

    // Только при первой загрузке для редактирования
    if (isEditing && article?.images && article.images.length > 0) {
      console.log("Article has images:", article.images);

      // Создаем новый HTML с изображениями
      // Добавляем изображения в начало контента, чтобы они были видны
      let imageHtml = "";
      article.images.forEach((imageUrl) => {
        if (typeof imageUrl === "string") {
          console.log("Adding image to content:", imageUrl);
          imageHtml += `<div><img src="${imageUrl}" alt="Article image" /></div>`;
        }
      });

      // Создаем новый контент с изображениями в начале
      const newContent = imageHtml + content;

      // Обновляем контент в редакторе
      console.log("Setting new content with images at the beginning");
      setContent(newContent);
    }
  }, [isEditing, article]);

  const createMutation = useMutation({
    mutationFn: (article: CreateArticleDto) => articlesApi.create(article), // без language
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      router.push("/admin/articles");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleDto }) =>
      articlesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      router.push("/admin/articles");
    },
  });

  // Handle file selection - now handled in the editor
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // This is now handled in the ArticleEditor component
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Show loading state
      const submitButton = document.querySelector(
        ".submit-button"
      ) as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Сохранение...";
      }

      console.log("Submitting article with language:", articleLang);

      // Process images in content for uploading while preserving their positions
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const imgElements = tempDiv.querySelectorAll("img");

      // Collect all data URL images and convert them to files
      const imageFiles: File[] = [];
      const imagePromises: Promise<void>[] = [];

      imgElements.forEach((img, index) => {
        if (img.src.startsWith("data:image")) {
          const promise = (async () => {
            try {
              const res = await fetch(img.src);
              const blob = await res.blob();
              const fileName = `image-${Date.now()}-${index}.${
                blob.type.split("/")[1] || "png"
              }`;
              const imageFile = new File([blob], fileName, { type: blob.type });
              imageFiles.push(imageFile);
            } catch (err) {
              console.error("Error converting data URL to file:", err);
            }
          })();
          imagePromises.push(promise);
        }
      });

      // Wait for all image processing to complete
      await Promise.all(imagePromises);

      // Create article data with complete content (preserving image positions)
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content: content, // Send the complete content including images in their original positions
        lang: articleLang,
      };

      console.log("Article data with language:", articleData.lang);
      console.log("Sending content with preserved image positions");

      // Add the first image file if any were converted from data URLs
      if (imageFiles.length > 0) {
        articleData.images = imageFiles[0]; // Send only the first image file as per API expectation
        console.log("Sending image file along with content");
      }

      if (isEditing && article?.id) {
        updateMutation.mutate({
          id: article.id,
          data: articleData,
        });
      } else {
        createMutation.mutate(articleData as CreateArticleDto);
      }
    } catch (error) {
      console.error("Error submitting article:", error);
    } finally {
      // Reset button state
      const submitButton = document.querySelector(
        ".submit-button"
      ) as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Сохранить";
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Редактировать статью" : "Новая статья"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок статьи"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Содержание</Label>
            <ArticleEditor content={content} onChange={setContent} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/articles")}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="submit-button"
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Сохранение..."
              : isEditing
              ? "Обновить"
              : "Создать"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
