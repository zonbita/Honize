import { existsSync, watch } from 'fs';
import { join } from 'path';
import { bumpDevRevision } from './dev-reload';

function watchPath(label: string, target: string): void {
  if (!existsSync(target)) return;

  try {
    watch(target, { recursive: true }, () => bumpDevRevision());
    console.log(`[dev] watching ${label}: ${target}`);
  } catch {
    watch(target, () => bumpDevRevision());
    console.log(`[dev] watching ${label}: ${target}`);
  }
}

/** Theo dõi views, content, CSS — thay đổi sẽ báo trình duyệt reload. */
export function startDevWatcher(root: string): void {
  if (process.env.NODE_ENV === 'production') return;

  watchPath('views', join(root, 'views'));
  watchPath('content', join(root, 'content'));
  watchPath('css', join(root, 'public', 'css'));
}
