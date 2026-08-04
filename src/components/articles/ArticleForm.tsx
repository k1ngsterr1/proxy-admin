"use client";

import { useState, useEffect } from "react";
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
import MainImageUpload from "./MainImageUpload";
import TagManager from "./TagManager";
import {
  articlesApi,
  Article,
  CreateArticleDto,
  UpdateArticleDto,
} from "@/lib/api/articles";
import axios from "@/lib/axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Новые поля для главного изображения и тегов
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState(article?.mainImageUrl || "");
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    article?.mainImageUrl || null
  );
  const [tags, setTags] = useState<string[]>(
    article?.tags?.map((tag) => tag.name) || []
  );

  // Получаем все доступные теги
  const { data: allTags } = useQuery({
    queryKey: ["tags"],
    queryFn: articlesApi.getAllTags,
  });

  // Мутация для создания нового тега
  const createTagMutation = useMutation({
    mutationFn: (tagName: string) => articlesApi.createTag(tagName),
    onSuccess: () => {
      // Обновляем список тегов
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  // Мутация для обновления тегов статьи
  const updateTagsMutation = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      articlesApi.updateArticleTags(id, tags),
    onSuccess: (updatedArticle) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", updatedArticle.id], updatedArticle);
    },
  });

  // Мутация для удаления главного изображения
  const removeMainImageMutation = useMutation({
    mutationFn: (id: string) => articlesApi.removeMainImage(id),
    onSuccess: (updatedArticle) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", updatedArticle.id], updatedArticle);
    },
  });

  // Функция удалена - больше не манипулируем структурой контента

  // Обновляем данные при изменении статьи
  useEffect(() => {
    if (article) {
      console.log("Article data updated:", article);

      // Обновляем все поля из новых данных статьи
      setTitle(article.title || "");
      setImages(article.images || []);
      setArticleLang(article.lang || "ru");

      // Используем mainImage, mainImageUrl или image в зависимости от того, что доступно
      const mainImageSrc = article.mainImage || article.mainImageUrl || article.image || "";
      console.log("Setting main image from article:", {
        mainImage: article.mainImage,
        mainImageUrl: article.mainImageUrl,
        finalSrc: mainImageSrc,
        isEmpty: !mainImageSrc,
      });
      setMainImageUrl(mainImageSrc);
      setMainImagePreview(mainImageSrc || null);

      // Очищаем файл если загружаем статью с URL изображения
      if (mainImageSrc && !mainImage) {
        setMainImage(null);
      }

      setTags(article.tags?.map((tag) => tag.name) || []);

      // Просто используем контент как есть, без манипуляций
      const articleContent = article.content || "";

      console.log("Setting content as is:", {
        contentLength: articleContent.length,
        contentPreview: articleContent.substring(0, 200) + "...",
      });

      setContent(articleContent);

      console.log("Updated article data:", {
        title: article.title,
        content: articleContent.substring(0, 100) + "...",
        lang: article.lang,
        images: article.images,
        mainImage: article.mainImage,
        mainImageUrl: article.mainImageUrl,
      });
    } else if (!isEditing) {
      // Сбрасываем поля для новой статьи
      setTitle("");
      setContent("");
      setImages([]);
      setArticleLang(lang);
      setMainImage(null);
      setMainImageUrl("");
      setMainImagePreview(null);
      setTags([]);
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

  // Обработчик для главного изображения по URL
  const handleMainImageUrlChange = (url: string) => {
    setMainImageUrl(url);
    setMainImagePreview(url || null);
    setMainImage(null); // Очищаем файл, так как теперь используем URL
  };

  // Удаление главного изображения
  const removeMainImage = async () => {
    setMainImage(null);
    setMainImageUrl("");
    setMainImagePreview(null);

    // Если статья уже существует, сразу удаляем главное изображение на сервере
    if (isEditing && article?.id) {
      try {
        await removeMainImageMutation.mutateAsync(article.id);
        console.log("Main image removed successfully for article:", article.id);
      } catch (error) {
        console.error("Failed to remove main image:", error);
      }
    }
  };

  // Обработчик изменения тегов с автоматическим сохранением новых тегов
  const handleTagsChange = async (newTags: string[]) => {
    // Находим новые теги, которых нет в списке доступных
    const existingTagNames = allTags?.map((tag) => tag.name) || [];
    const newTagsToCreate = newTags.filter(
      (tagName) => !existingTagNames.includes(tagName) && tagName.trim() !== ""
    );

    // Создаем новые теги
    for (const tagName of newTagsToCreate) {
      try {
        console.log("Creating new tag:", tagName.trim());
        await createTagMutation.mutateAsync(tagName.trim());
        console.log("Tag created successfully:", tagName.trim());
      } catch (error) {
        console.error(`Failed to create tag: ${tagName}`, error);
      }
    }

    // Обновляем состояние тегов
    setTags(newTags);

    // Если статья уже существует, сразу сохраняем теги
    if (isEditing && article?.id) {
      try {
        await updateTagsMutation.mutateAsync({
          id: article.id,
          tags: newTags,
        });
        console.log("Tags saved successfully for article:", article.id);
      } catch (error) {
        console.error("Failed to save tags:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      console.log("Submitting article with language:", articleLang);

      // Получаем финальный контент и загружаем inline (data:) изображения перед отправкой
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const imgElements = Array.from(tempDiv.querySelectorAll("img"));

      console.log("Processing images in content:", imgElements.length);

      // Проходим по изображениям в порядке появления и загружаем data: URL'ы
      for (let i = 0; i < imgElements.length; i++) {
        const img = imgElements[i] as HTMLImageElement;
        const src = img.src;

        if (src.startsWith("data:image")) {
          try {
            // Конвертируем data URL в blob
            const res = await fetch(src);
            const blob = await res.blob();
            const fileName = `image-${Date.now()}-${i}.${
              blob.type.split("/")[1] || "png"
            }`;
            const file = new File([blob], fileName, { type: blob.type });

            // Загружаем файл на сервер через тот же эндпоинт, что и в редакторе
            const fd = new FormData();
            fd.append("image", file);
            const uploadResp = await axios.post("/articles/upload-image", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            const imageUrl = uploadResp.data?.imageUrl || uploadResp.data?.url;
            if (imageUrl) {
              // Заменяем src в DOM на URL, сохраняя порядок и расположение
              img.src = imageUrl;
              console.log(`Replaced data image ${i + 1} with`, imageUrl);
            } else {
              console.warn(
                "Upload response missing image URL:",
                uploadResp.data
              );
            }
          } catch (err) {
            console.error("Error uploading inline image:", err);
          }
        }
      }

      // Финальное содержимое с внешними URL для изображений
      const finalContent = tempDiv.innerHTML;

      // Превью data: нельзя отправлять как URL. Сначала загружаем файл
      // и только затем сохраняем статью с полученным URL.
      const uploadedMainImageUrl = mainImage
        ? await articlesApi.uploadImage(mainImage)
        : mainImageUrl.trim() || undefined;

      // Создаем данные статьи
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content: finalContent,
        lang: articleLang,
        tags: tags.length > 0 ? tags : undefined,
        mainImageUrl: uploadedMainImageUrl,
      };

      console.log("Article data:", {
        title: articleData.title,
        contentLength: articleData.content?.length || 0,
        lang: articleData.lang,
      });

      if (isEditing && article?.id) {
        await updateMutation.mutateAsync({
          id: article.id,
          data: articleData,
        });
      } else {
        await createMutation.mutateAsync(articleData as CreateArticleDto);
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error(
        "Не удалось сохранить статью. Проверьте обложку и повторите попытку."
      );
    } finally {
      setIsSubmitting(false);
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
            <Label>Главное изображение</Label>
            <MainImageUpload
              mainImageUrl={mainImageUrl}
              previewUrl={mainImagePreview}
              onImageChange={async (file) => {
                if (file) {
                  setMainImage(file);
                  setMainImageUrl("");

                  // Создаем превью
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setMainImagePreview(event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setMainImage(null);
                }
              }}
              onUrlChange={handleMainImageUrlChange}
              onRemove={removeMainImage}
              isUploading={isSubmitting || removeMainImageMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Теги</Label>
            <TagManager
              tags={tags}
              availableTags={allTags}
              onTagsChange={handleTagsChange}
              isCreatingTag={createTagMutation.isPending}
              isSavingTags={updateTagsMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Содержание</Label>
            <ArticleEditor
              content={content}
              value={content}
              images={images}
              mainImageUrl={mainImageUrl}
              onChange={setContent}
              onMainImageChange={(url) => {
                setMainImageUrl(url);
                setMainImagePreview(url);
                setMainImage(null); // Очищаем файл, так как теперь используем URL
              }}
            />
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
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting
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
