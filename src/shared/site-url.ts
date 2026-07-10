export function getSiteUrl(): string {
  const url = process.env.SITE_URL ?? 'http://localhost:3000';
  return url.replace(/\/$/, '');
}

export function toAbsoluteUrl(path: string, siteUrl = getSiteUrl()): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
