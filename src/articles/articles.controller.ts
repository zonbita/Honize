import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Redirect,
  Render,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { loadPublicSiteData } from '../shared/site-settings';
import { getCurrentAuthUser } from '../auth/auth-context';
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

  @Post('api/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpeg|png|gif|webp|svg\+xml)$/i.test(file.mimetype);
        cb(ok ? null : new Error('Chỉ chấp nhận ảnh JPG, PNG, GIF, WebP, SVG'), ok);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.articlesService.uploadImage(file);
  }

  @Get('blog')
  @Render('pages/blog-list')
  blogList() {
    const site = loadPublicSiteData();
    const articles = this.articlesService.getLatestForBlog(50);
    return this.withLayout('Bản tin chuyên ngành', {
      blogPosts: articles.map((a) => this.articlesService.toBlogPost(a)),
      seo: this.articlesService.buildStaticPageSeo(
        'Bản tin chuyên ngành',
        `Tin tức, hướng dẫn và xu hướng mới nhất từ ${site.brand}`,
        '/blog',
        site.brand,
      ),
    });
  }

  @Get('blog/:slug')
  @Render('pages/blog-detail')
  blogDetail(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { article, counted } = this.articlesService.recordView(slug, req.headers.cookie);
    if (counted) {
      res.setHeader(
        'Set-Cookie',
        `hv_${slug}=1; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax`,
      );
    }

    const contentHtml = this.articlesService.renderContent(slug);
    const dateSource = article.publishedAt ?? article.scheduledAt ?? article.createdAt;

    return this.withLayout(article.title, {
      article,
      contentHtml,
      dateLabel: this.articlesService.formatArticleDate(dateSource),
      dateIso: dateSource,
      viewsLabel: article.views > 0 ? this.articlesService.formatViewCount(article.views) : null,
      seo: this.articlesService.buildArticlePageSeo(article, loadPublicSiteData().brand),
    });
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  sitemap() {
    return this.articlesService.buildSitemapXml();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots() {
    return this.articlesService.buildRobotsTxt();
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
    this.articlesService.update(slug, this.parseForm(body, slug));
    return {};
  }

  private parseForm(body: Record<string, string>, slug?: string): CreateArticleDto {
    const resolvedSlug = body.slug || slug || '';
    const blogPath = resolvedSlug ? `/blog/${resolvedSlug}` : '';

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
        seoUrl: body.seoUrl || blogPath,
      },
    };
  }

  private getNavItems() {
    return [
      { id: 'overview', label: 'Tổng quan', icon: 'grid', href: '/dashboard/behavior-tree' },
      { id: 'articles', label: 'Quản lý bài viết', icon: 'document', href: '/dashboard' },
      { id: 'categories', label: 'Danh mục', icon: 'folder', href: '/dashboard/categories' },
      { id: 'projects', label: 'Dự án mẫu', icon: 'layout', href: '/dashboard/projects' },
      { id: 'media', label: 'Media', icon: 'image', href: '/dashboard/media' },
      { id: 'seo', label: 'SEO Link', icon: 'link', href: '/dashboard/seo' },
      { id: 'stats', label: 'Thống kê', icon: 'chart', href: '/dashboard/stats' },
      { id: 'users', label: 'Người dùng', icon: 'users', href: '/dashboard/users' },
      { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/dashboard/settings' },
    ];
  }

  private getUser() {
    const authUser = getCurrentAuthUser();
    if (authUser) {
      return {
        name: authUser.name,
        role: authUser.role,
        avatar: authUser.avatar,
        notifications: 0,
      };
    }
    return { name: 'Admin', role: 'Quản trị viên', avatar: 'AD', notifications: 0 };
  }

  private withLayout(pageTitle: string, data: Record<string, unknown>) {
    const site = loadPublicSiteData();
    const blogPosts = this.articlesService
      .getLatestForBlog(5)
      .map((a) => this.articlesService.toBlogPost(a));

    return {
      ...site,
      blogPosts,
      pageTitle,
      year: new Date().getFullYear(),
      ...data,
    };
  }
}
