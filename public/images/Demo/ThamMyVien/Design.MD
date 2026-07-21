GENERAL STYLE
Create a premium aesthetic skincare clinic website with a warm white, ivory, and champagne-gold visual identity.

The interface must feel:
- Luxurious
- Minimal
- Clean
- Professional
- Trustworthy
- Soft and elegant
- Similar to a high-end Korean skincare clinic
- Wellness-oriented, not surgical or hospital-like

Do not use:
- Bright pink
- Neon colors
- Strong gradients
- Excessive glassmorphism
- Large border radius
- Excessive pill-shaped elements
- Heavy dark shadows
- Crowded content
- Medical needles or surgical imagery

COLOR SYSTEM
Use CSS variables:

:root {
  --color-background: #fffdf9;
  --color-background-soft: #fbf8f1;
  --color-background-warm: #f6efe5;
  --color-surface: #ffffff;
  --color-surface-gold: #f5ead8;

  --color-primary: #b98a4e;
  --color-primary-light: #d8b77e;
  --color-primary-dark: #8b6336;
  --color-champagne: #c9a46a;

  --color-text: #201b17;
  --color-text-secondary: #786c60;
  --color-text-muted: #a29587;

  --color-border: rgba(185, 138, 78, 0.20);
  --color-border-light: rgba(120, 108, 96, 0.12);

  --shadow-soft: 0 12px 40px rgba(92, 68, 40, 0.08);
  --shadow-card: 0 8px 28px rgba(86, 65, 42, 0.07);
}

TYPOGRAPHY
Use:
- Heading font: "Cormorant Garamond", serif
- Body font: "Be Vietnam Pro", sans-serif

Typography:
- Hero heading: 68px, line-height 1.06, font-weight 500
- Section heading: 46px, line-height 1.15, font-weight 500
- Card heading: 22px, line-height 1.25
- Body text: 15–16px, line-height 1.7
- Small label: 12px, uppercase, letter-spacing 0.14em
- Navigation: 14px, font-weight 500

On mobile:
- Hero heading: 42px
- Section heading: 32px
- Card heading: 20px

GLOBAL LAYOUT
- Maximum content width: 1440px
- Desktop horizontal padding: 64px
- Tablet horizontal padding: 32px
- Mobile horizontal padding: 20px
- Section vertical padding: 104px desktop
- Section vertical padding: 72px tablet
- Section vertical padding: 56px mobile
- Use an 8px spacing system
- Major content gap: 48–72px
- Card gap: 24px
- Card border radius: 4–8px only
- Button border radius: 4px
- Image border radius: 4px
- Do not create strongly rounded cards

PAGE STRUCTURE

1. HEADER
Create a transparent header positioned over the hero section.

Desktop:
- Height: 88px
- Maximum width: 1440px
- Left: clinic logo
- Center: navigation
- Right: consultation button

Navigation items:
- Trang chủ
- Giới thiệu
- Dịch vụ
- Công nghệ
- Kiến thức
- Liên hệ

Logo:
- Minimal champagne-gold line icon
- Clinic name beside the icon
- Small uppercase subtitle beneath the name

Consultation button:
- Height: 44px
- Horizontal padding: 22px
- Champagne-gold background
- White text
- Subtle gold shadow
- Label: “Đặt lịch tư vấn”

Sticky behavior:
- When scrolling, change header to warm white with slight backdrop blur
- Add a subtle bottom border
- Keep header height around 72px after scrolling

Mobile:
- Logo on the left
- Menu icon on the right
- Open a full-width dropdown navigation panel
- Keep the consultation button inside the mobile menu

2. HERO SECTION
Height:
- Desktop: approximately 780px
- Tablet: 680px
- Mobile: auto, minimum 760px

Layout:
- Two columns
- Left content width: 44%
- Right visual width: 56%
- Content vertically centered
- Header overlays the top

Background:
- Use the supplied ivory and champagne 3D background image
- Background size: cover
- Background position: center
- Add a light ivory overlay if required for text readability

Left content:
Small label:
“CHĂM SÓC DA CHUYÊN SÂU”

Main heading:
“Làn da khỏe đẹp
từ sự tinh tế
& thấu hiểu”

Highlight selected words using champagne gold.

Description:
“Cá nhân hóa giải pháp chăm sóc da chuẩn y khoa — an toàn, tinh tế và hướng đến hiệu quả bền vững.”

Actions:
- Primary button: “Đặt lịch tư vấn”
- Secondary text button with circular play icon: “Khám phá dịch vụ”

Hero visual:
- Place the supplied adult female skincare portrait on the right
- The portrait should blend naturally with the ivory background
- Add subtle decorative champagne rings, translucent glass petals, and pearls
- Do not place the portrait inside a card
- Do not add border radius to the main hero image

Mobile:
- Text first
- Portrait below
- Center-align text
- Stack buttons vertically or wrap them
- Preserve generous whitespace

3. TRUST METRICS
Position the metrics panel so it slightly overlaps the bottom of the hero.

Container:
- Width: calc(100% - 128px)
- Maximum width: 1340px
- Minimum height: 124px
- White or warm-white background
- Border: 1px solid the gold border color
- Shadow: soft
- Border radius: 6px
- Four equal columns

Metrics:
- “15.000+” — Khách hàng tin tưởng
- “98%” — Khách hàng hài lòng
- “100%” — Quy trình an toàn
- “8+ năm” — Kinh nghiệm chuyên môn

Each metric:
- Gold Lucide icon
- Large gold number
- Small muted description
- Vertical separators between desktop items

Mobile:
- Two-column grid
- Remove vertical separators
- Use subtle internal borders

4. FEATURED SERVICES
Background: warm white.

Header:
Small label:
“DỊCH VỤ NỔI BẬT”

Heading:
“Chăm sóc làn da theo cách riêng của bạn”

Add a small gold line under the heading.

Create four service cards:
1. Chăm sóc da cá nhân hóa
2. Trẻ hóa & phục hồi
3. Dưỡng sáng & đều màu da
4. Cấp ẩm & cân bằng da

Card dimensions:
- Desktop width: approximately 300px
- Image height: 270px
- Content padding: 24px
- Minimum total height: 470px

Card style:
- White background
- 1px subtle border
- 6px radius
- Very soft shadow
- No floating glass effects
- Image at the top
- Title below
- Two-line description
- Gold text link: “Tìm hiểu thêm →”

Hover:
- Translate upward 4px
- Slightly stronger shadow
- Border becomes champagne gold
- Image scales to 1.03
- Transition: 300ms ease

Use appropriate supplied images for the service cards. All images must use:
- object-fit: cover
- consistent crop
- no text embedded inside the image

5. TECHNOLOGY SECTION
Use a 50/50 split layout.

Left:
- Warm ivory content area
- Maximum text width: 560px
- Vertical center alignment

Small label:
“CÔNG NGHỆ & TIÊU CHUẨN”

Heading:
“Công nghệ hiện đại
Chuẩn mực an toàn”

Description:
“Ứng dụng công nghệ tiên tiến kết hợp cùng quy trình chuẩn hóa, mang đến trải nghiệm chăm sóc tối ưu trong không gian tinh tế.”

Three horizontal benefit items:
- Công nghệ tiên tiến
- Quy trình chuẩn y khoa
- Sản phẩm cao cấp

Use gold outline icons.

Button:
“Khám phá công nghệ”

Right:
- Use the supplied clinic interior image
- Full section height
- No card wrapper
- No border radius
- object-fit: cover
- Minimum desktop height: 600px

On mobile:
- Content first
- Image second
- Image height: 380px

6. CUSTOMER JOURNEY
Background: white.

Small label:
“HÀNH TRÌNH TRẢI NGHIỆM”

Heading:
“5 bước cho làn da khỏe đẹp bền vững”

Show five process cards in one desktop row:

1. Thăm khám & phân tích da
2. Tư vấn & thiết kế phác đồ cá nhân hóa
3. Chăm sóc chuyên sâu
4. Hướng dẫn chăm sóc tại nhà
5. Theo dõi & đánh giá định kỳ

Process card:
- Width: 220–240px
- Height: 220px
- Border: 1px solid gold border
- Background: white
- Radius: 6px
- Centered content
- Gold outline icon at top
- Step number
- Title
- Small description

Add small gold arrow icons between cards on desktop.

Responsive:
- Tablet: horizontal scroll or 3-column layout
- Mobile: vertical timeline
- On mobile, replace horizontal arrows with a thin vertical gold connector

7. TESTIMONIALS
Background:
- Use a light ivory decorative section background
- Add subtle pearl and glass-petal decorations at the left and right edges

Heading:
“Khách hàng nói gì về chúng tôi”

Create three testimonial cards:
- White translucent surface
- Subtle border
- 6px radius
- Padding: 28px
- Quote icon in champagne gold
- 3–4 lines of feedback
- Small circular adult customer avatar
- Customer name
- Label: “Khách hàng”

Use realistic Vietnamese sample names:
- Nguyễn Hoài An
- Lê Minh Châu
- Trần Thu Thảo

Add three small slider dots below the cards.
Only the active dot uses champagne gold.

8. BOOKING CTA
Container:
- Maximum width: 1340px
- Height: approximately 420px
- Margin-top: 80px
- Full rectangular banner with 6px radius
- Overflow hidden

Background:
- Use the ivory silk and champagne 3D asset
- Use the supplied cosmetic serum asset on the right
- Add a soft ivory overlay behind the text on the left

Left content:
Heading:
“Đặt lịch tư vấn”

Subtitle:
“Trải nghiệm cá nhân hóa dành riêng cho bạn”

Checklist:
- Thăm khám chuyên sâu
- Tư vấn giải pháp phù hợp
- Trải nghiệm không gian chuẩn 5 sao

Actions:
- Primary button: “Đặt lịch ngay”
- Phone information beside the button
- Number: “1900 1234”
- Schedule: “08:30 – 20:00 | T2 – CN”

Right:
- Product bottles placed on champagne circular platforms
- Decorative translucent flower and pearls
- No card surrounding the product image

Mobile:
- Height: auto
- Content above product
- Center product at the bottom
- Maintain readable contrast

9. FOOTER
Background: #fffdf9
Top border: subtle gold border
Padding:
- Top: 72px
- Bottom: 24px

Create five columns:
1. Logo and clinic description
2. Về chúng tôi
3. Dịch vụ
4. Kiến thức
5. Liên hệ

Contact sample:
- 123 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh
- info@clinic.vn
- 1900 1234

Include social icons:
- Facebook
- Instagram
- YouTube

Bottom row:
- Copyright on the left
- Privacy policy and terms on the right

RESPONSIVE BREAKPOINTS
Use:
- Mobile: below 640px
- Tablet: 640px–1023px
- Desktop: 1024px and above
- Large desktop content must stop expanding after 1440px

DESKTOP GRID
Use a 12-column grid:
- Content width: 1440px
- Column gap: 24px
- Hero text: columns 1–5
- Hero visual: columns 6–12
- Technology content: columns 1–6
- Technology image: columns 7–12

ANIMATIONS
Use subtle motion only:
- Fade-up sections when entering viewport
- Duration: 600ms
- Translate distance: 20px
- Stagger service cards by 80ms
- Button hover: slight lift and shadow
- Decorative 3D objects may have a very slow floating movement of 4–6px
- Respect prefers-reduced-motion

ACCESSIBILITY
- Use proper heading hierarchy
- Add descriptive alt text
- All buttons must be keyboard accessible
- Visible focus states
- Minimum text contrast ratio of 4.5:1
- Do not place important text directly over busy image areas
- Use aria-label for icon-only buttons
