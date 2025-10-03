"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Tag } from "@/lib/api/articles";

interface TagManagerProps {
  tags: string[];
  availableTags?: Tag[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagManager({
  tags,
  availableTags = [],
  onTagsChange,
}: TagManagerProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const addExistingTag = (tagName: string) => {
    if (!tags.includes(tagName)) {
      onTagsChange([...tags, tagName]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Текущие теги */}
      {tags.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Выбранные теги:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Добавление нового тега */}
      <div>
        <Label htmlFor="new-tag">Добавить новый тег:</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="new-tag"
            type="text"
            placeholder="Введите название тега"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!newTag.trim() || tags.includes(newTag.trim())}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Существующие теги */}
      {availableTags.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Доступные теги:</Label>
          <div className="flex flex-wrap gap-1 mt-2">
            {availableTags
              .filter((tag) => !tags.includes(tag.name))
              .map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExistingTag(tag.name)}
                  className="h-7 px-2 text-xs"
                >
                  {tag.name}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
