# NOVA ENGLISH — Design Spec

Reference mockup: `dcdee458-b319-4cec-ac51-067b6a294cac.png`  
Home: `/du-an/demo/hoc-tieng-anh`  
Styles: `public/demo/hoc-tieng-anh.css`  
Views: `views/demo/pages/hoc-tieng-anh.hbs` + `views/demo/pages/hoc-tieng-anh/*`  
Partials: `views/partials/demo/nova/{header,footer,cta,scripts}.hbs`

---

## 1. GENERAL STYLE

Build a bold, high-contrast English education website (landing + inner pages).

Feel:
- Professional, results-driven
- Corporate education brand
- High energy via primary red
- Trustworthy (scores, partners, campuses)
- Dense but ordered multi-column grids

Do **not** use:
- Purple / indigo gradients
- Cream + terracotta “AI default” look
- Heavy glassmorphism / glow stacks
- Pill clusters or floating promo chips in the hero
- Fully rounded primary buttons (radius ~3px only)
- Dark mode as the default page chrome

---

## 2. COLOR SYSTEM

```css
.nova-page {
  --nova-red: #e4001d;
  --nova-red-dark: #c10018;
  --nova-red-soft: #fde8eb;
  --nova-red-icon: #fce4e7;
  --nova-black: #1a1a1a;
  --nova-gray: #6b6b6b;
  --nova-gray-light: #f7f7f7;
  --nova-cream: #faf6f2;
  --nova-white: #ffffff;
  --nova-gold: #f5a623;
  --nova-container: min(1360px, calc(100% - 2rem));
  --nova-shadow: 0 8px 32px rgba(0, 0, 0, 0.07);
}
```

| Surface | Text / control |
|---------|----------------|
| White / cream | Body black/gray; primary CTA = red bg + **white** label |
| Solid red | Title/body **white**; CTA = white bg + **red** label |
| Dark `#222` | Section titles white; teacher info on white cards |

**Critical:** `.nova-page a { color: inherit }` exists — button colors must beat it via `.nova-page a.nova-btn-primary { color: #fff }` (and siblings).

---

## 3. TYPOGRAPHY

```text
font-family: 'Be Vietnam Pro', 'Roboto', system-ui, sans-serif;
```

| Role | Size / weight |
|------|----------------|
| Hero H1 | clamp ~2.2–3.6rem, weight 800, line-height ~1.08 |
| Page / section title | clamp ~1.35–2.4rem, weight 800, often uppercase |
| Card title | ~0.85–0.92rem, weight 800 |
| Body | ~0.78–0.95rem, line-height 1.65–1.75 |
| Button | 0.68–0.75rem, weight 800, uppercase, tracking ~0.05em |
| Meta | 0.62–0.7rem |

Headline accent: first line black (`Tư duy đúng.`), emphasis red stacked (`Tiếng Anh` / `bứt phá.`).

---

## 4. GLOBAL LAYOUT

- Max content width: **1360px** (`--nova-container`)
- Section padding: ~4–4.5rem desktop
- Gaps: 0.65–1.5rem
- Radius: 2–6px cards/buttons; 12px method cards; circles only for avatars
- Shadow: soft `--nova-shadow` only

Breakpoints:
- ≥768px: 2-col hero / method / LMS / CTA / about
- ≥1024px: courses 5 · achievements 6 · teachers 6 · testimonials 4 · campuses 5 · news 5

---

## 5. INFORMATION ARCHITECTURE

### Routes

| Page | Path | `novaActive` |
|------|------|----------------|
| Home | `/du-an/demo/hoc-tieng-anh` | `home` |
| Phương pháp | `…/phuong-phap` | `method` |
| Kết quả | `…/ket-qua` | `results` |
| Giảng viên | `…/giang-vien` | `teachers` |
| Học viên | `…/hoc-vien` | `students` |
| Tin tức | `…/tin-tuc` | `news` |
| Về NOVA | `…/ve-nova` | `about` |

Register subpages in `app.service.ts` → `demoSubpages['hoc-tieng-anh']`.  
Pass `novaBase` + `novaActive` into views.

### Shared chrome
- Promo bar (all pages)
- `{{> demo/nova/header }}`
- `{{> demo/nova/cta }}` (id=`contact`)
- `{{> demo/nova/footer }}`
- `{{> demo/nova/scripts }}` (mobile menu + sticky header scroll)

Nav labels (uppercase, centered):  
**Phương pháp · Kết quả · Giảng viên · Học viên · Tin tức · Về NOVA**  
Active link: `--nova-red`.

---

## 6. HOME PAGE SECTIONS

### 0. Promo bar
Full-bleed red; white offer copy + `Đăng ký ngay →`.

### 1. Header
Sticky white, border-bottom `#eee`.  
Left: logo `NOVA` (red) + `ENGLISH` (black).  
Center: nav (above).  
Right: phone `1900 6339` + primary red button **white text** `Kiểm tra trình độ miễn phí`.

### 2. Hero
Two columns (~0.95 / 1.15), visual bottom-aligned.

- Left: H1 + gray paragraph + **actions row** (button + `Hơn 12.000+…` inline; number red)
- Right: white stage + transparent cutout `21aaeeea-….png` (`object-fit: contain`, no multiply)
- Red diagonal panel behind visual (`clip-path`)
- Score badges: white rounded cards, **large red score** + IELTS + name (not avatar pills)

### 3. Courses — “Chọn lộ trình phù hợp với bạn”
- Title centered
- 5 cards, **content centered**
- Red line icons **without** circular wells — SVG only, centered at top:
  - `icon-course-ielts-adult.svg` — graduation cap
  - `icon-course-backpack.svg` — backpack
  - `icon-course-kids.svg` — smiling face
  - `icon-course-chart.svg` — bar chart
  - `icon-course-speak.svg` — speech bubble
- Title black, desc gray, red arrow at bottom

### 4. Achievements — “Bảng vàng thành tích”
- Red header: white title + link to `/ket-qua`
- Cream body; 6 equal white cards:
  - Photo top
  - Badge bottom-left on photo: white box, `IELTS` black + **red** score number
  - Body left-aligned: name / course / duration
- Do **not** use a full-width red score strip under the photo
- Bottom red stats: 4 metrics, white text

### 5. Method — Logic Path
- Left: kicker + title + copy
- Right: 3 tall cards (`border-radius: 12px`), order **num → title → text → icon (bottom)**  
  1. Red / white — `icon-logic-bulb.svg`  
  2. Dark / white — `icon-tech-devices.svg`  
  3. Cream — num + title **red**, body dark — `icon-curriculum-book.svg`

### 6. LMS
- Soft gray + faint red blobs
- Left: `nova-lms-laptop.png`
- Right: checklist (red check discs) + outline button

### 7. Teachers
- Background `#222`; white section title
- 6 cards: red disc + photo **same center**; white info card under photo (overlap)
- Name black; score = red badge + **white** text; exp gray

### 8. Testimonials + partners
- 4 quote cards (gold stars)
- Partners: marquee banner  
  - Text **dark** `#2a2a2a`, large (~1.35–2rem), uppercase  
  - Infinite horizontal scroll; pause on hover  
  - Duplicate group for seamless loop  
  - Labels: British Council · IDP · Cambridge · ETS TOEIC · College Board · GMAC

### 9. Campuses — “Hệ thống cơ sở”
- Section title **left-aligned**
- 5 cards: photo, name **black** (not red), gray address, phone + red icon

### 10. News — “Tin tức & sự kiện”
- Title + `Xem tất cả →` → `/tin-tuc`
- 5 cards: image, red tag (white text), black title, gray date  
- Remote images must 200; replace broken Unsplash IDs

### 11. CTA band
Full-bleed red, 3 cols:
- Left: `nova-cta-advisor.png`
- Center: white uppercase title + benefits
- Right: white button + red text `Đăng ký ngay →` + hotline

### 12. Footer
`#141414`; brand, socials, link columns, QR, copyright.

---

## 7. INNER PAGES

Every subpage:
1. Promo + header  
2. `.nova-page-hero` (variants: default gray / `--red` / `--dark`)  
   - Breadcrumb: Trang chủ / Current  
   - H1 + short desc  
3. Page-specific content (reuse home section blocks + data)  
4. CTA + footer + scripts  

| Page | Hero style | Main content |
|------|------------|--------------|
| Phương pháp | default | Method cards + LMS |
| Kết quả | red | Achievements grid + stats |
| Giảng viên | dark | Teachers grid |
| Học viên | default | Testimonials + partners marquee |
| Tin tức | default | News grid |
| Về NOVA | default | About story + campuses |

---

## 8. COMPONENTS

### Buttons
```text
.nova-btn-primary  → red bg, white text   (force via .nova-page a.nova-btn-primary)
.nova-btn-white    → white bg, red text
.nova-btn-outline  → white bg, black border/text
```

### Cards
White / cream surfaces, light shadow; no hero cards.

### Badges
- Achievement: white plate, black `IELTS`, red number  
- Teacher score: red fill, white text  
- News tag: red fill, white text  

### Course icons
Naked red SVG, centered — **no** pink circular background.

---

## 9. MOTION

- AOS: fade-up / fade-left / fade-right  
- Hero badges: gentle float  
- Partners: `nova-partners-marquee` linear infinite (~28s)  
- Respect `prefers-reduced-motion`  
- No glow/pulse on CTAs  

---

## 10. ASSETS

| File | Role |
|------|------|
| `dcdee458-b319-4cec-ac51-067b6a294cac.png` | Full mockup reference |
| `21aaeeea-fe80-4525-b01f-526c1b267d93.png` | Hero cutout (transparent) |
| `nova-lms-laptop.png` | LMS visual |
| `nova-cta-advisor.png` | CTA portrait |
| `icon-logic-bulb.svg` | Method 01 |
| `icon-tech-devices.svg` | Method 02 |
| `icon-curriculum-book.svg` | Method 03 |
| `icon-course-*.svg` | Course row (5 icons) |

Prefer local `/images/TiengAnh/*` over remote CDNs when assets exist.  
Verify Unsplash (or any remote) URLs return HTTP 200 before shipping.

---

## 11. IMPLEMENTATION CHECKLIST

1. Container max **1360px** — do not shrink to 1180.  
2. Primary buttons on red/white surfaces keep correct contrast (white-on-red / red-on-white).  
3. Teacher disc + photo share one center; info lives on white card.  
4. Achievement score = corner white badge, not full-width red bar.  
5. Course icons centered, no circular wells.  
6. Campus titles black; section title left-aligned.  
7. Partners darker + larger + horizontal marquee.  
8. Nav matches the 6 multi-page routes; active state in red.  
9. Vietnamese copy is source of truth for UI labels.  
10. Pixel-match section order on home; do not invent extra first-viewport widgets.

---

## 12. MULTI-PAGE LANDING STRUCTURE

Subpages are **deep landings**, not copies of Home sections. Reuse shared chrome and components; change content and section order per page.

| Route | Hero | Core sections (after Hero) |
|-------|------|----------------------------|
| `/` (Home) | Custom home hero | Existing home composition |
| `/phuong-phap` | Default (gray) | Philosophy 4 cards → Logic Path + 3 steps → Process timeline → LMS + extras → Why 6 cards → CTA |
| `/ket-qua` | Red | Achievements grid (12+) + filters → Case study timeline → Stats → Video reviews → CTA |
| `/giang-vien` | Dark | Team intro → Teacher grid + “Xem hồ sơ” → Profile detail → Recruit timeline → Training album → CTA |
| `/hoc-vien` | Default | Filtered testimonials → Video stories → Before/After → Activities album → Partners marquee → CTA |
| `/tin-tuc` | Default | Featured article → Categories → News grid → Popular posts → Newsletter → CTA |
| `/ve-nova` | Default | Intro + values → History → Stats → Campuses → Partner grid → Culture album → CTA |

### Shared partials
`header` · `cta` · `footer` · `scripts` under `views/partials/demo/nova/`

### Rules
- Keep Design Spec tokens (color, type, spacing, radius, shadow).
- Do not invent a parallel visual system for subpages.
- Filters/chips may be visual-only in the demo unless JS is added later.
- Vietnamese copy is the UI source of truth.
