import { Injectable } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';
import { dashboardData } from '../data/dashboard.data';

@Injectable()
export class DashboardService {
  constructor(private readonly articlesService: ArticlesService) {}

  getSharedLayoutData(activeNav = 'articles') {
    return {
      activeNav,
      navItems: [
        { id: 'overview', label: 'Tổng quan', icon: 'grid', href: '/dashboard/behavior-tree' },
        { id: 'articles', label: 'Quản lý bài viết', icon: 'document', href: '/dashboard' },
        { id: 'categories', label: 'Danh mục', icon: 'folder', href: '/dashboard' },
        { id: 'media', label: 'Media', icon: 'image', href: '/dashboard' },
        { id: 'seo', label: 'SEO Link', icon: 'link', href: '/dashboard' },
        { id: 'users', label: 'Người dùng', icon: 'users', href: '/dashboard' },
        { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/dashboard' },
      ],
      user: {
        name: 'Admin',
        role: 'Quản trị viên',
        avatar: 'AD',
        notifications: 12,
      },
    };
  }

  getDashboardPage() {
    const rawArticles = this.articlesService.findAll();
    const articles = rawArticles.map((a) => this.articlesService.toDashboardRow(a));
    const total = rawArticles.length;

    return {
      layout: 'dashboard',
      ...dashboardData,
      stats: this.articlesService.computeStats(rawArticles),
      articles,
      seoLinks: rawArticles.map((a) => this.articlesService.toSeoLink(a)),
      topArticles: this.articlesService.computeTopArticles(rawArticles),
      topSeoPages: this.articlesService.computeTopSeoPages(rawArticles),
      ...this.getSharedLayoutData('articles'),
      articleCount: total,
      chartLabels: [
        { x: 0, label: '04/07' },
        { x: 100, label: '05/07' },
        { x: 200, label: '06/07' },
        { x: 300, label: '07/07' },
        { x: 400, label: '08/07' },
        { x: 500, label: '09/07' },
        { x: 600, label: '10/07' },
      ],
    };
  }
}
