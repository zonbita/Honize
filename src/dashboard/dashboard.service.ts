import { Injectable } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';
import { ArticleStatus } from '../articles/articles.types';
import { dashboardData } from '../data/dashboard.data';

const ARTICLE_TABS: { label: string; status?: ArticleStatus }[] = [
  { label: 'Tất cả' },
  { label: 'Đã xuất bản', status: 'published' },
  { label: 'Bản nháp', status: 'draft' },
  { label: 'Đã lên lịch', status: 'scheduled' },
  { label: 'Thùng rác', status: 'trash' },
];

@Injectable()
export class DashboardService {
  constructor(private readonly articlesService: ArticlesService) {}

  getSharedLayoutData(activeNav = 'articles') {
    return {
      activeNav,
      navItems: [
        { id: 'overview', label: 'Tổng quan', icon: 'grid', href: '/dashboard/behavior-tree' },
        { id: 'articles', label: 'Quản lý bài viết', icon: 'document', href: '/dashboard' },
        { id: 'categories', label: 'Danh mục', icon: 'folder', href: '/dashboard/categories' },
        { id: 'projects', label: 'Dự án mẫu', icon: 'layout', href: '/dashboard/projects' },
        { id: 'media', label: 'Media', icon: 'image', href: '/dashboard/media' },
        { id: 'seo', label: 'SEO Link', icon: 'link', href: '/dashboard/seo' },
        { id: 'users', label: 'Người dùng', icon: 'users', href: '/dashboard/users' },
        { id: 'settings', label: 'Cài đặt', icon: 'settings', href: '/dashboard/settings' },
      ],
      user: {
        name: 'Admin',
        role: 'Quản trị viên',
        avatar: 'AD',
        notifications: 12,
      },
    };
  }

  getDashboardPage(statusFilter?: string) {
    const validStatuses: ArticleStatus[] = ['published', 'draft', 'scheduled', 'trash'];
    const activeStatus = validStatuses.includes(statusFilter as ArticleStatus)
      ? (statusFilter as ArticleStatus)
      : undefined;

    const allArticles = this.articlesService.findAll(true);
    const filtered = activeStatus
      ? allArticles.filter((a) => a.status === activeStatus)
      : allArticles.filter((a) => a.status !== 'trash');

    const articles = filtered.map((a) => this.articlesService.toDashboardRow(a));
    const articleTabs = ARTICLE_TABS.map((tab) => ({
      label: tab.label,
      href: tab.status ? `/dashboard?status=${tab.status}` : '/dashboard',
      active: tab.status === activeStatus || (!tab.status && !activeStatus),
    }));

    return {
      layout: 'dashboard',
      ...dashboardData,
      articleTabs,
      stats: this.articlesService.computeStats(allArticles.filter((a) => a.status !== 'trash')),
      articles,
      seoLinks: filtered.map((a) => this.articlesService.toSeoLink(a)),
      topArticles: this.articlesService.computeTopArticles(
        allArticles.filter((a) => a.status !== 'trash'),
      ),
      topSeoPages: this.articlesService.computeTopSeoPages(
        allArticles.filter((a) => a.status !== 'trash'),
      ),
      ...this.getSharedLayoutData('articles'),
      articleCount: filtered.length,
      activeStatus,
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
