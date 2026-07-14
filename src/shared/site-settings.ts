import {
  AboutPageContent,
  OptimizePageContent,
  SiteData,
  DesignProcessStep,
  aboutPageContent,
  designProcessSteps,
  optimizePageContent,
  siteLayout,
} from '../data/site.data';
import { readJsonFile } from '../dashboard/cms.storage';
import { loadSiteProjects } from './site-projects';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  postsPerPage: number;
  enableComments: boolean;
  maintenanceMode: boolean;
  /** Hero — DỊCH VỤ — */
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroTagline: string;
  heroDescription: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  /** Footer / intro brand copy */
  footerDescription: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Honize Test',
  tagline: 'Thiết kế web chuyên nghiệp - Sang trọng - Chuẩn SEO',
  email: 'info@honize.vn',
  phone: '(+84) 2873 040 030',
  address: 'Bình Thạnh, TP. Hồ Chí Minh',
  postsPerPage: 6,
  enableComments: false,
  maintenanceMode: false,
  heroKicker: 'Dịch vụ —',
  heroTitle: 'Thiết kế website',
  heroTitleHighlight: 'chuyên nghiệp',
  heroTagline: '→ mở rộng cơ hội kinh doanh',
  heroDescription:
    'Honize sẽ sát cánh cùng quý khách xây dựng website nhằm nâng cao chất lượng dịch vụ và tăng cơ hội quảng bá, bán hàng. Hãy liên hệ để trải nghiệm sự am hiểu, nhiệt tình, sáng tạo và chuyên nghiệp của chúng tôi.',
  heroCtaPrimary: 'Báo Giá',
  heroCtaSecondary: 'Liên Hệ Ngay',
  footerDescription:
    'Cung cấp cho quý khách hệ thống thông tin hoạt động hiệu quả 24/7, từ website giới thiệu công ty, sản phẩm và dịch vụ tới hệ thống email, chăm sóc khách hàng, nhân sự, kế toán và các sản phẩm CNTT khác.',
};

export function loadSiteSettings(): SiteSettings {
  const stored = readJsonFile<Partial<SiteSettings>>('settings.json', {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function loadPublicSiteData(): Omit<SiteData, 'blogPosts'> & {
  hero: {
    kicker: string;
    title: string;
    titleHighlight: string;
    tagline: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footerDescription: string;
  designProcessSteps: DesignProcessStep[];
  aboutPage: AboutPageContent;
  optimizePage: OptimizePageContent;
} {
  const settings = loadSiteSettings();
  const projects = loadSiteProjects();

  return {
    ...siteLayout,
    ...projects,
    brand: settings.siteName,
    tagline: settings.tagline,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    footerDescription: settings.footerDescription,
    hero: {
      kicker: settings.heroKicker,
      title: settings.heroTitle,
      titleHighlight: settings.heroTitleHighlight,
      tagline: settings.heroTagline,
      description: settings.heroDescription,
      ctaPrimary: settings.heroCtaPrimary,
      ctaSecondary: settings.heroCtaSecondary,
    },
    designProcessSteps,
    aboutPage: aboutPageContent,
    optimizePage: optimizePageContent,
  };
}
