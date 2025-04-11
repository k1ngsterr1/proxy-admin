import apiClient from '../axios';

export interface Article {
  id: string;
  title: string;
  content: string;
  images?: string[];
  lang: "ru" | "en"
}

export interface CreateArticleDto {
  title: string;
  content: string;
  images?: File | File[];
  lang: 'ru' | 'en'
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  images?: File | File[];
  lang: 'ru' | 'en'
}

const createFormData = (article: CreateArticleDto | UpdateArticleDto): FormData => {
  const formData = new FormData();

  if (article.title) formData.append("title", article.title);
  if (article.content) formData.append("content", article.content.substring(0, 65000));
  if (article.lang) formData.append("lang", article.lang);

  if (article.images) {
    const image = Array.isArray(article.images) ? article.images[0] : article.images;
    formData.append("images", image);
  }

  return formData;
};

export const articlesApi = {
  getAll: async (lang: "ru" | "en"): Promise<Article[]> => {
    const { data } = await apiClient.get<Article[]>(`/articles?lang=${lang}`);
    return data;
  },

  getById: async (id: string): Promise<Article> => {
    const { data } = await apiClient.get<Article>(`/articles/${id}`);
    return data;
  },

  create: async (article: CreateArticleDto): Promise<Article> => {
    try {
      const formData = createFormData(article);

      const { data } = await apiClient.post<Article>(
        '/articles',
        formData
      );

      return data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  update: async (id: string, article: UpdateArticleDto): Promise<Article> => {
    try {
      const formData = createFormData(article);

      const { data } = await apiClient.patch<Article>(
        `/articles/${id}`,
        formData
      );

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
