import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [ArticlesModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
