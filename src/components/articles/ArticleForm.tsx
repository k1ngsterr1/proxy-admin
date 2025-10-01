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
  const [images, setImages] = useState<string[]>(article?.images || []);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // This function is now just for display purposes
  const extractImagesFromContent = (htmlContent: string): string[] => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    const imgElements = tempDiv.querySelectorAll("img");

    // Extract image URLs and filter out data URLs
    const imageUrls = Array.from(imgElements)
      .map((img) => img.src)
      .filter((src) => !src.startsWith("data:")); // Only keep actual URLs, not data URLs

    console.log("Extracted image URLs:", imageUrls);
    return imageUrls;
  };

  // Функция для преобразования URL в File
  const urlToFile = async (
    url: string,
    filename: string,
    mimeType: string
  ): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  };

  // Обновляем данные при изменении статьи
  useEffect(() => {
    if (article) {
      console.log("Article data updated:", article);

      // Обновляем все поля из новых данных статьи
      setTitle(article.title || "");
      setContent(article.content || "");
      setImages(article.images || []);
      setArticleLang(article.lang || "ru");

      console.log("Updated article data:", {
        title: article.title,
        content: article.content?.substring(0, 100) + "...",
        lang: article.lang,
        images: article.images,
      });
    } else if (!isEditing) {
      // Сбрасываем поля для новой статьи
      setTitle("");
      setContent("");
      setImages([]);
      setArticleLang(lang);
    }
  }, [article, isEditing, lang]);

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
    onSuccess: (updatedArticle, variables) => {
      // Инвалидируем список статей
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      // Инвалидируем конкретную статью
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
      // Также можно обновить кеш напрямую
      queryClient.setQueryData(["article", variables.id], updatedArticle);
      router.push("/admin/articles");
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

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

      // Получаем изображения из редактора
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const imgElements = tempDiv.querySelectorAll("img");

      // Решение проблемы с дублированием изображений
      // Создаем новый документ без изображений для отправки на сервер
      const contentWithoutImages = document.createElement("div");
      contentWithoutImages.innerHTML = content;

      // Собираем все изображения из контента
      const allImages = contentWithoutImages.querySelectorAll("img");

      // Удаляем дубликаты изображений
      const uniqueImgSrcs = new Set<string>();
      const uniqueImages: HTMLImageElement[] = [];

      // Собираем уникальные изображения
      Array.from(allImages).forEach((img) => {
        if (!uniqueImgSrcs.has(img.src)) {
          uniqueImgSrcs.add(img.src);
          uniqueImages.push(img as HTMLImageElement);
        }
      });

      // Удаляем все изображения из контента для отправки на сервер
      Array.from(allImages).forEach((img) => {
        const parent = img.parentElement;
        if (parent) {
          parent.removeChild(img);
        }
      });

      // Контент без изображений для отправки на сервер
      const contentWithoutImagesHtml = contentWithoutImages.innerHTML;
      console.log(
        "Content without images:",
        contentWithoutImagesHtml.substring(0, 100) + "..."
      );

      // Получаем первое изображение с data URL или URL для загрузки
      let imageFile: File | null = null;
      let imageUrl: string | null = null;

      // Проверяем все уникальные изображения
      for (const img of uniqueImages) {
        // Если это data URL, преобразуем его в File
        if (img.src.startsWith("data:image")) {
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            const fileName = `image-${Date.now()}.${
              blob.type.split("/")[1] || "png"
            }`;
            imageFile = new File([blob], fileName, { type: blob.type });
            // Берем только первое изображение
            break;
          } catch (err) {
            console.error("Error converting data URL to file:", err);
          }
        }
        // Если это обычный URL (при редактировании), сохраняем его
        else if (img.src.startsWith("http")) {
          imageUrl = img.src;
          // Не прерываем цикл, продолжаем искать data URL
        }
      }

      // Создаем данные статьи
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content: contentWithoutImagesHtml, // Отправляем контент без изображений
        lang: articleLang, // Используем язык из состояния, который учитывает язык статьи при редактировании
      };

      console.log("Article data with language:", articleData.lang);

      // Добавляем изображение из редактора (только одно)
      if (imageFile) {
        // Если нашли data URL, преобразованный в File
        articleData.images = imageFile;
        console.log("Sending new image file");
      } else if (imageUrl && isEditing) {
        try {
          // При редактировании, если нет нового изображения, но есть существующее URL
          console.log("Converting existing image URL to File:", imageUrl);
          // Преобразуем существующий URL в File для отправки в том же формате, что и при создании
          const imageFileName =
            imageUrl.split("/").pop() || "existing-image.jpg";
          const imageFileType = "image/jpeg"; // Предполагаем JPEG, но можно определить по расширению
          const imageFileObj = await urlToFile(
            imageUrl,
            imageFileName,
            imageFileType
          );

          // Добавляем преобразованный файл в данные статьи
          articleData.images = imageFileObj;
          console.log("Successfully converted URL to File for PATCH request");
        } catch (err) {
          console.error("Error converting image URL to File:", err);
          // Если не удалось преобразовать, продолжаем без изображения
          // API должен сохранить существующее изображение
        }
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
