import { Injectable } from '@nestjs/common';
import { ArticlesService } from './articles/articles.service';
import { siteData } from './data/site.data';

@Injectable()
export class AppService {
  constructor(private readonly articlesService: ArticlesService) {}

  getHomePageData() {
    const latest = this.articlesService.getLatestForBlog(6);
    const blogPosts = latest.map((a) => this.articlesService.toBlogPost(a));

    return {
      ...siteData,
      blogPosts,
      year: new Date().getFullYear(),
      pageTitle: `${siteData.brand} — ${siteData.tagline}`,
    };
  }
}
