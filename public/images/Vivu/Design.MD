2. General visual style

Build a premium, bright and minimal travel website.

The main visual direction is:

Neutral ocean blue.
Muted teal.
Sage leaf green.
White and very pale blue-gray backgrounds.
Soft glassmorphism.
Subtle aqua light trails.
Natural travel photography.
Clean and spacious layout.
Avoid excessive gold, orange, neon turquoise or dark navy backgrounds.

Use a maximum content width of 1280px.

:root {
  --primary-900: #123f4a;
  --primary-800: #185666;
  --primary-700: #236f80;
  --primary-600: #31899a;
  --primary-500: #55a4ae;

  --sage-700: #547463;
  --sage-600: #718d78;
  --sage-500: #8fa592;
  --sage-100: #e8f0eb;

  --background: #ffffff;
  --background-soft: #f6f9f8;
  --background-blue: #f1f7f8;

  --text-primary: #103844;
  --text-secondary: #637477;
  --border: #dce7e5;
  --white: #ffffff;
}

Typography:

font-family: "Be Vietnam Pro", "Inter", sans-serif;

Heading font weights:

Hero heading: 700.
Section headings: 600–700.
Card headings: 600.
Body content: 400.
Buttons: 600.

Global page background:

background:
  radial-gradient(
    circle at 90% 10%,
    rgba(111, 170, 177, 0.12),
    transparent 32%
  ),
  linear-gradient(180deg, #ffffff 0%, #f9fbfa 100%);
3. Header

Create a fixed or sticky header with:

Height: 76px.
White translucent background.
backdrop-filter: blur(18px).
Very subtle bottom border.
Horizontal padding: clamp(24px, 5vw, 72px).

Left:

Logo with a compass symbol.
Brand name: VIVU.
Logo color: deep ocean blue.

Center navigation:

Trang chủ
Điểm đến
Tour du lịch
Trải nghiệm
Cẩm nang
Liên hệ

Active item:

Ocean-blue text.
2px underline.
Underline width around 32px.

Right:

Globe icon.
Language selector: VN.
Primary button: Đặt tour.

Button:

height: 42px;
padding: 0 22px;
border-radius: 8px;
color: white;
background: linear-gradient(135deg, #3e8794, #176678);
box-shadow: 0 8px 20px rgba(31, 107, 123, 0.2);
4. Hero section

Desktop height: approximately 650px.

Create a two-column layout:

grid-template-columns: 38% 62%;
gap: 48px;
align-items: center;
Left content

Small label:

KHÁM PHÁ VIỆT NAM THEO CÁCH CỦA BẠN

Label style:

Pale sage background.
Deep green text.
Capsule shape.
Font size: 12px.
Padding: 7px 14px.

Hero heading:

Chạm vào vẻ đẹp Việt Nam

Style:

Font size: clamp(46px, 5vw, 70px).
Line height: 1.08.
Deep blue-green.
Maximum width: 550px.

Description:

Hành trình được thiết kế tinh tế, đưa bạn đến những miền đất đẹp nhất và trải nghiệm văn hóa bản địa chân thực.

Use two CTA buttons:

Khám phá tour with arrow icon.
Xem hành trình with circular play icon.

Below the buttons:

Four overlapping traveler avatars.
Text: 10.000+ du khách đã đồng hành.
Make 10.000+ ocean blue and semibold.
Right hero visual

Display a large Hạ Long Bay image.

The visual container should have:

position: relative;
aspect-ratio: 1.45 / 1;
border-radius: 56px 56px 42px 42px;
overflow: hidden;
border: 1px solid rgba(180, 211, 211, 0.7);
box-shadow: 0 30px 70px rgba(20, 72, 79, 0.14);

Create a glass-like outer frame using pseudo-elements.

Add a white pearl platform underneath the image:

Three soft elliptical layers.
White and silver surface.
Thin muted teal edge.
Soft shadow under the platform.

Place three floating destination cards on the right:

Hạ Long — Quảng Ninh.
Hội An — Quảng Nam.
Phú Quốc — Kiên Giang.

Floating card dimensions:

width: 170px;
min-height: 72px;
padding: 10px;
border-radius: 14px;
background: rgba(255,255,255,0.92);
backdrop-filter: blur(14px);
box-shadow: 0 12px 30px rgba(18,63,74,0.14);

Each card contains:

Small thumbnail.
Destination name.
Map pin icon.
Province name.

Add subtle decorative glass spheres and seafoam-colored light ribbons. Keep them behind the content and do not reduce readability.

5. Featured destinations

Section padding:

padding: 72px 0 90px;

Centered label:

ĐIỂM ĐẾN NỔI BẬT

Heading:

Việt Nam – Mỗi điểm đến, một câu chuyện

Desktop layout:

grid-template-columns: repeat(6, 1fr);
gap: 16px;

Destination cards:

Hạ Long.
Đà Nẵng.
Hội An.
Đà Lạt.
Phú Quốc.
Sa Pa.

Each card:

height: 365px;
border-radius: 18px;
overflow: hidden;
background: white;
border: 1px solid #dce7e5;
box-shadow: 0 12px 28px rgba(25, 63, 68, 0.08);

Image area:

Approximately 280px high.
object-fit: cover.

Information area:

White background.
Centered destination icon.
Destination name.
Height around 85px.

Hover effect:

transform: translateY(-6px);
box-shadow: 0 20px 42px rgba(25, 63, 68, 0.14);

The image should scale slightly on hover.

6. Benefits section

Create a two-column layout:

grid-template-columns: 36% 64%;
gap: 70px;
align-items: center;

Heading:

Hành trình trọn vẹn –
Trải nghiệm khác biệt

Benefit list:

Lịch trình được cá nhân hóa.
Hướng dẫn viên chuyên nghiệp.
Dịch vụ chọn lọc.
Hỗ trợ xuyên suốt hành trình.

Each row contains:

Circular line icon.
Benefit title.
Short description.
Subtle bottom divider.

Use sage green and muted teal for icons.

Right side:

Large image of a traveling couple looking at the coastline.
Aspect ratio: 16 / 10.
Border radius: 22px.
Use object-fit: cover.
Add a subtle translucent aqua light curve near the lower-right corner.
7. Statistics and testimonial

Create one large white card:

display: grid;
grid-template-columns: 48% 52%;
padding: 26px 30px;
border-radius: 20px;
border: 1px solid #dce7e5;
box-shadow: 0 14px 38px rgba(25, 63, 68, 0.08);

Left side contains three statistics:

500+ Hành trình
50+ Điểm đến
98% Khách hàng hài lòng

Each statistic:

Large circular icon.
Number size: 42px.
Deep blue-green text.
Vertical dividers between items.

Right testimonial:

Very pale sage/blue background.
Large quotation icon.
Review text.
Customer avatar.
Name: Nguyễn Minh Châu.
Location: Hà Nội.
Four carousel indicators.
8. Popular tour section

Two-column layout.

Left:

Tour được
yêu thích nhất

Add button:

Xem tất cả tour

Right:

Use the transparent travel suitcase image.
Place it on a white circular platform.
Show miniature Hạ Long scenery inside the suitcase.
Include an airplane and small sailboats.
Add floating compass, location and camera icons.
Add subtle pale aqua light trails behind the graphic.

Section minimum height: 330px.

Do not use strong glow effects.

9. Newsletter section

Create a wide newsletter card positioned above the footer.

display: grid;
grid-template-columns: auto 1fr minmax(360px, 480px);
align-items: center;
gap: 24px;
padding: 24px 32px;
border-radius: 18px;
background: white;
border: 1px solid #dce7e5;
box-shadow: 0 14px 34px rgba(25, 63, 68, 0.08);

Left:

Circular mail icon with pale sage background.

Content:

Nhận cảm hứng cho chuyến đi tiếp theo
Đăng ký nhận ưu đãi độc quyền và gợi ý hành trình mới nhất.

Right:

Email input with placeholder Nhập email của bạn.
Button Đăng ký.

Validate email before submission.

10. Footer

Create a five-column footer:

Brand information.
Khám phá.
Về VIVU.
Hỗ trợ.
Liên hệ.

Brand description:

VIVU mang đến những hành trình tinh tế, đưa bạn khám phá vẻ đẹp Việt Nam và trải nghiệm văn hóa bản địa chân thực.

Footer links:

Khám phá
- Điểm đến
- Tour du lịch
- Trải nghiệm
- Khuyến mãi
- Cẩm nang du lịch

Về VIVU
- Giới thiệu
- Cam kết chất lượng
- Tin tức
- Tuyển dụng
- Đối tác

Hỗ trợ
- Câu hỏi thường gặp
- Chính sách đặt tour
- Điều khoản sử dụng
- Chính sách bảo mật

Contact information:

1900 1234
hello@vivu.vn
123 Đường Lê Lợi, Quận 1
TP. Hồ Chí Minh, Việt Nam

Add social media icons and copyright:

© 2026 VIVU. All rights reserved.

Add a circular back-to-top button in the bottom-right corner.

11. Responsive design

Desktop:

Maximum content width: 1280px.
Six destination columns.
Two-column hero and content sections.

Tablet below 1024px:

Hide the main navigation and display a menu button.
Hero becomes two stacked blocks.
Destination grid becomes three columns.
Benefit and tour sections become stacked.
Floating hero cards remain inside the image boundary.

Mobile below 640px:

Horizontal padding: 20px.
Hero heading: 42–48px.
Destination grid becomes a horizontal scroll carousel.
Statistics display vertically or in a two-column arrangement.
Newsletter elements stack vertically.
Footer becomes one or two columns.
Buttons use at least 44px height.
Do not allow horizontal page overflow.
12. Interactions

Implement:

Smooth scrolling navigation.
Sticky header with a soft shadow after scrolling.
Mobile navigation drawer.
Destination card hover effects.
Working testimonial carousel.
Email validation.
Scroll-to-top button.
Buttons with hover and focus states.
Respect prefers-reduced-motion.

Use subtle transitions:

transition: all 220ms ease;

Animations should be restrained:

Fade and move upward by 16px.
Duration between 500ms and 700ms.
Do not use excessive parallax or glowing animations.
13. Important constraints
Reproduce the reference layout closely.
Use the separated local background images in src/assets/images.
Do not place text directly inside image files.
Text, cards, buttons and icons must be real HTML elements.
Keep all Vietnamese text correctly accented.
Do not use placeholder image services.
Do not use excessive gold or orange.
Do not use a dark theme.
Avoid strong gradients and neon colors.
Keep the page accessible with readable contrast and keyboard focus states.
Use reusable components and map destination cards from a data array.
The final interface must look premium, calm, natural and production-ready.