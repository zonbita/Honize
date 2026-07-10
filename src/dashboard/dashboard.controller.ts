import { Controller, Get, Query, Render } from '@nestjs/common';
import { BehaviorContext } from './behavior-tree/behavior-tree.types';
import { BehaviorTreeService } from './behavior-tree/behavior-tree.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly behaviorTreeService: BehaviorTreeService,
  ) {}

  @Get()
  @Render('dashboard/index')
  index() {
    return this.dashboardService.getDashboardPage();
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
