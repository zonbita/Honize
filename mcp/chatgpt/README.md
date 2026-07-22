# Hướng dẫn MCP ChatGPT (riêng tư — chỉ để code Honize)

Kết nối **ChatGPT** với máy bạn qua MCP để đọc/sửa code repo Honize.  
Chỉ dùng **Developer Mode** — **không** publish thành App/Plugin công khai.

---

## Bạn cần có sẵn

- Node.js 18+
- Git
- Tài khoản ChatGPT (Plus/Pro hoặc gói có Developer Mode)
- PowerShell (Windows)

---

## Bước 1 — Chạy MCP trên máy

Mở PowerShell:

```powershell
cd c:\zzzzzzzzzzzzzzzzzzz\Honize\mcp\chatgpt
copy .env.example .env
.\start.ps1
```

Lần đầu script sẽ clone `chatgpt-local-coder` vào thư mục `.runtime/` (đã gitignore).

Khi chạy xong, server lắng nghe:

- MCP: `http://localhost:3000/mcp`
- Workspace: `C:\zzzzzzzzzzzzzzzzzzz\Honize`

**Giữ cửa sổ này mở** khi đang dùng ChatGPT.

---

## Bước 2 — Tạo đường hầm HTTPS

ChatGPT **không** gọi được `localhost` trực tiếp. Cần tunnel HTTPS. Chọn **một** cách:

### Cách A — OpenAI Secure Tunnel (khuyên dùng, URL ổn định)

1. Vào [OpenAI Platform → Tunnels](https://platform.openai.com/settings/organization/tunnels)
2. Tạo tunnel, lấy `tunnel_…` và Runtime API key
3. Điền vào file `.env`:

```env
OPENAI_TUNNEL_ID=tunnel_xxxxx
OPENAI_TUNNEL_API_KEY=xxxxx
```

4. Chạy script tunnel trong `.runtime` (nếu có `openai-tunnel.bat` / `.ps1`) theo README của chatgpt-local-coder

Trong ChatGPT: chọn **Connection type → Tunnel**, dán tunnel id.

### Cách B — Cloudflare (nhanh, URL đổi mỗi lần restart)

Terminal mới (giữ `start.ps1` vẫn chạy):

```powershell
winget install Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:3000
```

Copy URL dạng `https://xxxx.trycloudflare.com` rồi thêm `/mcp`:

`https://xxxx.trycloudflare.com/mcp`

---

## Bước 3 — Tạo connector trên ChatGPT (riêng tư)

1. Mở [ChatGPT](https://chatgpt.com) → **Cài đặt (Settings)**
2. **Apps & Connectors** (hoặc **Ứng dụng & Kết nối**)
3. Bật **Developer mode** / **Chế độ nhà phát triển**
4. Bấm **Create** / **Tạo** (không bấm Publish / Xuất bản)
5. Điền:

| Trường | Giá trị |
|--------|---------|
| **Tên** | `Honize Local Coder` |
| **Mô tả** | Copy từ `connector.example.json` → `description` |
| **URL** | URL HTTPS kết thúc bằng `/mcp` **hoặc** Tunnel id |
| **Xác thực** | **None** / Không |

6. Tạo xong → kiểm tra danh sách tools hiện ra

---

## Bước 4 — Dùng trong chat (bắt buộc gắn connector)

Mỗi cuộc chat **phải gắn connector**, nếu không ChatGPT sẽ không gọi MCP và có thể báo lỗi luồng tin nhắn.

Cách gắn:

1. Chat mới → nút **+** → **More** → bật **Honize Local Coder**, hoặc  
2. Gõ `@Honize Local Coder` rồi nhập yêu cầu

Ví dụ:

```text
@Honize Local Coder Đọc package.json và giải thích các script
@Honize Local Coder Sửa lỗi build NestJS
@Honize Local Coder Tìm mọi chỗ dùng nha-khoa.css
```

Sau khi restart server MCP:

1. **Refresh** connector trong Settings  
2. Mở **chat mới**  
3. Gắn lại `@Honize Local Coder`

---

## (Tuỳ chọn) MCP trong Cursor

Chỉ dùng trong Cursor (không liên quan ChatGPT web):

1. Copy file:

```powershell
copy c:\zzzzzzzzzzzzzzzzzzz\Honize\.cursor\mcp.json.example c:\zzzzzzzzzzzzzzzzzzz\Honize\.cursor\mcp.json
```

2. Mở Cursor → Settings → MCP → bật server `honize-filesystem`  
3. Restart Cursor nếu cần

---

## Bảo mật

- Chỉ dùng Developer Mode — **không** nộp lên store công khai
- Không chia sẻ URL tunnel hay `OPENAI_TUNNEL_API_KEY`
- File `.env`, `.runtime/` đã được gitignore
- Giữ `FULL_DISK_ACCESS=false` để ChatGPT chỉ làm việc trong repo Honize

---

## Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| “Đang tìm công cụ…” rồi lỗi luồng tin | Chưa gắn `@Honize Local Coder` — gắn rồi gửi lại |
| Connection failed | Kiểm tra `start.ps1` + tunnel còn chạy; URL phải HTTPS và có `/mcp` |
| Tools cũ / Resource not found | Refresh connector + chat mới |
| Cloudflare URL đổi | Cập nhật lại URL trong connector mỗi lần restart tunnel |
| Permission hỏi liên tục | Cấu hình quyền trong Settings → Apps; tránh bấm “Luôn cho phép” trên popup |

Chi tiết file cấu hình: `connector.example.json`, `.env.example`.
