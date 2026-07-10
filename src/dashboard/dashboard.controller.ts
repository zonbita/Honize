import { Body, Controller, Get, Param, Post, Query, Redirect, Render } from '@nestjs/common';
import { BehaviorContext } from './behavior-tree/behavior-tree.types';
import { BehaviorTreeService } from './behavior-tree/behavior-tree.service';
import { CmsPagesService } from './cms-pages.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly behaviorTreeService: BehaviorTreeService,
    private readonly cmsPagesService: CmsPagesService,
  ) {}

  @Get()
  @Render('dashboard/index')
  index(@Query('status') status?: string) {
    return this.dashboardService.getDashboardPage(status);
  }

  @Get('categories')
  @Render('dashboard/categories')
  categories() {
    return {
      layout: 'dashboard',
      pageTitle: 'Danh mục',
      categories: this.cmsPagesService.getCategories(),
      ...this.dashboardService.getSharedLayoutData('categories'),
    };
  }

  @Post('categories')
  @Redirect('/dashboard/categories')
  addCategory(@Body() body: { name: string; description?: string }) {
    this.cmsPagesService.addCategory(body.name, body.description ?? '');
    return {};
  }

  @Get('media')
  @Render('dashboard/media')
  media() {
    return {
      layout: 'dashboard',
      pageTitle: 'Media',
      mediaFiles: this.cmsPagesService.getMediaFiles(),
      ...this.dashboardService.getSharedLayoutData('media'),
    };
  }

  @Get('seo')
  @Render('dashboard/seo')
  seo() {
    return {
      layout: 'dashboard',
      pageTitle: 'SEO Link',
      seoLinks: this.cmsPagesService.getSeoLinks(),
      ...this.dashboardService.getSharedLayoutData('seo'),
    };
  }

  @Get('users')
  @Render('dashboard/users')
  users() {
    const users = this.cmsPagesService.getUsers().map((u) => ({
      ...u,
      lastLoginFormatted: new Date(u.lastLogin).toLocaleString('vi-VN'),
    }));
    return {
      layout: 'dashboard',
      pageTitle: 'Người dùng',
      users,
      ...this.dashboardService.getSharedLayoutData('users'),
    };
  }

  @Get('settings')
  @Render('dashboard/settings')
  settings(@Query('saved') saved?: string) {
    return {
      layout: 'dashboard',
      pageTitle: 'Cài đặt',
      settings: this.cmsPagesService.getSettings(),
      saved: saved === '1',
      ...this.dashboardService.getSharedLayoutData('settings'),
    };
  }

  @Post('settings')
  @Redirect('/dashboard/settings?saved=1')
  saveSettings(@Body() body: Record<string, string>) {
    this.cmsPagesService.saveSettings({
      siteName: body.siteName,
      tagline: body.tagline,
      email: body.email,
      phone: body.phone,
      address: body.address,
      postsPerPage: parseInt(body.postsPerPage, 10) || 6,
      enableComments: body.enableComments === '1',
      maintenanceMode: body.maintenanceMode === '1',
    });
    return {};
  }

  @Get('projects')
  @Render('dashboard/projects')
  projects(@Query('saved') saved?: string) {
    const data = this.cmsPagesService.getProjectsData();
    return {
      layout: 'dashboard',
      pageTitle: 'Dự án mẫu',
      projectCategories: data.projectCategories,
      projects: data.projects,
      saved: saved === '1',
      ...this.dashboardService.getSharedLayoutData('projects'),
    };
  }

  @Post('projects/categories')
  @Redirect('/dashboard/projects')
  addProjectCategory(@Body() body: { name: string }) {
    if (body.name?.trim()) {
      this.cmsPagesService.addProjectCategory(body.name.trim());
    }
    return {};
  }

  @Get('projects/new')
  @Render('dashboard/project-form')
  newProject() {
    const data = this.cmsPagesService.getProjectsData();
    return {
      layout: 'dashboard',
      pageTitle: 'Thêm dự án mẫu',
      isEdit: false,
      projectCategories: data.projectCategories,
      project: {
        title: '',
        slug: '',
        categorySlug: data.projectCategories[0]?.slug ?? '',
        image: '',
        url: '#contact',
      },
      ...this.dashboardService.getSharedLayoutData('projects'),
    };
  }

  @Get('projects/:slug/edit')
  @Render('dashboard/project-form')
  editProject(@Param('slug') slug: string) {
    const data = this.cmsPagesService.getProjectsData();
    const project = this.cmsPagesService.getProjectBySlug(slug);
    return {
      layout: 'dashboard',
      pageTitle: 'Chỉnh sửa dự án',
      isEdit: true,
      projectCategories: data.projectCategories,
      project,
      ...this.dashboardService.getSharedLayoutData('projects'),
    };
  }

  @Post('projects')
  @Redirect('/dashboard/projects?saved=1')
  createProject(@Body() body: Record<string, string>) {
    this.cmsPagesService.saveProject({
      title: body.title,
      slug: body.slug || undefined,
      categorySlug: body.categorySlug,
      image: body.image,
      url: body.url,
    });
    return {};
  }

  @Post('projects/:slug')
  @Redirect('/dashboard/projects?saved=1')
  updateProject(@Param('slug') slug: string, @Body() body: Record<string, string>) {
    this.cmsPagesService.saveProject({
      title: body.title,
      slug: body.slug || undefined,
      categorySlug: body.categorySlug,
      image: body.image,
      url: body.url,
      previousSlug: slug,
    });
    return {};
  }

  @Post('projects/:slug/delete')
  @Redirect('/dashboard/projects')
  deleteProject(@Param('slug') slug: string) {
    this.cmsPagesService.deleteProject(slug);
    return {};
  }

  @Get('behavior-tree')
  @Render('dashboard/behavior-tree')
  behaviorTree(
    @Query('status') status?: string,
    @Query('seo') seo?: string,
    @Query('meta') meta?: string,
  ) {
    const context: Partial<BehaviorContext> = {};

    if (status === 'published') context.articleStatus = 'published';
    if (status === 'scheduled') context.articleStatus = 'scheduled';
    if (status === 'draft') context.articleStatus = 'draft';
    if (seo === '1') context.seoScoreReached = true;
    if (meta === '1') context.metaComplete = true;

    return {
      ...this.behaviorTreeService.getAnalysisPage(context),
      ...this.dashboardService.getSharedLayoutData('overview'),
    };
  }
}
