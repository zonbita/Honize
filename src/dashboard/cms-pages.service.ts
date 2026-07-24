import { Injectable, NotFoundException } from '@nestjs/common';
import { Dirent, existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { basename, extname, join } from 'path';
import { ArticlesService } from '../articles/articles.service';
import { Project } from '../data/site.data';
import { bumpDevRevision } from '../shared/dev-reload';
import { resolveProjectRoot } from '../shared/content-path';
import { loadSiteProjects, saveSiteProjects, SiteProjectsData } from '../shared/site-projects';
import { loadSiteSettings, SiteSettings } from '../shared/site-settings';
import { clearVisits as clearVisitRecords, getVisits, VisitRecord } from '../shared/visit-tracker';
import {
  clearContactSubmissions as clearContactRecords,
  ContactSubmission,
  deleteContactSubmission as deleteContactRecord,
  getContactSubmissions as loadContactSubmissions,
  markContactRead as markContactRecordRead,
} from '../shared/contact-submissions';
import { getUploadsDir, readJsonFile, writeJsonFile } from './cms.storage';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

export interface LibraryImage {
  name: string;
  folder: string;
  relativePath: string;
  url: string;
  size: number;
  mtime: number;
}

export interface Category {
  slug: string;
  name: string;
  color: string;
  description: string;
  articleCount?: number;
}

export interface CmsUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  lastLogin: string;
}

export type { SiteSettings } from '../shared/site-settings';

@Injectable()
export class CmsPagesService {
  constructor(private readonly articlesService: ArticlesService) {}

  getCategories(): Category[] {
    const categories = readJsonFile<Category[]>('categories.json', []);
    const articles = this.articlesService.findAll();
    return categories.map((cat) => ({
      ...cat,
      articleCount: articles.filter((a) => a.category === cat.name).length,
    }));
  }

  addCategory(name: string, description: string) {
    const categories = readJsonFile<Category[]>('categories.json', []);
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (categories.some((c) => c.slug === slug)) return categories;
    categories.push({
      slug,
      name,
      color: 'bg-slate-100 text-slate-700',
      description,
    });
    writeJsonFile('categories.json', categories);
    return categories;
  }

  /** Media page + picker: public/images/Demo and public/uploads */
  getMediaFiles() {
    return this.getPublicImages().map((img) => ({
      name: img.name,
      folder: img.folder,
      relativePath: img.relativePath,
      url: img.url,
      canDelete:
        img.folder === 'uploads' || img.relativePath.startsWith('uploads/'),
    }));
  }

  /** List images under public/images/Demo and public/uploads. */
  getPublicImages(): LibraryImage[] {
    const results: LibraryImage[] = [];
    const root = resolveProjectRoot();

    const demoDir = join(root, 'public', 'images', 'Demo');
    if (existsSync(demoDir)) {
      this.collectLibraryImages(demoDir, 'Demo', '/images', results);
    }

    const uploadsDir = getUploadsDir();
    if (existsSync(uploadsDir)) {
      this.collectUploadImages(uploadsDir, results);
    }

    return results;
  }

  private collectUploadImages(dir: string, results: LibraryImage[]) {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') || !entry.isFile()) continue;
      const ext = extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;

      const abs = join(dir, entry.name);
      let size = 0;
      let mtime = 0;
      try {
        const fileStat = statSync(abs);
        size = fileStat.size;
        mtime = fileStat.mtimeMs;
      } catch {
        size = 0;
        mtime = 0;
      }

      results.push({
        name: entry.name,
        folder: 'uploads',
        relativePath: `uploads/${entry.name}`,
        url: `/uploads/${encodeURIComponent(entry.name)}`,
        size,
        mtime,
      });
    }
  }

  private collectLibraryImages(
    dir: string,
    rel: string,
    urlPrefix: '/images',
    results: LibraryImage[],
  ) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const abs = join(dir, entry.name);
      const nextRel = rel ? `${rel}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        this.collectLibraryImages(abs, nextRel, urlPrefix, results);
        continue;
      }

      const ext = extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;

      let size = 0;
      let mtime = 0;
      try {
        const fileStat = statSync(abs);
        size = fileStat.size;
        mtime = fileStat.mtimeMs;
      } catch {
        size = 0;
        mtime = 0;
      }

      const encoded = nextRel
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

      const topFolder = nextRel.split('/')[0] || '/';
      const subFolder = nextRel.includes('/')
        ? nextRel.split('/').slice(0, -1).join('/')
        : topFolder;

      results.push({
        name: entry.name,
        folder: subFolder,
        relativePath: nextRel,
        url: `${urlPrefix}/${encoded}`,
        size,
        mtime,
      });
    }
  }

  deleteMediaFile(filename: string): void {
    const safeName = basename(filename || '');
    if (!safeName || safeName !== filename || safeName.includes('..')) {
      throw new NotFoundException('File không hợp lệ');
    }

    if (!IMAGE_EXTENSIONS.some((ext) => safeName.toLowerCase().endsWith(ext))) {
      throw new NotFoundException('Chỉ được xóa file ảnh');
    }

    // Only allow deleting CMS uploads, not curated Demo assets
    const filePath = join(getUploadsDir(), safeName);
    if (!existsSync(filePath)) {
      throw new NotFoundException(`Không tìm thấy file "${safeName}" trong uploads`);
    }

    unlinkSync(filePath);
    bumpDevRevision();
  }

  getSeoLinks() {
    return this.articlesService.findAll().map((a) => this.articlesService.toSeoLink(a));
  }

  getUsers(): CmsUser[] {
    return readJsonFile<CmsUser[]>('users.json', []);
  }

  getVisits(): Promise<VisitRecord[]> {
    return getVisits();
  }

  clearVisits(): Promise<void> {
    return clearVisitRecords();
  }

  getContactSubmissions(): Promise<ContactSubmission[]> {
    return loadContactSubmissions();
  }

  markContactRead(id: string): Promise<boolean> {
    return markContactRecordRead(id);
  }

  deleteContactSubmission(id: string): Promise<boolean> {
    return deleteContactRecord(id);
  }

  clearContactSubmissions(): Promise<void> {
    return clearContactRecords();
  }

  getSettings(): SiteSettings {
    return loadSiteSettings();
  }

  saveSettings(data: Partial<SiteSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...data };
    writeJsonFile('settings.json', updated);
    bumpDevRevision();
    return updated;
  }

  uploadImage(file: Express.Multer.File) {
    return this.articlesService.uploadImage(file);
  }

  getProjectsData(): SiteProjectsData {
    return loadSiteProjects();
  }

  getProjectBySlug(slug: string): Project {
    const project = this.getProjectsData().projects.find((p) => p.slug === slug);
    if (!project) throw new NotFoundException(`Project "${slug}" not found`);
    return project;
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

  private persistProjects(data: SiteProjectsData): SiteProjectsData {
    saveSiteProjects(data);
    bumpDevRevision();
    return data;
  }

  addProjectCategory(name: string) {
    const data = this.getProjectsData();
    const slug = this.slugify(name);
    if (data.projectCategories.some((c) => c.slug === slug)) return data;
    data.projectCategories.push({ name, slug });
    return this.persistProjects(data);
  }

  saveProject(input: {
    title: string;
    slug?: string;
    categorySlug: string;
    image: string;
    url: string;
    previousSlug?: string;
  }): Project {
    const data = this.getProjectsData();
    const category = data.projectCategories.find((c) => c.slug === input.categorySlug);
    if (!category) throw new NotFoundException(`Category "${input.categorySlug}" not found`);

    const slug = this.slugify(input.slug || input.title);
    const previousSlug = input.previousSlug;
    if (previousSlug !== slug && data.projects.some((p) => p.slug === slug)) {
      throw new Error(`Slug "${slug}" already exists`);
    }

    const project: Project = {
      title: input.title,
      slug,
      categorySlug: category.slug,
      categoryName: category.name,
      image: input.image,
      url: input.url?.trim() || `/du-an/demo/${slug}`,
    };

    if (previousSlug) {
      const index = data.projects.findIndex((p) => p.slug === previousSlug);
      if (index === -1) throw new NotFoundException(`Project "${previousSlug}" not found`);
      data.projects[index] = project;
    } else {
      if (data.projects.some((p) => p.slug === slug)) {
        throw new Error(`Slug "${slug}" already exists`);
      }
      data.projects.push(project);
    }

    this.persistProjects(data);
    return project;
  }

  deleteProject(slug: string): void {
    const data = this.getProjectsData();
    const next = data.projects.filter((p) => p.slug !== slug);
    if (next.length === data.projects.length) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }
    this.persistProjects({ ...data, projects: next });
  }
}
