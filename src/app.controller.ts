import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { saveContactSubmission } from './shared/contact-submissions';
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

  @Get('du-an/demo')
  @Render('demo/index')
  getDemoIndex(@Query('danh-muc') category?: string) {
    return this.appService.getDemoIndexData(category);
  }

  @Get('du-an/demo/:slug')
  getDemo(@Param('slug') slug: string, @Res() res: Response) {
    const data = this.appService.getDemoPageData(slug);
    if (!data) throw new NotFoundException(`Demo "${slug}" không tồn tại`);
    return res.render(data.demoView, data);
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
  postContact(
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    },
    @Res() res: Response,
  ) {
    const result = saveContactSubmission(body);
    if (!result.ok) {
      return res.status(400).render(
        'pages/contact',
        this.appService.getContactPageData({
          error: true,
          formValues: {
            name: body?.name ?? '',
            email: body?.email ?? '',
            phone: body?.phone ?? '',
            subject: body?.subject ?? '',
            message: body?.message ?? '',
          },
          fieldErrors: result.errors,
        }),
      );
    }
    return res.redirect(303, '/lien-he?sent=1');
  }

  @Get('dev/reload-check')
  reloadCheck() {
    return { bootId: SERVER_BOOT_ID, revision: getDevRevision() };
  }
}
