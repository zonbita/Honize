export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'trash';

export interface ArticleSeo {
  metaTitle: string;
  metaDescription: string;
  seoUrl: string;
  originalUrl: string;
  redirect: string | null;
  score: number;
  indexStatus: 'good' | 'warning' | 'error';
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: ArticleStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  views: number;
  seo: ArticleSeo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  slug?: string;
  excerpt?: string;
  thumbnail?: string;
  author?: string;
  category?: string;
  status?: ArticleStatus;
  content?: string;
  seo?: Partial<ArticleSeo>;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  views?: number;
}
