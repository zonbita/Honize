import { Module } from '@nestjs/common';
import { ArticlesModule } from '../articles/articles.module';
import { BehaviorTreeService } from './behavior-tree/behavior-tree.service';
import { CmsPagesService } from './cms-pages.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ArticlesModule],
  controllers: [DashboardController],
  providers: [DashboardService, BehaviorTreeService, CmsPagesService],
})
export class DashboardModule {}
