let revision = Date.now();
let bumpTimer: ReturnType<typeof setTimeout> | null = null;

/** Tăng revision để trình duyệt dev tự reload (giống HMR). */
export function bumpDevRevision(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (bumpTimer) clearTimeout(bumpTimer);
  bumpTimer = setTimeout(() => {
    revision = Date.now();
    bumpTimer = null;
  }, 250);
}

export function getDevRevision(): number {
  return revision;
}
