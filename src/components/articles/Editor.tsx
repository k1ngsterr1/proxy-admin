"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  FileImage,
  Pilcrow,
  TextQuote,
  Code,
  Link as LinkIcon,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Tiptap imports
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import axios from "@/lib/axios";

// Add custom CSS for the editor
import "./editor.css";

interface SavedLinkSelection {
  from: number;
  to: number;
  isLink: boolean;
  text: string;
}

interface ArticleEditorProps {
  content: string;
  onChange: (content: string) => void;
  value?: string; // для обратной совместимости
  images?: string[]; // массив URL изображений
  mainImageUrl?: string; // главное изображение
  onMainImageChange?: (url: string) => void; // колбэк для изменения главного изображения
}

export default function ArticleEditor({
  content,
  onChange,
  value,
  images = [],
  mainImageUrl,
  onMainImageChange,
}: ArticleEditorProps) {
  // Используем value если он есть, иначе content
  const currentContent = value || content;
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState("");
  const linkSelectionRef = useRef<SavedLinkSelection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Инициализация редактора Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Убедимся, что orderedList правильно настроен
        orderedList: {
          keepMarks: true,
          keepAttributes: true, // Сохраняет атрибуты при переключении между списками
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        // Улучшаем обработку удаления
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-500 underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Начните писать статью здесь...",
      }),
      TextStyle,
      Color,
    ],
    content: currentContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (_, event) => {
          // Улучшение обработки удаления
          if (event.key === "Backspace" || event.key === "Delete") {
            // Позволяем стандартной обработке продолжиться
            return false;
          }
          return false;
        },
        click: (view, event) => {
          // Улучшенное позиционирование курсора при клике
          const target = event.target as HTMLElement;

          const link = target.closest("a");
          if (link && view.dom.contains(link)) {
            event.preventDefault();

            const from = view.posAtDOM(link, 0);
            const to = view.posAtDOM(link, link.childNodes.length);
            const selection = TextSelection.create(view.state.doc, from, to);

            view.dispatch(view.state.tr.setSelection(selection));
            return true;
          }

          // Если кликнули на изображение
          if (target.tagName === "IMG") {
            event.preventDefault();

            try {
              const pos = view.posAtDOM(target, 0);
              const $pos = view.state.doc.resolve(pos);

              // Пытаемся поставить курсор после изображения
              const after = Math.min($pos.after(), view.state.doc.content.size);

              if (after > 0 && after <= view.state.doc.content.size) {
                const selection = TextSelection.near(
                  view.state.doc.resolve(after)
                );
                const tr = view.state.tr.setSelection(selection);
                view.dispatch(tr);
              }
            } catch (error) {
              console.log("Error positioning cursor:", error);
            }

            return true;
          }

          // Для других элементов позволяем стандартную обработку
          return false;
        },
      },
    },
  });

  // Простое обновление контента без сложной обработки маркеров
  useEffect(() => {
    if (!editor) return;

    console.log("🔄 Updating editor content");
    console.log("Current content:", currentContent);

    if (currentContent !== editor.getHTML()) {
      console.log("📝 Setting content in editor");
      editor.commands.setContent(currentContent || "");
    }
  }, [currentContent, editor]);

  // Удаляем функцию processStructuredContent так как она больше не нужна

  // Обработчик выбора изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Создаем предварительный просмотр
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Загрузка изображения на сервер
  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.post("/articles/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Image upload response:", response.data);
      return response.data.imageUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);

      // Show user-friendly error message
      if (error.response?.status === 413) {
        alert(
          "Image file is too large. Please choose a smaller image (max 10MB)."
        );
      } else if (error.response?.status === 400) {
        alert(
          "Invalid file type. Please select a valid image file (JPG, PNG, GIF, WebP)."
        );
      } else if (error.response?.status === 401) {
        alert("You are not authorized to upload images. Please log in again.");
      } else {
        alert("Failed to upload image. Please try again.");
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Добавление изображения в редактор
  const insertImage = async () => {
    if (imageFile && editor) {
      // Загружаем изображение на сервер
      const imageUrl = await uploadImage();

      // Если загрузка не удалась, используем предпросмотр (data URL)
      const src = imageUrl || imagePreview;

      if (src) {
        // Вставляем изображение в редактор в текущую позицию курсора
        editor
          .chain()
          .focus()
          .setImage({
            src: src,
            alt: imageFile.name || "Uploaded image",
            title: imageFile.name || "Uploaded image",
          })
          .run();

        // Сразу обновляем содержимое в родительском компоненте
        setTimeout(() => {
          const html = editor.getHTML();
          onChange(html);
          console.log(
            "🖼️ Image inserted, content updated:",
            html.substring(0, 200) + "..."
          );
        }, 100);
      }

      // Закрываем диалог
      setImageDialogOpen(false);
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    setLinkError("");
    linkSelectionRef.current = null;
  };

  const openLinkDialog = () => {
    if (!editor) return;

    const isLink = editor.isActive("link");
    if (isLink && editor.state.selection.empty) {
      editor.chain().extendMarkRange("link").run();
    }

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");

    linkSelectionRef.current = { from, to, isLink, text };
    setLinkUrl(isLink ? editor.getAttributes("link").href || "" : "");
    setLinkText(text);
    setLinkError("");
    setLinkDialogOpen(true);
  };

  const normalizeLinkUrl = (value: string) => {
    const trimmedUrl = value.trim();

    if (/^(\/(?!\/)|#)/.test(trimmedUrl)) {
      return trimmedUrl;
    }

    if (/^(mailto:|tel:)/i.test(trimmedUrl)) {
      return trimmedUrl;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    try {
      const parsedUrl = new URL(normalizedUrl);
      return ["http:", "https:"].includes(parsedUrl.protocol)
        ? parsedUrl.toString()
        : null;
    } catch {
      return null;
    }
  };

  const insertLink = () => {
    if (!editor || !linkSelectionRef.current) return;

    const href = normalizeLinkUrl(linkUrl);
    if (!href) {
      setLinkError("Введите корректный URL");
      return;
    }

    const savedSelection = linkSelectionRef.current;
    const text = linkText.trim() || href;
    const chain = editor
      .chain()
      .focus()
      .setTextSelection({
        from: savedSelection.from,
        to: savedSelection.to,
      });

    if (savedSelection.isLink && savedSelection.from === savedSelection.to) {
      chain
        .extendMarkRange("link")
        .setLink({ href, target: "_blank" })
        .run();
    } else if (savedSelection.from !== savedSelection.to) {
      if (linkText.trim() && linkText !== savedSelection.text) {
        chain
          .deleteSelection()
          .insertContent({
            type: "text",
            text,
            marks: [
              {
                type: "link",
                attrs: { href, target: "_blank" },
              },
            ],
          })
          .run();
      } else {
        chain.setLink({ href, target: "_blank" }).run();
      }
    } else {
      chain
        .insertContent({
          type: "text",
          text,
          marks: [
            {
              type: "link",
              attrs: { href, target: "_blank" },
            },
          ],
        })
        .run();
    }

    onChange(editor.getHTML());
    closeLinkDialog();
  };

  const removeLink = () => {
    if (!editor || !linkSelectionRef.current) return;

    const savedSelection = linkSelectionRef.current;
    const chain = editor
      .chain()
      .focus()
      .setTextSelection({
        from: savedSelection.from,
        to: savedSelection.to,
      });

    if (savedSelection.from === savedSelection.to) {
      chain.extendMarkRange("link");
    }

    chain.unsetLink().run();
    onChange(editor.getHTML());
    closeLinkDialog();
  };

  // Функции для управления форматированием
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleHeading1 = () =>
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleHeading2 = () =>
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () =>
    editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () =>
    editor?.chain().focus().toggleBlockquote().run();
  const setHardBreak = () => editor?.chain().focus().setHardBreak().run();
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();
  // Функция для установки изображения как главное
  const setAsMainImage = (imageUrl: string) => {
    if (onMainImageChange) {
      onMainImageChange(imageUrl);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="bg-secondary p-2 flex flex-wrap gap-1 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          className={editor?.isActive("bold") ? "bg-accent" : ""}
          title="Жирный"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          className={editor?.isActive("italic") ? "bg-accent" : ""}
          title="Курсив"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleHeading1}
          className={
            editor?.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }
          title="Заголовок 1"
        >
          <Heading1 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleHeading2}
          className={
            editor?.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
          title="Заголовок 2"
        >
          <Heading2 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          className={editor?.isActive("bulletList") ? "bg-accent" : ""}
          title="Маркированный список"
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleOrderedList}
          className={editor?.isActive("orderedList") ? "bg-accent" : ""}
          title="Нумерованный список"
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBlockquote}
          className={editor?.isActive("blockquote") ? "bg-accent" : ""}
          title="Цитата"
        >
          <TextQuote size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleCodeBlock}
          className={editor?.isActive("codeBlock") ? "bg-accent" : ""}
          title="Блок кода"
        >
          <Code size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setHardBreak}
          title="Разрыв строки"
        >
          <Pilcrow size={16} />
        </Button>

        {/* Кнопка для добавления изображения */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Добавить изображение"
            >
              <FileImage size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить изображение</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm mb-2">Предварительный просмотр:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-[200px] object-contain border rounded"
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={insertImage}
                disabled={!imagePreview || isUploading}
                className="image-upload-button"
              >
                {isUploading ? "Загрузка..." : "Добавить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Кнопка для добавления ссылки */}
        <Dialog
          open={linkDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeLinkDialog();
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={
              editor?.isActive("link")
                ? "Изменить ссылку"
                : "Добавить ссылку"
            }
            className={editor?.isActive("link") ? "bg-accent" : ""}
            onClick={openLinkDialog}
          >
            <LinkIcon size={16} />
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {linkSelectionRef.current?.isLink
                  ? "Изменить ссылку"
                  : "Добавить ссылку"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError("");
                  }}
                  aria-invalid={Boolean(linkError)}
                />
                {linkError && (
                  <p className="text-sm text-destructive">{linkError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="text">Текст ссылки (опционально)</Label>
                <Input
                  id="text"
                  type="text"
                  placeholder="Текст ссылки"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="flex-1"
                >
                  {linkSelectionRef.current?.isLink
                    ? "Сохранить"
                    : "Добавить"}
                </Button>
                {linkSelectionRef.current?.isLink && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={removeLink}
                  >
                    Удалить ссылку
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          title="Отменить"
        >
          <Undo size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={redo}
          title="Повторить"
        >
          <Redo size={16} />
        </Button>
      </div>

      {/* Редактор Tiptap */}
      <div className="tiptap-editor-wrapper">
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            {editor.isActive("image") ? (
              // Меню для изображений
              <div className="flex bg-white border rounded-md shadow-sm">
                {onMainImageChange && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const selectedImage = editor.getAttributes("image");
                      if (selectedImage.src) {
                        setAsMainImage(selectedImage.src);
                      }
                    }}
                    title="Установить как главное изображение"
                  >
                    <Star size={14} />
                  </Button>
                )}
              </div>
            ) : (
              // Обычное меню для текста
              <div className="flex bg-white border rounded-md shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleBold}
                >
                  <Bold size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleItalic}
                >
                  <Italic size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={openLinkDialog}
                  className={editor.isActive("link") ? "bg-accent" : ""}
                >
                  <LinkIcon size={14} />
                </Button>
              </div>
            )}
          </BubbleMenu>
        )}
        <EditorContent
          editor={editor}
          className="p-4 min-h-[400px] prose max-w-none editor-content"
        />
      </div>

      {/* Стили для редактора, чтобы соответствовать стилю админ-панели */}
      <style jsx global>{`
        /* Стилизация кнопок форматирования */
        .bg-accent svg {
          color: #000 !important; /* Черный цвет иконок даже при активном состоянии */
        }

        /* Стилизация контейнера редактора */
        .tiptap-editor-wrapper .ProseMirror {
          outline: none;
          min-height: 400px;
          font-family: inherit;
        }

        /* Стилизация области редактирования */
        .tiptap-editor-wrapper .ProseMirror p {
          margin: 0.5em 0;
        }

        /* Стилизация placeholder */
        .tiptap-editor-wrapper
          .ProseMirror
          p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* Стилизация изображений в редакторе */
        .tiptap-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.25rem;
          display: block;
          cursor: pointer;
        }

        /* Добавляем отступы вокруг изображений для лучшего позиционирования курсора */
        .tiptap-editor-wrapper .ProseMirror img + p,
        .tiptap-editor-wrapper .ProseMirror p + img {
          margin-top: 1rem;
        }

        /* Стилизация пустых параграфов для лучшего позиционирования */
        .tiptap-editor-wrapper .ProseMirror p:empty {
          min-height: 1.5em;
          margin: 0.25rem 0;
        }

        /* Улучшенная стилизация для лучшего UX */
        .tiptap-editor-wrapper .ProseMirror {
          line-height: 1.6;
          padding: 1rem;
        }

        /* Подсветка выделенных изображений */
        .tiptap-editor-wrapper .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Стилизация заголовков */
        .tiptap-editor-wrapper .ProseMirror h1 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .tiptap-editor-wrapper .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        /* Стилизация списков */
        .tiptap-editor-wrapper .ProseMirror ul,
        .tiptap-editor-wrapper .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        /* Стилизация цитат */
        .tiptap-editor-wrapper .ProseMirror blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }

        /* Стилизация блоков кода */
        .tiptap-editor-wrapper .ProseMirror pre {
          background-color: #f1f5f9;
          border-radius: 0.25rem;
          padding: 0.75rem;
          font-family: monospace;
          overflow-x: auto;
        }

        /* Стилизация ссылок */
        .tiptap-editor-wrapper .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        /* Улучшение выделения текста */
        .tiptap-editor-wrapper .ProseMirror ::selection {
          background: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}
