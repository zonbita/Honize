# DESIGN.md — Honize Landing Page

> Design system inspired by [MayTech™](https://thietkeweb.maytech.vn/) — professional web design agency layout.

## 1. Overview

| Property | Value |
|----------|-------|
| **Project** | Honize™ Landing Page |
| **Stack** | NestJS + Handlebars SSR + Tailwind CSS |
| **Reference** | MayTech web design service site |
| **Language** | Vietnamese (vi) |
| **Font** | [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) |

## 2. Brand Identity

### Logo
- Icon: rounded square `40×40px`, background `brand-600`, letter **H** in white
- Wordmark: **Honize™** in `brand-800`, font-weight 700

### Tagline
> Thiết kế web chuyên nghiệp - Sang trọng - Chuẩn SEO

### Tone
- Professional, trustworthy, modern tech agency
- Clean whitespace, blue gradient hero, card-based content blocks

## 3. Color Palette

### Primary — Brand Blue
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#eef6ff` | Icon backgrounds, hover states |
| `brand-600` | `#1a5ff5` | Primary buttons, links, accents |
| `brand-700` | `#144be1` | Button hover |
| `brand-800` | `#173eb6` | Logo text, headings accent |
| `brand-950` | `#142357` | Dark sections background |

### Neutral — Slate
| Token | Usage |
|-------|-------|
| `slate-600` | Body text |
| `slate-700` | Default body |
| `slate-900` | Headings |
| `surface-muted` `#f8fafc` | Alternate section bg |

### Accent
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#f59e0b` | Optional highlights (sparingly) |

### Gradients
```css
/* Hero */
background: linear-gradient(135deg, #142357 0%, #1a5ff5 50%, #3380ff 100%);

/* Section */
background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
```

## 4. Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 (Hero) | 4xl → 6xl | 800 | white |
| H2 (Section) | 3xl → 4xl | 700 | slate-900 |
| H3 (Card) | xl | 700 | slate-900 |
| Body | base / sm | 400 | slate-600 |
| Nav link | sm | 500 | slate-600 |
| Button | sm | 600 | white |

### Line height
- Headings: `leading-tight` / `tracking-tight`
- Body: `leading-relaxed`

## 5. Spacing & Layout

| Token | Value |
|-------|-------|
| Container max-width | `1280px` (max-w-7xl) |
| Horizontal padding | `16px` → `32px` (responsive) |
| Section padding | `py-16` mobile, `py-24` desktop |
| Card gap | `32px` (gap-8) |
| Grid columns | 1 → 2 → 3 (responsive) |

## 6. Components

### 6.1 Header (Sticky)
- White background with `backdrop-blur` and subtle shadow
- Top bar: logo left, contact + CTA right
- Nav bar: centered horizontal links with dropdown on hover
- Mobile: hamburger menu, full-width slide-down panel

### 6.2 Hero
- Full-width blue gradient background
- Decorative blur orbs (opacity 10–20%)
- Centered headline with gradient text accent
- Dual CTA: primary (white) + outline
- Wave SVG divider at bottom

### 6.3 Service Cards
- White card, `rounded-2xl`, shadow `card`
- Top accent line on hover (gradient brand-500 → brand-700)
- Icon in `brand-50` rounded square
- Lift on hover: `-translate-y-1`, enhanced shadow

### 6.4 Project Pills
- Rounded-full tags in flex-wrap grid
- Ring border, hover → brand tint

### 6.5 Speed / Feature Cards
- Two-column layout on desktop
- Icon badge (green for mobile, blue for desktop)
- White card on gradient section background

### 6.6 Dark Feature Section
- `brand-950` background
- Bordered cards with `brand-800` border
- Light text hierarchy

### 6.7 Blog Cards
- 3-column grid on large screens
- Top gradient stripe (4px)
- Title clamp 2 lines, excerpt clamp 3 lines
- "Xem chi tiết" link with arrow

### 6.8 Footer
- Dark `surface-dark` (`#0f172a`)
- 3-column grid: about, contact, links
- Icon + text contact rows
- Copyright bar with top border

## 7. Buttons

### Primary (`.btn-primary`)
```
rounded-full | bg-brand-600 | px-8 py-3 | shadow-lg
hover: bg-brand-700, -translate-y-0.5, enhanced shadow
```

### Outline (`.btn-outline`)
```
rounded-full | border-2 border-white/80 | text-white
hover: bg-white, text-brand-700
```

## 8. Shadows

| Token | Value |
|-------|-------|
| `shadow-card` | `0 4px 24px rgba(15,23,42,0.08)` |
| `shadow-card-hover` | `0 12px 40px rgba(26,95,245,0.15)` |
| `shadow-nav` | `0 2px 20px rgba(15,23,42,0.06)` |

## 9. Page Sections (Order)

1. **Header** — sticky navigation
2. **Hero** — main value proposition + CTA
3. **Services** (`#services`) — 3 service cards
4. **Projects** (`#projects`) — category pills
5. **Optimize** (`#optimize`) — PageSpeed / performance
6. **Responsive** (`#about`) — dark benefit section
7. **Pricing** (`#pricing`) — contact CTA
8. **Blog** (`#blog`) — 6 article cards
9. **Footer** (`#contact`) — contact info + links

## 10. Responsive Breakpoints

| Breakpoint | Tailwind | Behavior |
|------------|----------|----------|
| Mobile | default | 1 col, hamburger nav |
| Tablet | `md:` (768px) | 2 col grids |
| Desktop | `lg:` (1024px) | Full nav, 3 col grids |
| Wide | `xl:` (1280px) | Max container width |

## 11. Interactions

| Element | Effect |
|---------|--------|
| Cards | `hover:-translate-y-1` + shadow upgrade |
| Nav links | color → `brand-600` |
| Dropdown | fade in on parent `group-hover` |
| Buttons | lift + color shift |
| Project pills | background → `brand-50` |

## 12. File Structure

```
Honize/
├── DESIGN.md              ← This file
├── tailwind.config.js     ← Theme tokens
├── public/css/
│   ├── input.css          ← Tailwind + component classes
│   └── styles.css         ← Built output (gitignored)
├── views/
│   ├── layouts/main.hbs
│   ├── partials/header.hbs
│   ├── partials/footer.hbs
│   └── pages/home.hbs
└── src/
    ├── data/site.data.ts  ← Content data
    └── ...
```

## 13. Build Commands

```bash
npm install
npm run start:dev    # Tailwind watch + NestJS hot reload
npm run build        # Production CSS + NestJS compile
npm run start:prod   # Run compiled app
```

## 14. Future Extensions

- [ ] Blog detail pages (`/blog/:slug`)
- [ ] Project category pages (`/projects/:slug`)
- [ ] Contact form with validation
- [ ] Admin CMS module in NestJS
- [ ] i18n (EN/VI toggle)
- [ ] Dark mode toggle
