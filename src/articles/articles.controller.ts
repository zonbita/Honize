import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Redirect,
  Render,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './articles.types';

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('api/articles')
  listApi() {
    return this.articlesService.findAll();
  }

  @Get('api/articles/:slug')
  getApi(@Param('slug') slug: string) {
    const article = this.articlesService.findBySlug(slug);
    return { ...article, content: this.articlesService.getContent(slug) };
  }

  @Post('api/articles')
  createApi(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Put('api/articles/:slug')
  updateApi(@Param('slug') slug: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(slug, dto);
  }

  @Delete('api/articles/:slug')
  deleteApi(@Param('slug') slug: string) {
    this.articlesService.delete(slug, true);
    return { ok: true };
  }

  @Get('blog')
  @Render('pages/blog-list')
  blogList() {
    const articles = this.articlesService.getLatestForBlog(50);
    return {
      pageTitle: 'Bản tin chuyên ngành',
      blogPosts: articles.map((a) => this.articlesService.toBlogPost(a)),
      year: new Date().getFullYear(),
    };
  }

  @Get('blog/:slug')
  @Render('pages/blog-detail')
  blogDetail(@Param('slug') slug: string) {
    const article = this.articlesService.findBySlug(slug);
    const content = this.articlesService.getContent(slug);
    const contentIsHtml = this.articlesService.isHtmlContent(content);
    return {
      pageTitle: article.title,
      article,
      content,
      contentIsHtml,
      formattedDate: article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
        : '',
    };
  }

  @Get('dashboard/articles/new')
  @Render('dashboard/article-form')
  newForm() {
    return {
      layout: 'dashboard',
      pageTitle: 'Tạo bài viết',
      activeNav: 'articles',
      isEdit: false,
      article: {
        title: '',
        slug: '',
        excerpt: '',
        thumbnail: '',
        author: 'Admin',
        category: 'Tin tức',
        status: 'draft',
        content: '',
        metaTitle: '',
        metaDescription: '',
        seoUrl: '',
      },
      navItems: this.getNavItems(),
      user: this.getUser(),
    };
  }

  @Get('dashboard/articles/:slug/edit')
  @Render('dashboard/article-form')
  editForm(@Param('slug') slug: string) {
    const article = this.articlesService.findBySlug(slug);
    const content = this.articlesService.getContent(slug);
    return {
      layout: 'dashboard',
      pageTitle: 'Chỉnh sửa bài viết',
      activeNav: 'articles',
      isEdit: true,
      article: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        thumbnail: article.thumbnail,
        author: article.author,
        category: article.category,
        status: article.status,
        content,
        metaTitle: article.seo.metaTitle,
        metaDescription: article.seo.metaDescription,
        seoUrl: article.seo.seoUrl,
      },
      navItems: this.getNavItems(),
      user: this.getUser(),
    };
  }

  @Post('dashboard/articles')
  @Redirect('/dashboard')
  createForm(@Body() body: Record<string, string>) {
    this.articlesService.create(this.parseForm(body));
    return {};
  }

  @Post('dashboard/articles/:slug')
  @Redirect('/dashboard')
  updateForm(@Param('slug') slug: string, @Body() body: Record<string, string>) {
    this.articlesService.update(slug, this.parseForm(body));
    return {};
  }

  private parseForm(body: Record<string, string>): CreateArticleDto {
    return {
      title: body.title,
      slug: body.slug || undefined,
      excerpt: body.excerpt,
      thumbnail: body.thumbnail || undefined,
      author: body.author,
      category: body.category,
      status: body.status as CreateArticleDto['status'],
      content: body.content,
      seo: {
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        seoUrl: body.seoUrl,
      },
    };
  }

  private getNavItems() {
    return [
      { id: 'overview', label: 'Tổng quan', icon: 'grid', href: '/dashboard/behavior-tree' },
      { id: 'articles', label: 'Quản lý bài viết', icon: 'document', href: '/dashboard' },
      { id: 'categories', label: 'Danh mục', icon: 'folder', href: '/dashboard' },
      { id: 'media', label: 'Media', icon: 'image', href: '/dashboard' },
      { id: 'seo', label: 'SEO Link', icon: 'link', href: '/dashboard' },
      { id: 'users', label: 'Người dùng', icon: 'users', href: '/dashboard' },
      { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/dashboard' },
    ];
  }

  private getUser() {
    return { name: 'Admin', role: 'Quản trị viên', avatar: 'AD', notifications: 12 };
  }
}
