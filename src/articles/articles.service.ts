import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { getUploadsDir } from '../shared/content-path';
import { getArticlesDir } from '../shared/content-path';
import { bumpDevRevision } from '../shared/dev-reload';
import { getSiteUrl, toAbsoluteUrl } from '../shared/site-url';
import {
  Article,
  ArticleStatus,
  CreateArticleDto,
  PageSeo,
  UpdateArticleDto,
} from './articles.types';

const CATEGORY_COLORS: Record<string, string> = {
  'Du lịch': 'bg-brand-100 text-brand-700',
  'Công nghệ': 'bg-purple-100 text-purple-700',
  Marketing: 'bg-pink-100 text-pink-700',
  'Giải pháp': 'bg-indigo-100 text-indigo-700',
  'Tin tức': 'bg-slate-100 text-slate-700',
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  scheduled: 'Đã lên lịch',
  trash: 'Thùng rác',
};

const STATUS_COLORS: Record<ArticleStatus, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-orange-100 text-orange-700',
  scheduled: 'bg-purple-100 text-purple-700',
  trash: 'bg-red-100 text-red-700',
};

const INDEX_STATUS_MAP = {
  good: { label: 'Tốt', color: 'bg-green-100 text-green-700' },
  warning: { label: 'Cần sửa', color: 'bg-orange-100 text-orange-700' },
  error: { label: 'Lỗi 404', color: 'bg-red-100 text-red-700' },
};

@Injectable()
export class ArticlesService {
  private ensureDir() {
    const dir = getArticlesDir();
    if (!existsSync(dir)) {
      try {
        mkdirSync(dir, { recursive: true });
      } catch {
        // Read-only filesystem (Vercel) — read paths still work if files are bundled
      }
    }
    return dir;
  }

  private jsonPath(slug: string) {
    return join(this.ensureDir(), `${slug}.json`);
  }

  private mdPath(slug: string) {
    return join(this.ensureDir(), `${slug}.md`);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatNumber(n: number): string {
    return n.toLocaleString('vi-VN');
  }

  formatViewCount(views: number): string {
    return this.formatNumber(views);
  }

  private parseCookies(header?: string): Record<string, string> {
    if (!header) return {};
    return Object.fromEntries(
      header.split(';').map((part) => {
        const [key, ...rest] = part.trim().split('=');
        return [key, decodeURIComponent(rest.join('=') || '')];
      }),
    );
  }

  recordView(slug: string, cookieHeader?: string): { article: Article; counted: boolean } {
    const article = this.findBySlug(slug);
    if (article.status !== 'published' && article.status !== 'scheduled') {
      throw new NotFoundException();
    }

    const viewKey = `hv_${slug}`;
    if (this.parseCookies(cookieHeader)[viewKey]) {
      return { article, counted: false };
    }

    const updated: Article = {
      ...article,
      views: article.views + 1,
    };
    this.writeJson(updated);
    return { article: updated, counted: true };
  }

  private formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatBlogDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const months = [
      'THÁNG 1', 'THÁNG 2', 'THÁNG 3', 'THÁNG 4', 'THÁNG 5', 'THÁNG 6',
      'THÁNG 7', 'THÁNG 8', 'THÁNG 9', 'THÁNG 10', 'THÁNG 11', 'THÁNG 12',
    ];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  }

  formatArticleDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  }

  private readJson(slug: string): Article {
    const path = this.jsonPath(slug);
    if (!existsSync(path)) throw new NotFoundException(`Article "${slug}" not found`);
    return JSON.parse(readFileSync(path, 'utf-8')) as Article;
  }

  private writeJson(article: Article) {
    writeFileSync(this.jsonPath(article.slug), JSON.stringify(article, null, 2), 'utf-8');
    bumpDevRevision();
  }

  private saveContent(slug: string, content: string) {
    writeFileSync(this.mdPath(slug), content, 'utf-8');
    bumpDevRevision();
  }

  findAll(includeTrash = false): Article[] {
    const dir = getArticlesDir();
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    const articles = files.map((f) =>
      JSON.parse(readFileSync(join(dir, f), 'utf-8')) as Article,
    );
    return articles
      .filter((a) => includeTrash || a.status !== 'trash')
      .sort((a, b) => b.id - a.id);
  }

  findBySlug(slug: string): Article {
    return this.readJson(slug);
  }

  getContent(slug: string): string {
    const path = this.mdPath(slug);
    return existsSync(path) ? readFileSync(path, 'utf-8') : '';
  }

  isHtmlContent(content: string): boolean {
    return /^\s*</.test(content.trim());
  }

  renderContent(slug: string): string {
    const raw = this.getContent(slug).trim();
    if (!raw) return '';
    if (this.isHtmlContent(raw)) return raw;
    return this.markdownToHtml(raw);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private inlineMarkdown(text: string): string {
    return this.escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  private markdownToHtml(md: string): string {
    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      if (trimmed.startsWith('## ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h2>${this.inlineMarkdown(trimmed.slice(3))}</h2>`;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h2>${this.inlineMarkdown(trimmed.slice(2))}</h2>`;
        continue;
      }

      if (trimmed.startsWith('- ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${this.inlineMarkdown(trimmed.slice(2))}</li>`;
        continue;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${this.inlineMarkdown(trimmed)}</p>`;
    }

    if (inList) html += '</ul>';
    return html;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getPlainExcerpt(slug: string, excerpt: string): string {
    if (excerpt?.trim()) return excerpt.trim();
    const content = this.getContent(slug);
    const plain = this.isHtmlContent(content)
      ? this.stripHtml(content)
      : content.replace(/^#+\s*.+$/m, '').replace(/\*\*/g, '').trim();
    return plain.length > 160 ? `${plain.slice(0, 160).trim()}...` : plain;
  }

  private nextId(): number {
    const articles = this.findAll(true);
    return articles.length ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
  }

  create(dto: CreateArticleDto): Article {
    const now = new Date().toISOString();
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);
    if (existsSync(this.jsonPath(slug))) {
      throw new Error(`Slug "${slug}" already exists`);
    }

    const article: Article = {
      id: this.nextId(),
      slug,
      title: dto.title,
      excerpt: dto.excerpt ?? '',
      thumbnail:
        dto.thumbnail ??
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=80&h=56&fit=crop',
      author: dto.author ?? 'Admin',
      authorAvatar: (dto.author ?? 'Admin')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      category: dto.category ?? 'Tin tức',
      status: dto.status ?? 'draft',
      publishedAt: dto.status === 'published' ? now : null,
      scheduledAt: dto.status === 'scheduled' ? now : null,
      views: 0,
      seo: {
        metaTitle: dto.seo?.metaTitle ?? dto.title,
        metaDescription: dto.seo?.metaDescription ?? dto.excerpt ?? '',
        seoUrl: dto.seo?.seoUrl ?? `/blog/${slug}`,
        originalUrl: dto.seo?.originalUrl ?? `/blog/${slug}`,
        redirect: dto.seo?.redirect ?? null,
        score: dto.seo?.score ?? 0,
        indexStatus: dto.seo?.indexStatus ?? 'warning',
      },
      createdAt: now,
      updatedAt: now,
    };

    this.writeJson(article);
    this.saveContent(
      slug,
      dto.content ?? `<h2>${dto.title}</h2><p>Nội dung bài viết...</p>`,
    );
    return article;
  }

  update(slug: string, dto: UpdateArticleDto): Article {
    const article = this.readJson(slug);
    const now = new Date().toISOString();
    const newSlug = dto.slug ? this.slugify(dto.slug) : slug;

    if (newSlug !== slug && existsSync(this.jsonPath(newSlug))) {
      throw new Error(`Slug "${newSlug}" already exists`);
    }

    const updated: Article = {
      ...article,
      ...dto,
      slug: newSlug,
      authorAvatar: dto.author
        ? dto.author
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : article.authorAvatar,
      seo: { ...article.seo, ...dto.seo },
      updatedAt: now,
    };

    if (dto.status === 'published' && !updated.publishedAt) {
      updated.publishedAt = now;
    }

    if (dto.content !== undefined) {
      this.saveContent(slug, dto.content);
    }

    if (newSlug !== slug) {
      unlinkSync(this.jsonPath(slug));
      if (existsSync(this.mdPath(slug))) {
        const content = readFileSync(this.mdPath(slug), 'utf-8');
        unlinkSync(this.mdPath(slug));
        this.saveContent(newSlug, content);
      }
    }

    this.writeJson(updated);
    return updated;
  }

  delete(slug: string, permanent = false): void {
    if (permanent) {
      if (existsSync(this.jsonPath(slug))) unlinkSync(this.jsonPath(slug));
      if (existsSync(this.mdPath(slug))) unlinkSync(this.mdPath(slug));
    } else {
      this.update(slug, { status: 'trash' });
    }
  }

  toDashboardRow(article: Article) {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      thumbnail: article.thumbnail,
      author: article.author,
      authorAvatar: article.authorAvatar,
      category: article.category,
      categoryColor: CATEGORY_COLORS[article.category] ?? 'bg-slate-100 text-slate-700',
      publishedAt: this.formatDate(article.publishedAt ?? article.scheduledAt),
      statusKey: article.status,
      status: STATUS_LABELS[article.status],
      statusColor: STATUS_COLORS[article.status],
      views: article.views > 0 ? this.formatNumber(article.views) : '—',
    };
  }

  toBlogPost(article: Article) {
    const excerpt = this.getPlainExcerpt(article.slug, article.excerpt);
    const dateSource = article.publishedAt ?? article.scheduledAt ?? article.createdAt;

    return {
      title: article.title,
      slug: article.slug,
      excerpt: excerpt || 'Xem chi tiết bài viết...',
      category: article.category,
      thumbnail: article.thumbnail,
      dateLabel: this.formatBlogDate(dateSource),
    };
  }

  toSeoLink(article: Article) {
    const idx = INDEX_STATUS_MAP[article.seo.indexStatus];
    const scoreColor =
      article.seo.score >= 80
        ? 'text-green-600'
        : article.seo.score >= 50
          ? 'text-orange-600'
          : 'text-red-600';
    return {
      slug: article.slug,
      originalUrl: article.seo.originalUrl,
      seoUrl: article.seo.seoUrl,
      indexStatus: idx.label,
      indexColor: idx.color,
      redirect: article.seo.redirect ?? '—',
      metaTitle: article.seo.metaTitle || '—',
      score: article.seo.score,
      scoreColor,
    };
  }

  computeStats(articles: Article[]) {
    const total = articles.length;
    const published = articles.filter((a) => a.status === 'published').length;
    const drafts = articles.filter((a) => a.status === 'draft').length;
    const goodSeo = articles.filter((a) => a.seo.score >= 80).length;

    return [
      {
        label: 'Tổng bài viết',
        value: this.formatNumber(total),
        trend: '+12,5%',
        trendUp: true,
        icon: 'document',
        iconBg: 'bg-brand-50',
        iconColor: 'text-brand-500',
      },
      {
        label: 'Đã xuất bản',
        value: this.formatNumber(published),
        trend: '+8,7%',
        trendUp: true,
        icon: 'check',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-500',
      },
      {
        label: 'Bản nháp',
        value: this.formatNumber(drafts),
        trend: '-5,3%',
        trendUp: false,
        icon: 'edit',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
      },
      {
        label: 'SEO tốt',
        value: this.formatNumber(goodSeo),
        trend: '+15,2%',
        trendUp: true,
        icon: 'trend',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
      },
    ];
  }

  computeTopArticles(articles: Article[]) {
    const sorted = [...articles]
      .filter((a) => a.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    const max = sorted[0]?.views ?? 1;
    return sorted.map((a) => ({
      title: a.title,
      views: this.formatNumber(a.views),
      percent: Math.round((a.views / max) * 100),
    }));
  }

  computeTopSeoPages(articles: Article[]) {
    return [...articles]
      .filter((a) => a.seo.score > 0)
      .sort((a, b) => b.seo.score - a.seo.score)
      .slice(0, 5)
      .map((a, i) => ({
        rank: i + 1,
        url: a.seo.seoUrl,
        score: a.seo.score,
        scoreColor: a.seo.score >= 80 ? 'bg-green-500' : 'bg-orange-500',
      }));
  }

  getPublished() {
    return this.findAll().filter((a) => a.status === 'published');
  }

  getLatestForBlog(limit = 6) {
    return this.findAll()
      .filter((a) => a.status === 'published' || a.status === 'scheduled')
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit);
  }

  getBlogPath(slug: string): string {
    return `/blog/${slug}`;
  }

  buildStaticPageSeo(
    title: string,
    description: string,
    path: string,
    brand = 'Honize',
    appendBrand = true,
  ): PageSeo {
    const siteUrl = getSiteUrl();
    return {
      title: appendBrand ? `${title} — ${brand}` : title,
      description,
      canonical: `${siteUrl}${path}`,
      ogType: 'website',
      ogImage: `${siteUrl}/images/bg-tech.png`,
      jsonLd: null,
    };
  }

  buildArticlePageSeo(article: Article, brand = 'Honize'): PageSeo {
    const siteUrl = getSiteUrl();
    const path = this.getBlogPath(article.slug);
    const canonical = `${siteUrl}${path}`;
    const metaTitle = article.seo.metaTitle?.trim() || article.title;
    const description =
      article.seo.metaDescription?.trim() || article.excerpt?.trim() || article.title;
    const ogImage = toAbsoluteUrl(article.thumbnail, siteUrl);
    const datePublished = article.publishedAt ?? article.scheduledAt ?? article.createdAt;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metaTitle,
      description,
      image: [ogImage],
      datePublished,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: brand,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
    };

    return {
      title: `${metaTitle} — ${brand}`,
      description,
      canonical,
      ogType: 'article',
      ogImage,
      jsonLd: JSON.stringify(jsonLd),
    };
  }

  buildSitemapXml(): string {
    const siteUrl = getSiteUrl();
    const staticPaths = ['/', '/blog'];
    const articles = this.getPublished();

    const urls = [
      ...staticPaths.map((path) => ({ loc: `${siteUrl}${path}`, lastmod: null as string | null })),
      ...articles.map((a) => ({
        loc: `${siteUrl}${this.getBlogPath(a.slug)}`,
        lastmod: a.updatedAt,
      })),
    ];

    const body = urls
      .map((u) => {
        const lastmod = u.lastmod
          ? `\n    <lastmod>${u.lastmod.slice(0, 10)}</lastmod>`
          : '';
        return `  <url>\n    <loc>${this.escapeXml(u.loc)}</loc>${lastmod}\n  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }

  buildRobotsTxt(): string {
    const siteUrl = getSiteUrl();
    return `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  uploadImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file được gửi lên');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Chỉ chấp nhận file hình ảnh');
    }

    const dir = getUploadsDir();
    const ext = extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    writeFileSync(join(dir, filename), file.buffer);

    return { url: `/uploads/${filename}`, name: filename };
  }
}
