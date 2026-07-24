import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { consumeRateLimit } from './db/rate-limit';
import { saveContactSubmission } from './shared/contact-submissions';
import { getDevRevision } from './shared/dev-reload';
import { SERVER_BOOT_ID } from './shared/server-boot';
import { getClientIp } from './shared/visit-tracker';

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

  @Get('du-an/demo/:slug/:subpage')
  getDemoSubpage(
    @Param('slug') slug: string,
    @Param('subpage') subpage: string,
    @Res() res: Response,
  ) {
    const data = this.appService.getDemoSubpageData(slug, subpage);
    if (!data) {
      throw new NotFoundException(`Trang demo "${slug}/${subpage}" không tồn tại`);
    }
    return res.render(data.demoView, data);
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
  getContact(@Query('sent') sent?: string, @Query('error') error?: string) {
    return this.appService.getContactPageData({
      success: sent === '1',
      error: error === 'rate',
      fieldErrors:
        error === 'rate'
          ? { message: 'Bạn gửi quá nhiều form. Vui lòng thử lại sau 1 giờ.' }
          : undefined,
    });
  }

  @Post('lien-he')
  async postContact(
    @Req() req: Request,
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
    const ip = getClientIp(req);
    const allowed = await consumeRateLimit(`contact:${ip}`, 5, 60 * 60_000);
    if (!allowed) {
      return res.redirect(303, '/lien-he?error=rate');
    }

    const result = await saveContactSubmission(body);
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
