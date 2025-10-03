"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";

interface MainImageUploadProps {
  mainImageUrl?: string;
  onImageChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  isUploading?: boolean;
}

export default function MainImageUpload({
  mainImageUrl,
  onImageChange,
  onUrlChange,
  onRemove,
  isUploading = false,
}: MainImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    mainImageUrl || null
  );
  const [urlInput, setUrlInput] = useState(mainImageUrl || "");

  // Обновляем состояние когда изменяется mainImageUrl (например, при загрузке новой статьи)
  useEffect(() => {
    setPreviewUrl(mainImageUrl || null);
    setUrlInput(mainImageUrl || "");
  }, [mainImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageChange(file);

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onUrlChange(url);
    if (url) {
      setPreviewUrl(url);
      onImageChange(null); // Очищаем файл при вводе URL
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUrlInput("");
    onRemove();

    // Очищаем input файла
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Главное изображение"
            className="w-full max-w-md h-48 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="main-image-file">Загрузить файл</Label>
          <Input
            id="main-image-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="text-sm text-gray-500">Загрузка...</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="main-image-url">Или URL изображения</Label>
          <Input
            id="main-image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="text-sm text-gray-500">Сохранение...</div>
          )}
        </div>
      </div>
    </div>
  );
}
