# Content — Articles Storage

Bài viết lưu dạng **JSON + Markdown**, không cần database.

## Cấu trúc

```
content/articles/
  {slug}.json    → metadata (title, status, SEO, views...)
  {slug}.md      → nội dung bài viết (Markdown)
```

## API (yêu cầu đăng nhập dashboard)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/articles` | Danh sách tất cả bài |
| GET | `/api/articles/:slug` | Chi tiết + content |
| POST | `/api/articles` | Tạo bài (JSON body) |
| PUT | `/api/articles/:slug` | Cập nhật |
| DELETE | `/api/articles/:slug` | Xóa vĩnh viễn |

Public chỉ xem qua HTML: `/blog`, `/blog/:slug` — không mở raw JSON.

## Dashboard

- `/dashboard` — danh sách (đọc từ file)
- `/dashboard/articles/new` — form tạo bài
- `/dashboard/articles/:slug/edit` — form sửa

## Public

- `/blog/:slug` — xem bài viết
