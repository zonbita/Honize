import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';

@Controller('api')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  async chat(
    @Req() req: Request,
    @Body()
    body: {
      message?: string;
      history?: { role?: string; content?: string }[];
    },
  ) {
    const ip =
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : '') ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    try {
      const reply = await this.chatService.reply({
        message: body?.message ?? '',
        history: Array.isArray(body?.history) ? body.history : [],
        ip,
      });
      return { reply };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat tạm thời không khả dụng.';
      const status =
        message.includes('quá nhiều') || message.includes('ngắn hơn')
          ? HttpStatus.TOO_MANY_REQUESTS
          : message.includes('để trống') || message.includes('500 ký tự')
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.SERVICE_UNAVAILABLE;
      throw new HttpException({ error: message }, status);
    }
  }
}
