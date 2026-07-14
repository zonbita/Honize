import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, ArticlesModule, DashboardModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
