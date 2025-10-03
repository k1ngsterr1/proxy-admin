import apiClient from "../axios";

export interface Tag {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  images?: string[];
  mainImageUrl?: string;
  mainImage?: string; // Добавляем поле mainImage
  tags?: Tag[];
  lang: "ru" | "en";
}

export interface CreateArticleDto {
  title: string;
  content: string;
  images?: File | File[];
  mainImage?: File;
  mainImageUrl?: string;
  tags?: string[];
  lang: "ru" | "en";
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  images?: File | File[];
  mainImage?: File;
  mainImageUrl?: string;
  tags?: string[];
  lang?: "ru" | "en";
}

const createFormData = (
  article: CreateArticleDto | UpdateArticleDto
): FormData => {
  const formData = new FormData();

  if (article.title) formData.append("title", article.title);
  if (article.content)
    formData.append("content", article.content.substring(0, 65000));
  if (article.lang) formData.append("lang", article.lang);

  if (article.images) {
    const image = Array.isArray(article.images)
      ? article.images[0]
      : article.images;
    formData.append("images", image);
  }

  // Главное изображение
  if (article.mainImage) {
    formData.append("mainImage", article.mainImage);
  }
  if (article.mainImageUrl) {
    formData.append("mainImageUrl", article.mainImageUrl);
  }

  // Теги
  if (article.tags && article.tags.length > 0) {
    article.tags.forEach((tag) => {
      formData.append("tags[]", tag);
    });
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

      const { data } = await apiClient.post<Article>("/articles", formData);

      return data;
    } catch (error) {
      console.error("Error creating article:", error);
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
      console.error("Error updating article:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },

  // API для работы с тегами
  getAllTags: async (): Promise<Tag[]> => {
    const { data } = await apiClient.get<Tag[]>("/articles/tags");
    return data;
  },

  createTag: async (name: string): Promise<Tag> => {
    const { data } = await apiClient.post<Tag>("/articles/tags", { name });
    return data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/tags/${id}`);
  },

  updateArticleTags: async (id: string, tags: string[]): Promise<Article> => {
    const { data } = await apiClient.patch<Article>(`/articles/${id}/tags`, {
      tags,
    });
    return data;
  },

  getArticlesByTag: async (
    tagName: string,
    lang: "ru" | "en",
    page = 1,
    limit = 10
  ): Promise<Article[]> => {
    const { data } = await apiClient.get<Article[]>(
      `/articles/by-tag/${tagName}?lang=${lang}&page=${page}&limit=${limit}`
    );
    return data;
  },

  // API для работы с главным изображением
  setMainImage: async (id: string, mainImage: File): Promise<Article> => {
    const formData = new FormData();
    formData.append("mainImage", mainImage);
    const { data } = await apiClient.patch<Article>(
      `/articles/main-image/${id}`,
      formData
    );
    return data;
  },

  setMainImageByUrl: async (
    id: string,
    mainImageUrl: string
  ): Promise<Article> => {
    const { data } = await apiClient.patch<Article>(
      `/articles/main-image/${id}/url`,
      { mainImageUrl }
    );
    return data;
  },

  removeMainImage: async (id: string): Promise<Article> => {
    const { data } = await apiClient.delete<Article>(
      `/articles/main-image/${id}`
    );
    return data;
  },
};
