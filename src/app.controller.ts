import { Body, Controller, Get, Post, Query, Redirect, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { getDevRevision } from './shared/dev-reload';
import { SERVER_BOOT_ID } from './shared/server-boot';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('pages/home')
  getHome() {
    return this.appService.getHomePageData();
  }

  @Get('gioi-thieu')
  @Render('pages/about')
  getAbout() {
    return this.appService.getAboutPageData();
  }

  @Get('quy-trinh-thiet-ke-website')
  @Render('pages/process')
  getProcess() {
    return this.appService.getProcessPageData();
  }

  @Get('thiet-ke')
  @Render('pages/design')
  getDesign() {
    return this.appService.getDesignPageData();
  }

  @Get('du-an')
  @Render('pages/projects')
  getProjects(@Query('danh-muc') category?: string) {
    return this.appService.getProjectsPageData(category);
  }

  @Get('kien-thuc')
  @Render('pages/blog-list')
  getKnowledge() {
    return this.appService.getKnowledgePageData();
  }

  @Get('lien-he')
  @Render('pages/contact')
  getContact(@Query('sent') sent?: string) {
    return this.appService.getContactPageData({ success: sent === '1' });
  }

  @Post('lien-he')
  @Redirect('/lien-he?sent=1', 303)
  postContact(
    @Body()
    _body: {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    },
  ) {
    return;
  }

  @Get('dev/reload-check')
  reloadCheck() {
    return { bootId: SERVER_BOOT_ID, revision: getDevRevision() };
  }
}
