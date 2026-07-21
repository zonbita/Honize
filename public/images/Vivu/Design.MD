# VIVU — Design Spec

Reference mockups: `vivu (1).png` … `vivu (9).png`, `34b86968-2f4a-4561-b1cd-ec300a4c1371.png`  
Home: `/du-an/demo/vivu`  
Styles: `public/demo/vivu.css`  
Views: `views/demo/pages/vivu.hbs` + `views/demo/pages/vivu/*`  
Partials: `views/partials/demo/vivu/{header,footer,cta,scripts}.hbs`  
Data: `src/app.service.ts` → destinations / tours / stats / testimonials / `getVivuExtras`

---

## 1. GENERAL STYLE

Build a premium travel landing for **VIVU** — khám phá Việt Nam.

Feel:
- Calm, natural, refined
- Dark teal + muted gold + cream
- Soft glassmorphism on overlays / cards
- Full-bleed photography in hero & video band
- Clean spacious layout, serif display headings

Do **not** use:
- Purple / indigo gradients
- Neon turquoise or heavy glow stacks
- Dark mode as default page chrome
- Placeholder image CDNs (Unsplash, etc.)
- Text baked into image files — copy/UI must be HTML

---

## 2. COLOR SYSTEM

```css
.vivu-page {
  --primary-900: #0c3a42;
  --primary-800: #134f5d;
  --primary-700: #1a6574;
  --primary-600: #247d8e;
  --primary-500: #3d97a6;

  --gold-600: #b8924a;
  --gold-500: #c9a46a;
  --gold-400: #d4b483;
  --gold-100: #f5ead8;

  --sage-700: #547463;
  --sage-600: #718d78;
  --sage-500: #8fa592;
  --sage-100: #e8f0eb;

  --background: #faf7f2;
  --background-soft: #f3efe8;
  --background-blue: #f1f7f8;

  --text-primary: #0c3a42;
  --text-secondary: #5a6b6e;
  --border: rgba(185, 146, 74, 0.22);
  --white: #ffffff;

  --shadow-soft: 0 14px 38px rgba(12, 58, 66, 0.08);
  --shadow-card: 0 12px 28px rgba(12, 58, 66, 0.1);
  --shadow-hero: 0 24px 60px rgba(12, 58, 66, 0.18);

  --radius-btn: 999px;
  --radius-card: 0;
  --radius-panel: 0;
  --transition: all 220ms ease;
}
```

| Surface | Text / control |
|---------|----------------|
| Cream `#faf7f2` | Body teal/gray; kicker = gold |
| Teal primary CTA | White label |
| Gold CTA (newsletter) | White label |
| Outline button | Teal text + gold border |
| Dark footer | Light logo + muted links |

**Critical:** `.vivu-page a { color: inherit }` — primary buttons need `color: #fff !important`.

---

## 3. TYPOGRAPHY

```text
Body / UI:  'Be Vietnam Pro', 'Inter', system-ui, sans-serif
Display:    'Playfair Display', Georgia, serif   ← section titles + hero H1
```

| Role | Size / weight |
|------|----------------|
| Hero H1 | clamp ~34–70px, weight 700, Playfair, line-height ~1.08 |
| Section title | clamp 28–38px, weight 700, Playfair |
| Card title | ~16–18px, weight 600–700 |
| Body | ~14–16px, weight 400, line-height ~1.65 |
| Kicker | 12px, weight 700, uppercase, letter-spacing 0.14em, gold |
| Button | 13–15px, weight 600 |

---

## 4. GLOBAL LAYOUT

- Max content width: **1280px** (`.vivu-container`)
- Horizontal padding: `clamp(20px, 5vw, 72px)`
- Page background: cream `#faf7f2`
- Radius: pill buttons (`999px`); cards/panels mostly square (`0`)
- Transition: `220ms ease`
- AOS: fade-up ~650ms, staggered delays on cards

Breakpoints:
- ≤1200px: hero tighter; tours/blog → 2 cols
- ≤1024px: hamburger nav; hero/why/reviews/newsletter stack; dest → 2 cols
- ≤640px: dest horizontal scroll; trust 1 col; footer 1 col; newsletter form stack

---

## 5. ASSETS (`public/images/Vivu/`)

| File | Usage |
|------|--------|
| `01-hero-ha-long.png` | Hero full-bleed background (default) |
| `02-ha-long.png` | Dest card · tour · blog · pick-card thumb |
| `03-da-nang.png` | Dest card Đà Nẵng |
| `04-hoi-an.png` | Dest · tour · blog · pick-card · video thumb · hero swap |
| `05-da-lat.png` | Dest card Đà Lạt |
| `06-phu-quoc.png` | Dest · tour · pick-card · hero swap |
| `07-sa-pa.png` | Dest · blog · video band background |
| `08-travel-couple.png` | Why / experiences visual |
| `09-3d-travel-suitcase.png` | Newsletter right visual |
| `10-newsletter-nature-bg.png` | Newsletter panel soft nature/grass background |
| `vivu (1–9).png` | Design reference mockups |
| `34b86968-….png` | Extra reference |

---

## 6. INFORMATION ARCHITECTURE

Multi-page demo. Shared chrome: `views/partials/demo/vivu/{header,footer,cta,scripts}.hbs`  
Register subpages in `app.service.ts` → `demoSubpages['vivu']`. Pass `vivuBase` + `vivuActive`.

| Page | Path | `vivuActive` |
|------|------|----------------|
| Home | `/du-an/demo/vivu` | `home` |
| Điểm đến | `…/diem-den` | `destinations` |
| Tour du lịch | `…/tour-du-lich` | `tours` |
| Trải nghiệm | `…/trai-nghiem` | `experiences` |
| Cẩm nang | `…/cam-nang` | `handbook` |
| Liên hệ | `…/lien-he` | `contact` |

Internal pages use sticky solid header (`.vivu-header.is-solid`) + full-bleed page hero + shared CTA band + footer.

### Internal page sections (summary)

**Điểm đến:** Hero · filter chips · destination cards (tours + rating) · highlight icons · CTA  
**Tour:** Hero · filter panel · tour grid (6) · benefits · CTA  
**Trải nghiệm:** Hero · experience grid · gallery + lightbox · video · stories · reviews · CTA  
**Cẩm nang:** Hero · tabs · article grid + sidebar · newsletter · CTA  
**Liên hệ:** Hero · contact cards · form + map · FAQ accordion · social

---

## 7. HOME PAGE SECTIONS (top → bottom)

### 1. Header (`.vivu-header`)

- Absolute / overlay on hero; height **76px**
- Glass: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(18px)`
- On scroll (`.is-scrolled`): solid white + soft shadow
- Left: compass SVG logo + **VIVU**
- Center nav → subpages (see §6)
- Right: globe + **VN** · primary **Đặt tour** → `/lien-he`
- ≤1024px: hide primary CTA; show hamburger → drawer nav

### 2. Hero (`#home` · `.vivu-hero`)

**Full-bleed background** (not inset card):
- Default image: `01-hero-ha-long.png`
- Overlay gradient for text readability
- Desktop min-height ~ viewport; two columns: content | sidebar

**Left content**
- Overline: `KHÁM PHÁ VIỆT NAM` + decorative line
- H1: **Chạm vào vẻ đẹp Việt Nam**
- Body: *Hành trình được thiết kế tinh tế, đưa bạn đến những miền đất đẹp nhất và trải nghiệm văn hóa bản địa chân thực.*
- CTAs:
  - Primary → `/tour-du-lich`: **Khám phá tour** (+ arrow)
  - Outline → `/trai-nghiem`: play icon + **Xem hành trình**
- Social proof: 4 initial avatars (LM, TH, PK, NA) + badge `+10K+` + *10.000+ du khách đã đồng hành*

**Right sidebar**
1. **Itinerary card** — *Gợi ý hành trình 3N2Đ*
   - Ngày 1 — Hà Nội – Hạ Long — *Khởi hành & du thuyền ngắm vịnh*
   - Ngày 2 — Vịnh Hạ Long — *Tham quan hang Sửng Sốt, chèo kayak*
   - Ngày 3 — Hạ Long – Hà Nội — *Làng chài & trở về*
   - Link: **Xem chi tiết hành trình** → `/tour-du-lich`
2. **Pick cards** (swap hero `data-bg`):
   | Active | Name | Subtitle | Background |
   |--------|------|----------|------------|
   | default | Hạ Long | Di sản thiên nhiên | `01-hero-ha-long.png` |
   | | Hội An | Phố cổ yên bình | `04-hoi-an.png` |
   | | Phú Quốc | Biển xanh cát trắng | `06-phu-quoc.png` |

### 3. Destinations (`#destinations`)

- Kicker: `ĐIỂM ĐẾN NỔI BẬT`
- Title: **Việt Nam – Mỗi điểm đến, một câu chuyện**
- Desktop: 6-column grid; mobile: horizontal snap carousel
- Data from `getDemoDestinations('vivu')` (includes `tours` + `rating` for list page):

| Name | Category | Desc | Image |
|------|----------|------|-------|
| Hạ Long | DI SẢN | Di sản thiên nhiên thế giới | `02-ha-long.png` |
| Đà Nẵng | BIỂN | Thành phố biển năng động | `03-da-nang.png` |
| Hội An | DI SẢN | Phố cổ yên bình | `04-hoi-an.png` |
| Đà Lạt | THIÊN NHIÊN | Thành phố ngàn hoa | `05-da-lat.png` |
| Phú Quốc | BIỂN | Biển xanh cát trắng | `06-phu-quoc.png` |
| Sa Pa | THIÊN NHIÊN | Ruộng bậc thang mây trời | `07-sa-pa.png` |

Card: full-bleed photo + gradient overlay · pin + category · name · desc · arrow affordance. Hover: lift + image scale.

### 4. Why / Experiences (`#experiences` · `.vivu-why`)

Two-column shell: visual | panel.

- Visual: `08-travel-couple.png` — *Cặp đôi du lịch ngắm cảnh núi*
- Kicker: `VÌ SAO CHỌN VIVU`
- Title: **Hành trình trọn vẹn – Trải nghiệm khác biệt**
- Feature grid (2×2):

| Title | Description |
|-------|-------------|
| Lịch trình cá nhân hóa | Thiết kế riêng theo sở thích, thời gian và ngân sách của bạn. |
| Hướng dẫn viên chuyên nghiệp | Am hiểu địa phương, đồng hành và truyền cảm hứng. |
| Dịch vụ chọn lọc | Đối tác uy tín, lưu trú tiện nghi, phương tiện an toàn. |
| Hỗ trợ 24/7 | Luôn sẵn sàng hỗ trợ bạn trong suốt hành trình. |

- Stats strip (`getDemoStats`):

| Value | Label |
|-------|-------|
| 500+ | Hành trình đã tổ chức |
| 50+ | Điểm đến hấp dẫn |
| 98% | Khách hàng hài lòng |

### 5. Tours (`#tours`)

- Kicker: `TOUR ĐƯỢC YÊU THÍCH NHẤT`
- Title: **Lựa chọn hàng đầu cho kỳ nghỉ của bạn**
- Filter tabs (UI only): Tất cả · Miền Bắc · Miền Trung · Miền Nam · Nghỉ dưỡng · Khám phá
- Cards from `getDemoTours('vivu')`:

| Title | Duration | Price | Rating | Reviews | Badge | Image | Highlights |
|-------|----------|-------|--------|---------|-------|-------|------------|
| Hạ Long – Kỳ quan di sản | 3N2Đ | 4.990.000đ | 4.9 | 128 | Bán chạy | `02-ha-long.png` | Du thuyền 4 sao · Hang Sửng Sốt · Kayak vịnh |
| Hội An – Phố cổ đêm | 2N1Đ | 3.290.000đ | 4.8 | 96 | Ưu đãi | `04-hoi-an.png` | Phố cổ về đêm · Gión thả đèn hoa đăng · Ẩm thực địa phương |
| Phú Quốc – Biển xanh | 4N3Đ | 6.490.000đ | 4.9 | 84 | — | `06-phu-quoc.png` | Resort 5 sao · Lặn ngắm san hô · Sunset cocktail |

Card footer: *Từ* **price** */ Khách* + button **Xem chi tiết** → `#contact`

### 6. Video band (`.vivu-video`)

- Full-bleed bg: `07-sa-pa.png` + dark overlay
- Title: **Mỗi chuyến đi là một câu chuyện đáng nhớ**
- CTA outline: play + **Xem video trải nghiệm** → `#experiences`
- Decorative thumb: `04-hoi-an.png`
- Category nav (UI only): Văn hóa · Ẩm thực · Nghỉ dưỡng · Ngoài trời · Chụp ảnh

### 7. Reviews (`#handbook` · `.vivu-reviews`)

- Kicker: `KHÁCH HÀNG NÓI VỀ VIVU`
- Testimonial carousel (JSON `#vivu-testimonials-data`, auto-rotate 6s, dots):

| Name | Location | Quote (summary) | Avatar color |
|------|----------|-----------------|--------------|
| Nguyễn Linh Anh | Hà Nội | Hội An tuyệt vời — lịch trình, HDV, khách sạn | `#31899a` |
| Trần Hoài An | TP. Hồ Chí Minh | Phú Quốc — chu đáo, phù hợp trẻ em | `#55a4ae` |
| Lê Phương Thảo | Đà Nẵng | Sa Pa lúa chín — homestay & văn hóa chân thực | `#718d78` |
| Phạm Quốc Bảo | Cần Thơ | Hạ Long — báo giá rõ, du thuyền sang | `#236f80` |

- Trust grid (4 cards):
  - **10.000+** Du khách tin dùng
  - **4.8/5** Đánh giá trung bình
  - **98%** Khách hàng hài lòng
  - **5 năm+** Kinh nghiệm tổ chức tour

### 8. Blog / Handbook (`.vivu-blog`)

- Kicker: `CẨM NANG DU LỊCH`
- Title: **Khám phá & Lên kế hoạch**
- Link: **Xem tất cả bài viết →** → `#handbook`

| Date | Category | Title | Excerpt | Image |
|------|----------|-------|---------|-------|
| 15/03/2026 | Cẩm nang | Kinh nghiệm du lịch Hạ Long 3 ngày 2 đêm | Lịch trình, khách sạn, món ăn vịnh di sản | `02-ha-long.png` |
| 08/03/2026 | Ẩm thực | Top 10 món ăn phải thử khi đến Hội An | Cao lầu, mì Quảng, bánh mì Phượng | `04-hoi-an.png` |
| 28/02/2026 | Khám phá | Sa Pa mùa lúa chín — Thời điểm đẹp nhất | Tháng 9–10, trekking ruộng bậc thang | `07-sa-pa.png` |

### 9. Newsletter (`#contact` · `.vivu-newsletter`)

- Panel background: soft blurry nature/grass photo `10-newsletter-nature-bg.png` + cream gradient overlay (keeps text readable)
- Kicker: `ĐĂNG KÝ NHẬN TIN`
- Title: **Nhận cảm hứng cho chuyến đi tiếp theo**
- Copy: *Đăng ký nhận ưu đãi độc quyền và gợi ý hành trình mới nhất.*
- Form: email placeholder *Nhập email của bạn* · gold button **Đăng ký ngay**
- Validation: regex email; success / error messages in Vietnamese
- Visual: `09-3d-travel-suitcase.png`

### 10. Footer (`.vivu-footer`)

Five columns:

1. **Brand** — logo light · *VIVU mang đến những hành trình tinh tế…* · social: Facebook / Instagram / YouTube
2. **Về VIVU** — Giới thiệu · Cam kết chất lượng · Tin tức · Tuyển dụng · Đối tác
3. **Hỗ trợ** — Câu hỏi thường gặp · Chính sách đặt tour · Điều khoản sử dụng · Chính sách bảo mật
4. **Khám phá** — Điểm đến · Tour du lịch · Trải nghiệm · Cẩm nang du lịch
5. **Liên hệ** — `1900 1234` · `hello@vivu.vn` · 123 Đường Lê Lợi, Quận 1 · TP. Hồ Chí Minh, Việt Nam

Bottom: `© {{year}} VIVU. All rights reserved.` + circular **back-to-top** button.

---

## 8. INTERACTIONS / JS (inline in `vivu.hbs`)

- Sticky/scrolled header class after `scrollY > 8`
- Mobile nav drawer (`aria-expanded`)
- Smooth scroll for `#` anchors (respect `prefers-reduced-motion`)
- Back-to-top
- Newsletter email validation
- Testimonial carousel + dots + 6s interval
- Tour tabs / video nav: active state only (no filter logic yet)
- Hero pick-cards: preload + fade-swap background image

---

## 9. RESPONSIVE SUMMARY

| Breakpoint | Behavior |
|------------|----------|
| Desktop | 1280 max · 6 dest cols · 2-col hero / why · 3 tour/blog cards |
| ≤1200 | Tours/blog 2 cols · tighter hero |
| ≤1024 | Hamburger · stacked sections · dest 2 cols · footer 2 cols |
| ≤640 | Dest carousel · trust 1 col · form stack · footer 1 col · H1 34–42px |

Buttons ≥44px height. No horizontal page overflow.

---

## 10. CONSTRAINTS

- Reproduce mockup layout closely; keep Vietnamese accents correct
- Local images only under `public/images/Vivu/`
- Map destinations / tours / stats / testimonials from `app.service.ts` data arrays
- Accessible: focus-visible outlines, ARIA on carousels / pick-cards / tabs
- Final feel: premium, calm, natural, production-ready
