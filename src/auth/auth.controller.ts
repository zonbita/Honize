import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  clearSessionCookie,
  findAuthUserByEmail,
  getDefaultAdminHint,
  readSessionUser,
  setSessionCookie,
  toPublicUser,
  verifyPassword,
} from './auth.store';

@Controller('dashboard')
export class AuthController {
  @Get('login')
  @Render('dashboard/login')
  loginPage(
    @Req() req: Request,
    @Query('next') next?: string,
    @Query('error') error?: string,
  ) {
    if (readSessionUser(req)) {
      return {
        layout: false,
        alreadyLoggedIn: true,
        redirectTo: this.safeNext(next),
      };
    }

    const hint = getDefaultAdminHint();
    return {
      layout: false,
      pageTitle: 'Đăng nhập',
      next: this.safeNext(next),
      error: error === '1' ? 'Email hoặc mật khẩu không đúng.' : null,
      defaultEmail: hint.email,
      showDefaultHint: process.env.NODE_ENV !== 'production',
    };
  }

  @Post('login')
  login(
    @Body() body: { email?: string; password?: string; next?: string },
    @Res() res: Response,
  ) {
    const email = (body.email || '').trim();
    const password = body.password || '';
    const nextUrl = this.safeNext(body.next);

    const stored = findAuthUserByEmail(email);
    if (!stored || !verifyPassword(password, stored.passwordHash)) {
      return res.redirect(
        `/dashboard/login?error=1&next=${encodeURIComponent(nextUrl)}`,
      );
    }

    setSessionCookie(res, toPublicUser(stored));
    return res.redirect(nextUrl);
  }

  @Post('logout')
  @Redirect('/dashboard/login')
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
    return {};
  }

  private safeNext(next?: string): string {
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
      return '/dashboard';
    }
    if (next.startsWith('/dashboard/login')) return '/dashboard';
    return next;
  }
}
