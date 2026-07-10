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
}
