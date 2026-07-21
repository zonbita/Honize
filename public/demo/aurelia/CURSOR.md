# Aurelia Estates — Cursor feature checklist

Tài liệu này dành cho **Cursor Agent** khi implement tính năng demo `aurelia-estates`. Không hiển thị cho người xem demo.

## File liên quan

| File | Vai trò |
|------|---------|
| `manifest.json` | Danh sách tính năng + trạng thái `pending` / `live` |
| `audit.mjs` | Script audit — chạy trong terminal |
| `views/demo/pages/aurelia-estates.hbs` | Template HTML |
| `public/demo/aurelia-estates.css` | Styles |
| `public/images/Demo/House/Design.MD` | Design spec |

## Quy ước

- Thành phần **chưa có logic**: có `data-demo-id`, **không** có `data-demo-live`
- Thành phần **đã xong**: thêm `data-demo-live` (trên element hoặc wrapper cha)
- Sau khi implement: đổi `status` trong `manifest.json` từ `pending` → `live`

## Workflow cho Cursor

1. Đọc `manifest.json` — lọc `status: "pending"`
2. Đọc `Design.MD` nếu cần chi tiết UI/UX
3. Implement logic trong `aurelia-estates.hbs` + `aurelia-estates.js` (khi cần JS)
4. Gắn `data-demo-live` cho phần đã xong
5. Cập nhật `manifest.json`
6. Chạy audit:

```bash
node public/demo/aurelia/audit.mjs
```

## Cycle (thứ tự ưu tiên implement)

Field `cycle` trong `manifest.json` là thứ tự gợi ý Cursor làm từng tính năng:

1. Search tabs (MUA / THUÊ / DỰ ÁN)
2. Bộ lọc (select + input)
3. Nút TÌM KIẾM
4. Yêu thích property cards
5. XEM TẤT CẢ

## Thiếu so với Design.MD

- Testimonial carousel prev/next — chưa có trong template (`testimonials-prev`, `testimonials-next` trong manifest)
- Navbar overlay hero (transparent trên ảnh) — chỉ CSS, chưa cần JS

## Lệnh audit

```bash
node public/demo/aurelia/audit.mjs
```

Output: bảng pending/live, selector thiếu trong template, manifest chưa khớp `data-demo-live`.
