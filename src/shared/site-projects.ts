import { Project, ProjectCategory } from '../data/site.data';
import { readJsonFile } from '../dashboard/cms.storage';
import { writeJsonDurable } from './cms-documents';
import { defaultProjectsData } from '../data/site.data';

export interface SiteProjectsData {
  projectCategories: ProjectCategory[];
  projects: Project[];
}

export function loadSiteProjects(): SiteProjectsData {
  return readJsonFile<SiteProjectsData>('projects.json', defaultProjectsData);
}

export async function saveSiteProjects(data: SiteProjectsData): Promise<void> {
  await writeJsonDurable('projects.json', data);
}
