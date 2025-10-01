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
      setImages(article.images || []);
      setArticleLang(article.lang || "ru");

      // Начинаем с оригинального контента
      let finalContent = article.content || "";

      // Проверяем, есть ли изображения в массиве images, которых нет в контенте
      if (article.images && article.images.length > 0) {
        const imagesInContent = extractImagesFromContent(finalContent);
        const missingImages = article.images.filter(
          (imageUrl) => !imagesInContent.includes(imageUrl)
        );

        console.log("Image integration check:", {
          contentLength: finalContent.length,
          imagesInContent: imagesInContent,
          imagesInArray: article.images,
          missingImages: missingImages,
        });

        // Если есть изображения из массива, которых нет в контенте, добавляем их
        if (missingImages.length > 0) {
          console.log("Adding missing images to content:", missingImages);

          // Если контент пустой или очень короткий, добавляем изображения в начало
          if (finalContent.trim().length < 50) {
            const imageHtml = missingImages
              .map(
                (imageUrl) =>
                  `<p><img src="${imageUrl}" alt="Article image" style="max-width: 100%; height: auto;" /></p>`
              )
              .join("");
            finalContent =
              imageHtml + (finalContent ? "<p></p>" + finalContent : "");
          } else {
            // Если есть существенный контент, добавляем изображения в конец
            const imageHtml = missingImages
              .map(
                (imageUrl) =>
                  `<p><img src="${imageUrl}" alt="Article image" style="max-width: 100%; height: auto;" /></p>`
              )
              .join("");
            finalContent = finalContent + "<p></p>" + imageHtml;
          }

          console.log("Content after adding images:", {
            newContentLength: finalContent.length,
            preview: finalContent.substring(0, 300) + "...",
          });
        }
      }

      // Устанавливаем финальный контент
      setContent(finalContent);

      console.log("Updated article data:", {
        title: article.title,
        content: finalContent.substring(0, 100) + "...",
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

      // Оставляем контент как есть - со всеми изображениями в правильных местах
      const finalContent = content;

      // Извлекаем URL изображений из контента для массива images (но не удаляем их из контента)
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const imgElements = tempDiv.querySelectorAll("img");

      // Собираем уникальные URL изображений
      const imageUrls = Array.from(imgElements)
        .map((img) => img.src)
        .filter((src, index, array) => array.indexOf(src) === index); // убираем дубликаты

      console.log("Final content with images:", {
        contentLength: finalContent.length,
        imageUrls: imageUrls,
        contentPreview: finalContent.substring(0, 200) + "...",
      });

      // Ищем новые изображения (data URLs) для загрузки
      let newImageFile: File | null = null;

      // Проверяем есть ли новые изображения (data URLs) в контенте
      for (const url of imageUrls) {
        if (url.startsWith("data:image")) {
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const fileName = `image-${Date.now()}.${
              blob.type.split("/")[1] || "png"
            }`;
            newImageFile = new File([blob], fileName, { type: blob.type });
            console.log("Found new image to upload:", fileName);
            break; // Берем только первое новое изображение
          } catch (err) {
            console.error("Error converting data URL to file:", err);
          }
        }
      }

      // Создаем данные статьи - отправляем контент с изображениями как есть
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content: finalContent, // Отправляем полный контент с изображениями в правильных местах
        lang: articleLang,
      };

      console.log("Article data:", {
        title: articleData.title,
        contentLength: articleData.content?.length || 0,
        lang: articleData.lang,
        hasNewImage: !!newImageFile,
      });

      // Добавляем новое изображение если есть
      if (newImageFile) {
        articleData.images = newImageFile;
        console.log("Adding new image file to article data");
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
