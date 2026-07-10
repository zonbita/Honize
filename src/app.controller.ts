import { Controller, Get, Render } from '@nestjs/common';
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

  @Get('dev/reload-check')
  reloadCheck() {
    return { bootId: SERVER_BOOT_ID, revision: getDevRevision() };
  }
}
