export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface DashboardArticle {
  id: number;
  title: string;
  thumbnail: string;
  author: string;
  authorAvatar: string;
  category: string;
  categoryColor: string;
  publishedAt: string;
  status: string;
  statusColor: string;
  views: string;
}

export interface SeoLinkRow {
  slug: string;
  originalUrl: string;
  seoUrl: string;
  indexStatus: string;
  indexColor: string;
  redirect: string;
  metaTitle: string;
  score: number;
  scoreColor: string;
}

export interface SeoCheckItem {
  label: string;
  status: string;
  ok: boolean;
}

export interface TopArticle {
  title: string;
  views: string;
  percent: number;
}

export interface TopSeoPage {
  rank: number;
  url: string;
  score: number;
  scoreColor: string;
}

export interface QuickStat {
  label: string;
  value: string;
  color?: string;
}

export interface DashboardData {
  pageTitle: string;
  activeNav: string;
  articleTabs: { label: string; href: string; active: boolean }[];
  seoChecks: SeoCheckItem[];
  seoScore: number;
  trafficTotal: string;
  trafficTrend: string;
  quickStats: QuickStat[];
  pagination: { page: number; active: boolean }[];
}

export const dashboardData: DashboardData = {
  pageTitle: 'Quản lý bài viết',
  activeNav: 'articles',
  articleTabs: [
    { label: 'Tất cả', href: '/dashboard', active: true },
    { label: 'Đã xuất bản', href: '/dashboard?status=published', active: false },
    { label: 'Bản nháp', href: '/dashboard?status=draft', active: false },
    { label: 'Đã lên lịch', href: '/dashboard?status=scheduled', active: false },
    { label: 'Thùng rác', href: '/dashboard?status=trash', active: false },
  ],
  seoChecks: [
    { label: 'Meta title', status: 'Tốt', ok: true },
    { label: 'Meta description', status: 'Tốt', ok: true },
    { label: 'Heading H1', status: 'Tốt', ok: true },
    { label: 'Alt text hình ảnh', status: 'Tốt', ok: true },
    { label: 'Internal links', status: 'Tốt', ok: true },
    { label: 'Mobile friendly', status: 'Tốt', ok: true },
    { label: 'Page speed', status: 'Cần cải thiện', ok: false },
  ],
  seoScore: 92,
  trafficTotal: '156.782',
  trafficTrend: '+18,4%',
  quickStats: [
    { label: 'Tỷ lệ index', value: '94,2%', color: 'text-green-600' },
    { label: 'Lỗi 404', value: '3', color: 'text-red-600' },
    { label: 'Redirect 301', value: '12', color: 'text-brand-600' },
    { label: 'Redirect 302', value: '2', color: 'text-orange-600' },
  ],
  pagination: [
    { page: 1, active: true },
    { page: 2, active: false },
    { page: 3, active: false },
    { page: 0, active: false },
  ],
};
