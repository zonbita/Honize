import { Injectable } from '@nestjs/common';
import { ArticlesService } from './articles/articles.service';
import { loadPublicSiteData, loadSiteSettings } from './shared/site-settings';

@Injectable()
export class AppService {
  constructor(private readonly articlesService: ArticlesService) {}

  getHomePageData() {
    const site = loadPublicSiteData();
    const settings = loadSiteSettings();
    const latest = this.articlesService.getLatestForBlog(settings.postsPerPage);
    const blogPosts = latest.map((a) => this.articlesService.toBlogPost(a));

    return {
      ...site,
      blogPosts,
      year: new Date().getFullYear(),
      pageTitle: `${site.brand} — ${site.tagline}`,
      seo: this.articlesService.buildStaticPageSeo(
        `${site.brand} — ${site.tagline}`,
        site.tagline,
        '/',
        site.brand,
        false,
      ),
    };
  }

  getAboutPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Giới thiệu',
      'Giới thiệu',
      `Giới thiệu ${site.brand} — đối tác công nghệ đáng tin cậy, thiết kế website trọn gói cho doanh nghiệp.`,
      '/gioi-thieu',
    );
  }

  getProcessPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Quy trình thiết kế website',
      'Quy trình thiết kế website',
      `6 bước tiến hành thiết kế web chuyên nghiệp cùng ${site.brand}.`,
      '/quy-trinh-thiet-ke-website',
    );
  }

  getDesignPageData() {
    const site = loadPublicSiteData();
    return this.buildStaticPage(
      'Tăng tốc và tối ưu website',
      'Tăng tốc và tối ưu website',
      `Dịch vụ tối ưu và tăng tốc website WordPress — cải thiện PageSpeed, Core Web Vitals cùng ${site.brand}.`,
      '/thiet-ke',
    );
  }

  getProjectsPageData(categorySlug?: string) {
    const site = loadPublicSiteData();
    const projects = categorySlug
      ? site.projects.filter((p) => p.categorySlug === categorySlug)
      : site.projects;

    return {
      ...this.buildStaticPage(
        'Dự án mẫu',
        'Dự án mẫu',
        `Tham khảo các dự án thiết kế website tiêu biểu do ${site.brand} thực hiện.`,
        categorySlug ? `/du-an?danh-muc=${categorySlug}` : '/du-an',
      ),
      projects,
      activeCategory: categorySlug || '',
    };
  }

  getKnowledgePageData() {
    const site = loadPublicSiteData();
    const articles = this.articlesService.getLatestForBlog(50);
    return {
      ...this.buildStaticPage(
        'Kiến thức',
        'Kiến thức',
        `Tin tức, hướng dẫn và xu hướng thiết kế web, SEO từ ${site.brand}`,
        '/kien-thuc',
      ),
      blogPosts: articles.map((a) => this.articlesService.toBlogPost(a)),
    };
  }

  getContactPageData(options?: { success?: boolean }) {
    const site = loadPublicSiteData();
    return {
      ...this.buildStaticPage(
        'Liên hệ',
        'Liên hệ',
        `Liên hệ ${site.brand} — tư vấn thiết kế website, báo giá và hỗ trợ kỹ thuật.`,
        '/lien-he',
      ),
      contactSuccess: Boolean(options?.success),
      zalo: site.phone,
      skype: '',
    };
  }

  private buildStaticPage(
    pageTitle: string,
    seoTitle: string,
    description: string,
    path: string,
  ) {
    const site = loadPublicSiteData();
    const blogPosts = this.articlesService
      .getLatestForBlog(5)
      .map((a) => this.articlesService.toBlogPost(a));

    return {
      ...site,
      blogPosts,
      year: new Date().getFullYear(),
      pageTitle: `${seoTitle} — ${site.brand}`,
      seo: this.articlesService.buildStaticPageSeo(
        `${seoTitle} — ${site.brand}`,
        description,
        path,
        site.brand,
      ),
      heading: pageTitle,
    };
  }
}
