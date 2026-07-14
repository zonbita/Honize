# Tối ưu tốc độ website với Core Web Vitals

Một giao diện premium sẽ kém hiệu quả nếu tải chậm. Core Web Vitals đo trải nghiệm thực tế của người dùng.

## LCP — nội dung lớn nhất

Tối ưu ảnh hero, font và server. Mục tiêu dưới **2.5s**.

## INP — phản hồi tương tác

Giảm JavaScript nặng, trì hoãn script không cần thiết, tránh block main thread.

## CLS — ổn định bố cục

Luôn reserv kích thước ảnh/video/embed để trang không “nhảy” khi tải.

## Checklist nhanh

- WebP/AVIF + lazy load
- Critical CSS gọn
- CDN / caching
- Đo bằng PageSpeed Insights trên mobile
