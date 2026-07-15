import { readJsonFile } from '../dashboard/cms.storage';
import { loadSiteSettings } from './site-settings';

export interface FaqItem {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export interface FaqData {
  version: number;
  defaultAnswer: string;
  items: FaqItem[];
}

const DEFAULT_FAQ: FaqData = {
  version: 1,
  defaultAnswer:
    'Cảm ơn câu hỏi của bạn. Mình hỗ trợ thiết kế website, báo giá, SEO và tối ưu tốc độ. Bạn hỏi rõ hơn về giá / SEO / tốc độ — hoặc gửi yêu cầu tại /lien-he để được tư vấn trực tiếp.',
  items: [],
};

export function loadFaq(): FaqData {
  const stored = readJsonFile<Partial<FaqData>>('faq.json', {});
  const items = Array.isArray(stored.items)
    ? stored.items.filter(
        (item): item is FaqItem =>
          Boolean(
            item &&
              typeof item.id === 'string' &&
              typeof item.answer === 'string' &&
              Array.isArray(item.keywords),
          ),
      )
    : [];

  return {
    version: typeof stored.version === 'number' ? stored.version : DEFAULT_FAQ.version,
    defaultAnswer:
      typeof stored.defaultAnswer === 'string' && stored.defaultAnswer.trim()
        ? stored.defaultAnswer.trim()
        : DEFAULT_FAQ.defaultAnswer,
    items,
  };
}

export function fillFaqPlaceholders(text: string): string {
  const s = loadSiteSettings();
  return text
    .replace(/\{\{siteName\}\}/g, s.siteName)
    .replace(/\{\{phone\}\}/g, s.phone)
    .replace(/\{\{email\}\}/g, s.email)
    .replace(/\{\{address\}\}/g, s.address)
    .replace(/\{\{tagline\}\}/g, s.tagline);
}

/** Lowercase + bỏ dấu tiếng Việt (giá → gia, thiết kế → thiet ke). */
export function normalizeVi(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(norm: string): string[] {
  return norm.split(' ').filter(Boolean);
}

/** Max allowed edit distance by string length (short words stay strict). */
export function maxEditDistance(len: number): number {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  return 3;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  // Cap: if lengths differ a lot, skip heavy DP
  if (Math.abs(m - n) > maxEditDistance(Math.max(m, n))) {
    return Math.abs(m - n);
  }

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export function fuzzyEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  const allow = maxEditDistance(maxLen);
  if (allow <= 0) return false;
  if (Math.abs(a.length - b.length) > allow) return false;
  return levenshtein(a, b) <= allow;
}

/**
 * Does the message contain this keyword, allowing typos
 * (báo dá / báo ga / bá gia ≈ báo giá).
 */
function keywordMatches(messageNorm: string, tokens: string[], keywordNorm: string): boolean {
  if (!keywordNorm) return false;

  // Exact substring for longer keywords
  if (keywordNorm.length > 3 && messageNorm.includes(keywordNorm)) {
    return true;
  }

  const kwParts = tokenize(keywordNorm);

  // Single-token keyword
  if (kwParts.length === 1) {
    const kw = kwParts[0];
    if (kw.length <= 3) {
      // Strict word boundary — no fuzzy for "gia", "seo", "vip"
      return tokens.includes(kw);
    }
    return tokens.some((t) => fuzzyEqual(t, kw));
  }

  // Multi-word keyword: slide window + glued form
  const window = kwParts.length;
  for (let i = 0; i <= tokens.length - window; i++) {
    const slice = tokens.slice(i, i + window);
    const spaced = slice.join(' ');
    if (fuzzyEqual(spaced, keywordNorm) || spaced === keywordNorm) {
      return true;
    }
    // Also allow each token to fuzzy-match the keyword part in order
    let partsOk = true;
    for (let p = 0; p < window; p++) {
      if (!fuzzyEqual(slice[p], kwParts[p]) && slice[p] !== kwParts[p]) {
        partsOk = false;
        break;
      }
    }
    if (partsOk) return true;
  }

  // Glued message (baogia, thietkeweb) vs glued keyword
  const msgGlued = tokens.join('');
  const kwGlued = kwParts.join('');
  if (kwGlued.length >= 5 && (msgGlued.includes(kwGlued) || fuzzyPhraseInGlued(msgGlued, kwGlued))) {
    return true;
  }

  return false;
}

/** Find a fuzzy occurrence of keyword (no spaces) inside glued message. */
function fuzzyPhraseInGlued(glued: string, kwGlued: string): boolean {
  const allow = maxEditDistance(kwGlued.length);
  if (allow <= 0) return glued.includes(kwGlued);
  const minLen = Math.max(1, kwGlued.length - allow);
  const maxLen = kwGlued.length + allow;
  for (let len = minLen; len <= maxLen; len++) {
    for (let i = 0; i + len <= glued.length; i++) {
      const slice = glued.slice(i, i + len);
      if (fuzzyEqual(slice, kwGlued)) return true;
    }
  }
  return false;
}

function scoreFaqItem(messageNorm: string, tokens: string[], item: FaqItem): number {
  let score = 0;
  for (const raw of item.keywords) {
    const kw = normalizeVi(String(raw || ''));
    if (!kw) continue;
    if (keywordMatches(messageNorm, tokens, kw)) {
      // Longer / multi-word keywords weigh more
      const parts = tokenize(kw).length;
      score += Math.max(1, Math.min(kw.replace(/\s/g, '').length, 12)) + (parts > 1 ? 2 : 0);
    }
  }
  return score;
}

/**
 * Find best FAQ match for a user message.
 * Matching ignores diacritics and tolerates typos (Levenshtein).
 */
export function matchFaq(
  message: string,
  minScore = 1,
): { item: FaqItem; answer: string; score: number } | null {
  const faq = loadFaq();
  const messageNorm = normalizeVi(message);
  const tokens = tokenize(messageNorm);
  let best: { item: FaqItem; score: number } | null = null;

  for (const item of faq.items) {
    const score = scoreFaqItem(messageNorm, tokens, item);
    if (score < minScore) continue;
    if (!best || score > best.score) {
      best = { item, score };
    }
  }

  if (!best) return null;
  return {
    item: best.item,
    answer: fillFaqPlaceholders(best.item.answer),
    score: best.score,
  };
}

export function getFaqDefaultAnswer(): string {
  return fillFaqPlaceholders(loadFaq().defaultAnswer);
}

/** Compact FAQ block for AI system prompts. */
export function buildFaqPromptBlock(maxItems = 40): string {
  const faq = loadFaq();
  if (!faq.items.length) return '';

  const lines = faq.items.slice(0, maxItems).map((item) => {
    const q = item.question || item.id;
    const a = fillFaqPlaceholders(item.answer);
    return `- Q: ${q}\n  A: ${a}`;
  });

  return ['Kiến thức FAQ có sẵn (ưu tiên trả lời đúng theo đây khi khớp chủ đề):', ...lines].join(
    '\n',
  );
}
