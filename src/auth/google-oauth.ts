import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { getSiteUrl } from '../shared/site-url';

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function getAllowedAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

export function getGoogleCallbackUrl(): string {
  return `${getSiteUrl()}/dashboard/auth/google/callback`;
}

function stateSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error('SESSION_SECRET is required for Google login');
  }
  return secret;
}

export function createOAuthState(nextPath: string): string {
  const nonce = randomBytes(16).toString('hex');
  const payload = Buffer.from(
    JSON.stringify({ next: nextPath, nonce, exp: Date.now() + 10 * 60_000 }),
    'utf-8',
  ).toString('base64url');
  const sig = createHmac('sha256', stateSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function parseOAuthState(state: string | undefined): { next: string } | null {
  if (!state) return null;
  const [payload, sig] = state.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', stateSecret()).update(payload).digest('base64url');
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      next?: string;
      exp?: number;
    };
    if (!data.exp || Date.now() > data.exp) return null;
    const next =
      data.next && data.next.startsWith('/') && !data.next.startsWith('//')
        ? data.next
        : '/dashboard';
    return { next };
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  email: string;
  name: string;
  picture?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!.trim();

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${text}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error('Google token response missing access_token');
  }

  const userRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`Google userinfo failed: ${userRes.status}`);
  }

  const profile = (await userRes.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  const email = (profile.email || '').trim().toLowerCase();
  if (!email || profile.email_verified === false) {
    throw new Error('Google account email is missing or unverified');
  }

  return {
    email,
    name: (profile.name || email.split('@')[0] || 'Admin').trim(),
    picture: profile.picture,
  };
}

export function isEmailAllowedAdmin(email: string): boolean {
  const allowed = getAllowedAdminEmail();
  if (!allowed) return false;
  return email.trim().toLowerCase() === allowed;
}
