import apiClient from '../axios';

export interface Article {
  id: string;
  title: string;
  content: string;
  image?: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  image?: string;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  image?: string;
}

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
    const { data } = await apiClient.post<Article>('/articles', article);
    return data;
  },
  
  update: async (id: string, article: UpdateArticleDto): Promise<Article> => {
    const { data } = await apiClient.patch<Article>(`/articles/${id}`, article);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  }
};
