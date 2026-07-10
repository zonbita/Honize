export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface ProjectCategory {
  name: string;
  slug: string;
}

export interface Project {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  image: string;
  url: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
}

export interface SiteLayoutData {
  nav: NavItem[];
  services: Service[];
  projectCategories: ProjectCategory[];
  projects: Project[];
}

export interface SiteData extends SiteLayoutData {
  brand: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  blogPosts: BlogPost[];
}

/** Dữ liệu mặc định khi chưa có content/projects.json */
export const defaultProjectsData: Pick<SiteLayoutData, 'projectCategories' | 'projects'> = {
  projectCategories: [
    { name: 'Bán hàng', slug: 'ban-hang' },
    { name: 'Bất động sản', slug: 'bat-dong-san' },
    { name: 'Du lịch', slug: 'du-lich' },
    { name: 'Dịch vụ', slug: 'dich-vu' },
    { name: 'Giới thiệu công ty', slug: 'gioi-thieu-cong-ty' },
    { name: 'Tin tức', slug: 'tin-tuc' },
    { name: 'Thiết kế', slug: 'thiet-ke' },
    { name: 'Ăn uống', slug: 'an-uong' },
  ],
  projects: [
    {
      title: 'Website nhà hàng',
      slug: 'nha-hang-sai-gon',
      categorySlug: 'an-uong',
      categoryName: 'Ăn uống',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Shop thời trang online',
      slug: 'shop-thoi-trang',
      categorySlug: 'ban-hang',
      categoryName: 'Bán hàng',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Dự án căn hộ cao cấp',
      slug: 'can-ho-cao-cap',
      categorySlug: 'bat-dong-san',
      categoryName: 'Bất động sản',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Tour du lịch Đà Nẵng',
      slug: 'tour-da-nang',
      categorySlug: 'du-lich',
      categoryName: 'Du lịch',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4b0ef90f?w=800&h=600&fit=crop',
      url: '/blog/du-lich-da-nang-2026',
    },
    {
      title: 'Spa & Wellness',
      slug: 'spa-wellness',
      categorySlug: 'dich-vu',
      categoryName: 'Dịch vụ',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Corporate landing page',
      slug: 'corporate-landing',
      categorySlug: 'gioi-thieu-cong-ty',
      categoryName: 'Giới thiệu công ty',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Tin tức công nghệ',
      slug: 'tin-cong-nghe',
      categorySlug: 'tin-tuc',
      categoryName: 'Tin tức',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      url: '/blog',
    },
    {
      title: 'Portfolio thiết kế',
      slug: 'portfolio-thiet-ke',
      categorySlug: 'thiet-ke',
      categoryName: 'Thiết kế',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      url: '#contact',
    },
    {
      title: 'Quán cà phê specialty',
      slug: 'cafe-specialty',
      categorySlug: 'an-uong',
      categoryName: 'Ăn uống',
      image: 'https://images.unsplash.com/photo-1501339847302-ac724a563a6a?w=800&h=600&fit=crop',
      url: '#contact',
    },
  ],
};

/** Nội dung tĩnh trang chủ — thông tin liên hệ lấy từ content/settings.json, dự án từ content/projects.json */
export const siteLayout: SiteLayoutData = {
  nav: [
    {
      label: 'Báo giá',
      href: '#banggia',
      children: [
        { label: 'Các cấp độ web', href: '#banggia' },
        { label: 'Báo giá trọn gói', href: '#banggia' },
      ],
    },
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Thiết kế', href: '#services' },
    { label: 'Bảo trì', href: '#services' },
    { label: 'Tối ưu', href: '#optimize' },
    { label: 'Hosting', href: '#services' },
    { label: 'Dự án mẫu', href: '#projects' },
    { label: 'Kiến thức', href: '/blog' },
    { label: 'Tuyển dụng', href: '#contact' },
  ],
  services: [
    {
      icon: 'design',
      title: 'Thiết Kế Website',
      description:
        'Tư vấn và thiết kế website chuyên nghiệp, sang trọng, hiệu quả và ổn định.',
    },
    {
      icon: 'maintenance',
      title: 'Bảo Trì Website',
      description:
        'Hỗ trợ xử lý lỗi virus, SEO và hệ thống web nhanh chóng, kịp thời.',
    },
    {
      icon: 'hosting',
      title: 'Host Cao Cấp',
      description:
        'Hạ tầng ổn định, an toàn giúp website vận hành hiệu quả.',
    },
  ],
  projectCategories: defaultProjectsData.projectCategories,
  projects: defaultProjectsData.projects,
};
