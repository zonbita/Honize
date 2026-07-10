import { SiteData, siteLayout } from '../data/site.data';
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
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Honize™',
  tagline: 'Thiết kế web chuyên nghiệp - Sang trọng - Chuẩn SEO',
  email: 'info@honize.vn',
  phone: '(+84) 2873 040 030',
  address: 'Bình Thạnh, TP. Hồ Chí Minh',
  postsPerPage: 6,
  enableComments: false,
  maintenanceMode: false,
};

export function loadSiteSettings(): SiteSettings {
  return readJsonFile<SiteSettings>('settings.json', DEFAULT_SETTINGS);
}

export function loadPublicSiteData(): Omit<SiteData, 'blogPosts'> {
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
  };
}
