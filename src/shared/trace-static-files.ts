import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Reference project asset roots with static relative segments so Vercel NFT
 * (and includeFiles) can ship content/views/public with the serverless function.
 */
export function projectAssetRoot(): string {
  const candidates = [
    join(__dirname, '..', '..'),
    join(__dirname, '..', '..', '..'),
    process.cwd(),
  ];
  return (
    candidates.find(
      (dir) => existsSync(join(dir, 'content')) && existsSync(join(dir, 'views')),
    ) ?? candidates[0]
  );
}

export function assertBundledAssets(): void {
  const root = projectAssetRoot();
  const content = join(root, 'content');
  const views = join(root, 'views');
  if (existsSync(content)) {
    readdirSync(content);
    const settings = join(content, 'settings.json');
    if (existsSync(settings)) readFileSync(settings, 'utf-8');
  }
  if (existsSync(views)) readdirSync(views);
}
