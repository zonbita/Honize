# Tối ưu tốc độ website với Core Web Vitals

Một website thiết kế sang trọng, đầy ảnh nghệ thuật vẫn **thất bại** nếu tải chậm trên 4G. Google dùng **Core Web Vitals** — bộ chỉ số đo trải nghiệm thực tế của người dùng — làm tín hiệu xếp hạng. Bài viết giải thích từng chỉ số LCP, INP, CLS và cách tối ưu cụ thể cho website WordPress, NestJS/Node hoặc static site tại Việt Nam.

## Core Web Vitals là gì?

Core Web Vitals (CWV) là 3 metric chính trong bộ **Web Vitals** của Google:

| Metric | Đo lường | Ngưỡng tốt | Ngưỡng cần cải thiện |
|--------|----------|------------|----------------------|
| **LCP** (Largest Contentful Paint) | Thời gian hiển thị nội dung lớn nhất | ≤ 2.5s | 2.5s – 4.0s |
| **INP** (Interaction to Next Paint) | Độ trễ phản hồi tương tác | ≤ 200ms | 200ms – 500ms |
| **CLS** (Cumulative Layout Shift) | Độ ổn định bố cục | ≤ 0.1 | 0.1 – 0.25 |

*Lưu ý: INP thay thế FID từ 2024. FID đo lần tương tác đầu; INP đo trải nghiệm tương tác toàn phiên.*

Bạn kiểm tra qua [PageSpeed Insights](https://pagespeed.web.dev/), Google Search Console (mục Core Web Vitals), hoặc Lighthouse trong Chrome DevTools.

## Tại sao tốc độ quan trọng với website doanh nghiệp?

1. **70%+ người dùng thoát** nếu trang tải quá 3 giây (theo nhiều nghiên cứu hành vi).
2. Google ưu tiên trang nhanh trên mobile-first index.
3. Tốc độ ảnh hưởng trực tiếp **tỷ lệ chuyển đổi** — form liên hệ, đặt hàng, gọi điện.
4. Website dịch vụ B2B: khách hàng so sánh 3–5 vendor; site chậm = kém chuyên nghiệp.

## 1. LCP — Largest Contentful Paint

LCP đo thời điểm **phần tử lớn nhất** trong viewport (thường là ảnh hero, video poster, hoặc block text lớn) được render.

### Nguyên nhân LCP chậm phổ biến

- Ảnh hero full-width chưa nén (2–5MB JPG).
- Font web block render (FOIT/FOUT).
- Server phản hồi chậm (TTFB > 600ms).
- CSS/JS render-blocking trên `<head>`.
- Không dùng CDN cho user xa server.

### Cách cải thiện LCP

**Ảnh hero**
```html
<img src="/images/hero-mockup.webp"
     width="1536" height="1024"
     fetchpriority="high"
     loading="eager"
     alt="Giao diện website mẫu">
```
- Dùng WebP, kích thước phù hợp (≤ 200KB cho hero nếu có thể).
- `fetchpriority="high"` cho LCP element.
- Không lazy-load ảnh above the fold.

**Font**
- `font-display: swap` trong `@font-face`.
- Preload font chính: `<link rel="preload" href="..." as="font" crossorigin>`.
- Giới hạn số weight (400, 600, 700) — không load 8 file font.

**Server & caching**
- Bật gzip/brotli compression.
- Cache HTML tĩnh với CDN (Cloudflare, BunnyCDN…).
- Hosting gần user VN nếu khách chủ yếu Việt Nam.

**Critical CSS**
- Inline CSS cần thiết cho above-the-fold.
- Defer CSS không critical: `media="print" onload="this.media='all'"`.

### Mục tiêu LCP cho website premium

| Loại site | LCP mục tiêu |
|-----------|--------------|
| Landing page | < 2.0s |
| Blog | < 2.5s |
| E-commerce | < 2.5s |

## 2. INP — Interaction to Next Paint

INP đo độ trễ từ khi người dùng click/tap/keypress đến khi trình duyệt **vẽ frame tiếp theo** phản hồi tương tác.

### Nguyên nhân INP cao

- JavaScript nặng trên main thread (slider, chat widget, analytics).
- Event handler chậm (xử lý form lớn sync).
- Third-party script: Facebook Pixel, Google Tag Manager quá nhiều tag.
- Re-render React/Vue không tối ưu.

### Cách cải thiện INP

1. **Defer / async** script không cần ngay:
   ```html
   <script src="/js/aos-init.js" defer></script>
   ```
2. **Code splitting** — chỉ load JS cần cho trang hiện tại.
3. Trì hoãn chat widget, popup đến sau `requestIdleCallback` hoặc user scroll.
4. Debounce input search/filter.
5. Giảm DOM size — tránh 3000+ node trên một trang.

### Kiểm tra INP

Chrome DevTools → Performance → record → tương tác → xem **Long Tasks** (> 50ms).

## 3. CLS — Cumulative Layout Shift

CLS đo mức độ **layout “nhảy”** khi trang đang tải — ví dụ: banner quảng cáo đẩy nội dung xuống, ảnh không có kích thước làm text nhảy.

### Nguyên nhân CLS cao

- Ảnh/embed không có `width` và `height`.
- Font swap làm text reflow (FOUT).
- Inject banner/iframe động phía trên content.
- Cookie consent bar đẩy layout.

### Cách cải thiện CLS

```html
<!-- Luôn khai báo kích thước -->
<img src="..." width="800" height="600" alt="...">

<!-- Hoặc aspect-ratio CSS -->
.project-card-frame {
  aspect-ratio: 4 / 5;
}
```

- Reserve space cho embed YouTube/Google Maps.
- Cookie bar: `position: fixed` thay vì đẩy document flow.
- Dùng `size-adjust` hoặc fallback font metric-compatible.

## 4. Checklist tối ưu toàn diện

### Hình ảnh
- [ ] Chuyển sang WebP/AVIF
- [ ] Lazy load below fold
- [ ] Responsive `srcset`
- [ ] CDN cho static assets

### CSS & JS
- [ ] Minify CSS/JS production
- [ ] Remove unused CSS (PurgeCSS/Tailwind JIT)
- [ ] Defer non-critical JS
- [ ] Không jQuery nếu không cần

### Server
- [ ] HTTP/2 hoặc HTTP/3
- [ ] Brotli compression
- [ ] Browser cache headers (1 year cho static hash filename)

### WordPress cụ thể
- [ ] Cache plugin (WP Rocket, LiteSpeed)
- [ ] Object cache (Redis)
- [ ] Database InnoDB, cleanup revision
- [ ] Hạn chế plugin (< 15 plugin active)

## 5. Công cụ đo lường

| Công cụ | Mục đích |
|---------|----------|
| PageSpeed Insights | Lab + field data (CrUX) |
| Search Console | CWV theo URL thật |
| Lighthouse | Audit chi tiết local |
| WebPageTest | Test từ location VN |
| Chrome UX Report | Dữ liệu người dùng thật |

Chạy test trên **mobile 4G simulated** — không chỉ desktop văn phòng.

## 6. Dịch vụ tối ưu website — khi nào cần thuê?

Tự tối ưu được nếu bạn quen kỹ thuật. Nên thuê chuyên gia khi:

- PageSpeed mobile < 50 điểm sau khi đã thử cơ bản
- LCP > 4s trên CrUX (dữ liệu thật)
- Website WordPress + WooCommerce + nhiều plugin
- Cần đạt ngưỡng CWV trước chiến dịch quảng cáo lớn

Honize cung cấp gói tối ưu từ cơ bản đến nâng cao: cache, WebP, Core Web Vitals, cleanup WordPress.

## Kết luận

Core Web Vitals không phải “chỉ số cho dân IT” — chúng phản ánh trải nghiệm khách hàng thực tế. Website thiết kế đẹp **phải nhanh** mới hoàn thiện. Ưu tiên theo thứ tự:

1. Nén và tối ưu **ảnh hero** (LCP)
2. Khai báo **kích thước media** (CLS)
3. Giảm và defer **JavaScript** (INP)

Đo lại sau mỗi thay đổi lớn. Mục tiêu: **xanh cả 3 chỉ số** trên PageSpeed Insights mobile.

---

*[Xem gói tối ưu & tăng tốc website](/thiet-ke) — cải thiện PageSpeed từ 80 điểm trở lên.*
