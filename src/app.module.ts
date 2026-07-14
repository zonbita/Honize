import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, ArticlesModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
