import { Project, ProjectCategory } from '../data/site.data';
import { readJsonFile, writeJsonFile } from '../dashboard/cms.storage';
import { defaultProjectsData } from '../data/site.data';

export interface SiteProjectsData {
  projectCategories: ProjectCategory[];
  projects: Project[];
}

export function loadSiteProjects(): SiteProjectsData {
  return readJsonFile<SiteProjectsData>('projects.json', defaultProjectsData);
}

export function saveSiteProjects(data: SiteProjectsData): void {
  writeJsonFile('projects.json', data);
}
