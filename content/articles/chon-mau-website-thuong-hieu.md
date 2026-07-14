# Cách chọn bảng màu website theo thương hiệu

Màu sắc là yếu tố đầu tiên khách hàng cảm nhận — trước cả khi đọc tiêu đề hay xem ảnh sản phẩm. Một bảng màu website được chọn đúng sẽ tăng nhận diện thương hiệu, tạo cảm giác tin cậy và giúp người dùng dễ đọc, dễ hành động. Bài viết hướng dẫn xây palette **ivory – navy – gold** phổ biến trên website dịch vụ cao cấp tại Việt Nam, kèm quy tắc contrast và triển khai kỹ thuật bằng CSS variables.

## Tại sao màu sắc quan trọng với website?

- **Cảm xúc thương hiệu:** Vàng gold → sang trọng; xanh navy → tin cậy; trắng kem → sạch, premium.
- **Khả năng đọc:** Contrast đủ cao giữa chữ và nền — quyết định thời gian ở lại trang.
- **Nhất quán đa kênh:** Website, name card, Facebook, slide pitch dùng cùng palette → dễ nhớ.
- **Chuyển đổi:** CTA màu nổi bật trên nền trung tính → tỷ lệ click cao hơn.

Theo nhiều nghiên cứu marketing, **màu sắc có thể tăng nhận diện thương hiệu tới 80%** nếu áp dụng nhất quán.

## Quy tắc 60 – 30 – 10

Đây là công thức phân bổ màu cân bằng, tránh rối mắt:

| Tỷ lệ | Vai trò | Gợi ý cho web premium |
|-------|---------|------------------------|
| **60%** | Màu nền chủ đạo | Ivory `#f7f4ef`, `#fdfaf3`, trắng kem |
| **30%** | Màu phụ / text | Navy `#0f172a`, slate `#334155`, `#475569` |
| **10%** | Màu nhấn | Gold champagne `#d4af37`, `#e8c547` |

### Áp dụng thực tế

- **60%:** Background body, section phụ, card nền sáng.
- **30%:** Heading, paragraph, footer nền tối (nếu có), icon line.
- **10%:** Tiêu đề highlight, nút CTA, đường cong trang trí, badge “Phổ biến”.

Không dùng gold cho 30% diện tích — sẽ loè và mất cảm giác cao cấp.

## Xây palette từ logo & brand guideline

Nếu doanh nghiệp đã có logo:

1. **Lấy màu dominant** từ logo (thường 1–2 màu).
2. Chọn **màu nền trung tính** bổ trợ (không cạnh tranh logo).
3. Thêm **màu accent** cho CTA — có thể là màu phụ logo hoặc gold/hồng/cam tùy ngành.
4. Định nghĩa **shade** cho hover/active (đậm hơn 10–15%).

### Ví dụ: thương hiệu thiết kế web

```
--bg-ivory:     #f7f4ef;
--bg-white:     #ffffff;
--ink-primary:  #0f172a;
--ink-muted:    #64748b;
--gold-light:   #fff8dc;
--gold-mid:     #e8c547;
--gold-dark:    #927d45;
--border-gold:  rgba(212, 175, 55, 0.28);
```

## Contrast & accessibility (WCAG)

Website doanh nghiệp nên đạt **WCAG AA** tối thiểu:

- Text thường (< 18px): contrast **≥ 4.5:1** với nền.
- Text lớn (≥ 18px bold hoặc ≥ 24px): **≥ 3:1**.
- CTA button: text trên nền gold cần đủ tối — dùng `#0a0a0c` thay vì xám nhạt.

### Công cụ kiểm tra

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → CSS overview → contrast issues
- Plugin Figma: Stark, A11y

### Lỗi hay gặp với gold

| Lỗi | Hậu quả | Sửa |
|-----|---------|-----|
| Gold gradient làm body text | Khó đọc | Gold chỉ cho H1 ngắn, icon |
| Gold nhạt trên nền trắng | Contrast fail | Dùng gold đậm hơn hoặc navy text |
| Link màu gold không gạch chân | Khó phân biệt | Underline hover hoặc đậm hơn |

## Màu sắc theo ngành nghề

| Ngành | Palette gợi ý | Tránh |
|-------|---------------|-------|
| Luật, tài chính | Navy, xám, gold nhẹ | Neon, gradient tím |
| Spa, beauty | Kem, hồng dust, gold | Đỏ gắt |
| Công nghệ | Slate, xanh đen, accent xanh/cyan | Quá nhiều màu |
| F&B | Ấm, nâu, xanh lá | Tối quá, mất cảm giác appetizing |
| BĐS cao cấp | Navy, gold, trắng | Cam cheap |

Palette không bắt buộc theo ngành — nhưng **phù hợp kỳ vọng khách hàng** giúp tăng trust nhanh hơn.

## Triển khai bằng CSS variables (design tokens)

Định nghĩa token một lần, dùng toàn site:

```css
:root {
  --color-bg: #f7f4ef;
  --color-surface: #ffffff;
  --color-text: #334155;
  --color-heading: #0f172a;
  --color-accent: #d4af37;
  --color-accent-hover: #e8c547;
  --gradient-gold: linear-gradient(
    180deg,
    #fff8dc,
    #ffe082 12%,
    #f5d76e 28%,
    #e8c547 48%,
    #e8c03f 68%,
    #e4b84b 88%,
    #927d45
  );
}
```

Tailwind: map token trong `tailwind.config.js` under `theme.extend.colors`.

### Lợi ích token

- Đổi brand một chỗ → cả site cập nhật.
- Dark mode (nếu sau này): swap token under `[data-theme="dark"]`.
- Designer–dev handoff rõ ràng.

## Dark section vs light section

Website premium thường xen kẽ:

- Section sáng (ivory) — dịch vụ, giới thiệu
- Section tối (navy/charcoal) — bảng giá, footer, CTA cuối

Khi chuyển nền tối:

- Body text → `#e2e8f0` hoặc `#cbd5e1`
- Gold accent → sáng hơn một chút (`#f5d76e`) để đủ contrast
- Border → `rgba(255, 184, 77, 0.22)` thay vì border xám

## Test màu trên thiết bị thật

Màu trên monitor calibrate khác với iPhone ngoài trời:

- Test ngoài nắng — gold có bị chói không?
- Test dark mode OS — site có force light only không?
- In PDF báo giá — logo và màu có khớp web không?

## Checklist chọn màu website

- [ ] Xác định 1 màu chính + 1 accent + nền trung tính
- [ ] Áp dụng 60–30–10
- [ ] Kiểm tra WCAG AA cho text chính
- [ ] Gold không dùng cho paragraph dài
- [ ] CSS variables / Tailwind config
- [ ] Document palette cho team (Figma / Notion)
- [ ] Preview trên mobile thật

## Kết luận

Bảng màu website không phải “chọn màu đẹp mắt” — mà là **công cụ truyền tải thương hiệu và hỗ trợ đọc hiểu**. Palette ivory – navy – gold phù hợp doanh nghiệp muốn cảm giác sang trọng, chuyên nghiệp. Bắt đầu từ logo và guideline, áp dụng 60–30–10, kiểm tra contrast, rồi cố định bằng design token để scale lâu dài.

---

*Honize thiết kế website đồng bộ màu thương hiệu từ logo đến UI. [Xem mẫu dự án](/du-an) hoặc [liên hệ thiết kế](/#contact).*
