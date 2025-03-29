import apiClient from '../axios';

export interface Article {
  id: string;
  title: string;
  content: string;
  images?: string[];
}

export interface CreateArticleDto {
  title: string;
  content: string;
  images?: File | File[];
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  images?: File | File[];
}

// Helper function to create FormData from article data
const createFormData = (article: CreateArticleDto | UpdateArticleDto): FormData => {
  // Создаем новый FormData объект
  const formData = new FormData();
  
  // Добавляем title - точно как в Postman
  if (article.title) {
    formData.append('title', article.title);
  }
  
  // Добавляем content с ограничением длины
  if (article.content) {
    // Ограничиваем до 65000 символов для предотвращения ошибки "Field value too long"
    const limitedContent = article.content.substring(0, 65000);
    formData.append('content', limitedContent);
  }
  
  // Добавляем images - точно как в Postman
  if (article.images) {
    if (Array.isArray(article.images)) {
      // Если массив файлов, берем только первый (как в Postman)
      if (article.images.length > 0) {
        formData.append('images', article.images[0]);
      }
    } else {
      // Если один файл
      formData.append('images', article.images);
    }
  }
  
  return formData;
};

export const articlesApi = {
  getAll: async (): Promise<Article[]> => {
    const { data } = await apiClient.get<Article[]>('/articles');
    return data;
  },

  getById: async (id: string): Promise<Article> => {
    const { data } = await apiClient.get<Article>(`/articles/${id}`);
    return data;
  },

  create: async (article: CreateArticleDto): Promise<Article> => {
    try {
      // Create FormData for multipart/form-data
      const formData = createFormData(article);
      
      // Важно: НЕ устанавливаем Content-Type вручную для FormData
      // Браузер сам установит правильный Content-Type с boundary
      const { data } = await apiClient.post<Article>('/articles', formData);
      
      return data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  update: async (id: string, article: UpdateArticleDto): Promise<Article> => {
    try {
      // Create FormData for multipart/form-data
      const formData = createFormData(article);
      
      // Важно: НЕ устанавливаем Content-Type вручную для FormData
      // Браузер сам установит правильный Content-Type с boundary
      const { data } = await apiClient.patch<Article>(`/articles/${id}`, formData);
      
      return data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  }
};
