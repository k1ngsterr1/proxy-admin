"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";

interface MainImageUploadProps {
  mainImageUrl?: string;
  previewUrl?: string | null;
  onImageChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
  isUploading?: boolean;
}

export default function MainImageUpload({
  mainImageUrl,
  previewUrl,
  onImageChange,
  onUrlChange,
  onRemove,
  isUploading = false,
}: MainImageUploadProps) {
  const displayedPreview = previewUrl || mainImageUrl || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageChange(file);
    }
  };

  const handleUrlChange = (url: string) => {
    onUrlChange(url);
    if (url) {
      onImageChange(null); // Очищаем файл при вводе URL
    }
  };

  const handleRemove = () => {
    onRemove();

    // Очищаем input файла
    const fileInput = document.getElementById(
      "main-image-file"
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {displayedPreview ? (
        <div className="relative">
          <img
            src={displayedPreview}
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
      ) : (
        <div className="w-full max-w-md h-48 bg-gray-100 border border-dashed border-gray-300 rounded-md flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Upload size={48} className="mx-auto mb-2" />
            <p className="text-sm">Изображение не загружено</p>
            <p className="text-xs">Загрузите файл или укажите URL</p>
          </div>
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
            value={mainImageUrl || ""}
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
