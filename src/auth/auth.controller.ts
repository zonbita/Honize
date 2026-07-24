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
import { consumeRateLimit } from '../db/rate-limit';
import { getClientIp } from '../shared/visit-tracker';
import {
  buildOAuthAdminUser,
  clearSessionCookie,
  findAuthUserByEmail,
  getLoginEmailPrefill,
  passwordLoginEnabled,
  readSessionUser,
  setSessionCookie,
  toPublicUser,
  verifyPassword,
} from './auth.store';
import {
  buildGoogleAuthUrl,
  createOAuthState,
  exchangeGoogleCode,
  getAllowedAdminEmail,
  isEmailAllowedAdmin,
  isGoogleAuthConfigured,
  parseOAuthState,
} from './google-oauth';

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

    const errorMsg =
      error === '1'
        ? 'Email hoặc mật khẩu không đúng.'
        : error === 'rate'
          ? 'Quá nhiều lần thử đăng nhập. Vui lòng đợi vài phút.'
          : error === 'google'
            ? 'Đăng nhập Google thất bại. Thử lại.'
            : error === 'denied'
              ? 'Tài khoản Google này không được phép vào dashboard.'
              : error === 'config'
                ? 'Google OAuth chưa cấu hình (GOOGLE_CLIENT_ID / SECRET).'
                : null;

    const googleEnabled = isGoogleAuthConfigured();
    const nextPath = this.safeNext(next);

    return {
      layout: false,
      pageTitle: 'Đăng nhập',
      next: nextPath,
      error: errorMsg,
      googleEnabled,
      googleLoginUrl: googleEnabled
        ? `/dashboard/login/google?next=${encodeURIComponent(nextPath)}`
        : null,
      passwordEnabled: passwordLoginEnabled(),
      allowedEmail: getAllowedAdminEmail() || null,
      defaultEmail:
        process.env.NODE_ENV !== 'production' ? getLoginEmailPrefill() : '',
    };
  }

  @Get('login/google')
  async startGoogleLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Query('next') next?: string,
  ) {
    if (!isGoogleAuthConfigured()) {
      return res.redirect('/dashboard/login?error=config');
    }
    if (!getAllowedAdminEmail()) {
      return res.redirect('/dashboard/login?error=config');
    }

    const ip = getClientIp(req);
    const allowed = await consumeRateLimit(`login:${ip}`, 10, 15 * 60_000);
    if (!allowed) {
      return res.redirect(`/dashboard/login?error=rate`);
    }

    try {
      const state = createOAuthState(this.safeNext(next));
      return res.redirect(buildGoogleAuthUrl(state));
    } catch {
      return res.redirect('/dashboard/login?error=google');
    }
  }

  @Get('auth/google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') oauthError?: string,
  ) {
    if (oauthError || !code) {
      return res.redirect('/dashboard/login?error=google');
    }

    const parsed = parseOAuthState(state);
    if (!parsed) {
      return res.redirect('/dashboard/login?error=google');
    }

    const ip = getClientIp(req);
    const allowed = await consumeRateLimit(`login:${ip}`, 10, 15 * 60_000);
    if (!allowed) {
      return res.redirect('/dashboard/login?error=rate');
    }

    try {
      const profile = await exchangeGoogleCode(code);
      if (!isEmailAllowedAdmin(profile.email)) {
        return res.redirect('/dashboard/login?error=denied');
      }

      setSessionCookie(
        res,
        buildOAuthAdminUser({ email: profile.email, name: profile.name }),
      );
      return res.redirect(parsed.next);
    } catch (err) {
      console.error('[auth] Google callback failed', err);
      return res.redirect('/dashboard/login?error=google');
    }
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Body() body: { email?: string; password?: string; next?: string },
    @Res() res: Response,
  ) {
    if (!passwordLoginEnabled()) {
      return res.redirect('/dashboard/login?error=config');
    }

    const email = (body.email || '').trim();
    const password = body.password || '';
    const nextUrl = this.safeNext(body.next);
    const ip = getClientIp(req);

    const allowed = await consumeRateLimit(`login:${ip}`, 10, 15 * 60_000);
    if (!allowed) {
      return res.redirect(
        `/dashboard/login?error=rate&next=${encodeURIComponent(nextUrl)}`,
      );
    }

    const stored = await findAuthUserByEmail(email);
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
