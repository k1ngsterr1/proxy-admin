"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  Code
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

interface ArticleEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Начните писать статью здесь...',
      }),
      TextStyle,
      Color,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Обработчик выбора изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Создаем предварительный просмотр
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Добавление изображения в редактор
  const insertImage = () => {
    if (imagePreview && editor) {
      editor.chain().focus().setImage({ src: imagePreview }).run()
      setImageDialogOpen(false)
      setImageFile(null)
      setImagePreview(null)
    }
  }

  // Функции для управления форматированием
  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleHeading1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run()
  const toggleHeading2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
  const setHardBreak = () => editor?.chain().focus().setHardBreak().run()
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()
  const undo = () => editor?.chain().focus().undo().run()
  const redo = () => editor?.chain().focus().redo().run()

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="bg-secondary p-2 flex flex-wrap gap-1 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          className={editor?.isActive('bold') ? 'bg-accent' : ''}
          title="Жирный"
        >
          <Bold size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          className={editor?.isActive('italic') ? 'bg-accent' : ''}
          title="Курсив"
        >
          <Italic size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleHeading1}
          className={editor?.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
          title="Заголовок 1"
        >
          <Heading1 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleHeading2}
          className={editor?.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          title="Заголовок 2"
        >
          <Heading2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          className={editor?.isActive('bulletList') ? 'bg-accent' : ''}
          title="Маркированный список"
        >
          <List size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOrderedList}
          className={editor?.isActive('orderedList') ? 'bg-accent' : ''}
          title="Нумерованный список"
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBlockquote}
          className={editor?.isActive('blockquote') ? 'bg-accent' : ''}
          title="Цитата"
        >
          <TextQuote size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCodeBlock}
          className={editor?.isActive('codeBlock') ? 'bg-accent' : ''}
          title="Блок кода"
        >
          <Code size={16} />
        </Button>
        <Button
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
            <Button variant="ghost" size="sm" title="Добавить изображение">
              <FileImage size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить изображение</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
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
                onClick={insertImage}
                disabled={!imagePreview}
              >
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          title="Отменить"
        >
          <Undo size={16} />
        </Button>
        <Button
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
        <EditorContent editor={editor} className="p-4 min-h-[400px] prose max-w-none" />
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
        .tiptap-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
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
      `}</style>
    </div>
  )
}
