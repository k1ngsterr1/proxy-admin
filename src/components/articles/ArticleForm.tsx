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
import MainImageUpload from "./MainImageUpload";
import TagManager from "./TagManager";
import {
  articlesApi,
  Article,
  CreateArticleDto,
  UpdateArticleDto,
  Tag,
} from "@/lib/api/articles";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

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

  // Функция удалена - больше не манипулируем структурой контента

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
      setMainImageUrl(article.mainImageUrl || "");
      setMainImagePreview(article.mainImageUrl || null);
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // Обработчик для главного изображения
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (event) => {
        setMainImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление главного изображения
  const removeMainImage = () => {
    setMainImage(null);
    setMainImageUrl("");
    setMainImagePreview(null);
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
        await createTagMutation.mutateAsync(tagName.trim());
      } catch (error) {
        console.error(`Failed to create tag: ${tagName}`, error);
      }
    }

    // Обновляем состояние тегов
    setTags(newTags);
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

      // Получаем финальный контент как есть
      let finalContent = content;
      let newImageFiles: File[] = [];

      // Ищем data URLs в контенте и заменяем их на сервер-файлы
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const imgElements = tempDiv.querySelectorAll("img");

      console.log("Processing images in content:", imgElements.length);

      // Обрабатываем каждое изображение
      for (let i = 0; i < imgElements.length; i++) {
        const img = imgElements[i];
        const src = img.src;

        if (src.startsWith("data:image")) {
          try {
            // Конвертируем data URL в файл
            const res = await fetch(src);
            const blob = await res.blob();
            const fileName = `image-${Date.now()}-${i}.${
              blob.type.split("/")[1] || "png"
            }`;
            const file = new File([blob], fileName, { type: blob.type });

            newImageFiles.push(file);
            console.log(`Found new image ${i + 1} to upload:`, fileName);
          } catch (err) {
            console.error("Error converting data URL to file:", err);
          }
        }
      }

      // Создаем данные статьи
      const articleData: CreateArticleDto | UpdateArticleDto = {
        title,
        content: finalContent, // Отправляем контент с изображениями как есть
        lang: articleLang,
        tags: tags.length > 0 ? tags : undefined,
      };

      console.log("Article data:", {
        title: articleData.title,
        contentLength: articleData.content?.length || 0,
        lang: articleData.lang,
        newImagesCount: newImageFiles.length,
      });

      // Добавляем новые изображения если есть
      if (newImageFiles.length > 0) {
        // Если только одно изображение, отправляем как File
        // Если несколько, отправляем как массив
        articleData.images =
          newImageFiles.length === 1 ? newImageFiles[0] : newImageFiles;
        console.log(
          "Adding new image files to article data:",
          newImageFiles.length
        );
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
            <Label>Главное изображение</Label>
            <MainImageUpload
              mainImageUrl={mainImageUrl}
              onImageChange={setMainImage}
              onUrlChange={(url) => {
                setMainImageUrl(url);
                setMainImagePreview(url);
              }}
              onRemove={removeMainImage}
            />
          </div>
          <div className="space-y-2">
            <Label>Теги</Label>
            <TagManager
              tags={tags}
              availableTags={allTags}
              onTagsChange={handleTagsChange}
              isCreatingTag={createTagMutation.isPending}
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
