# Demo giao diện

Thư mục chứa trang demo UI tương ứng danh sách dự án tại `/du-an`.

## URL

- Danh sách: `/du-an/demo`
- Chi tiết: `/du-an/demo/{slug}`

## Demo HTML (giống mockup)

Có file `views/demo/pages/{template}.hbs` + `public/demo/{template}.css` → render giao diện thật.

| Template | Dự án (slug) | Mockup |
|----------|--------------|--------|
| `shop-thoi-trang` | shop-thoi-trang, thiet-ke-ngoai-that | 02.jpg FastShop |
| `nha-hang-sai-gon` | nha-hang-sai-gon, cong-ty-kien-truc | 01.jpg Aroflit |
| `can-ho-cao-cap` | can-ho-cao-cap | 04.jpg the origami |
| `showroom-noi-that` | showroom-noi-that | 08-1.jpg furniture |
| `trung-tam-dao-tao` | trung-tam-dao-tao | 05.jpg SCHOOL |
| `cafe-specialty` | cafe-specialty | Cafe/ ORIA specialty coffee product landing |
| `spa-wellness` | spa-wellness | 06.jpg Travel Agency |
| `cua-hang-dien-tu` | cua-hang-dien-tu | DienTu/ VOLTIX electronics store |
| `tu-van-du-hoc` | tu-van-du-hoc, du-an-dat-nen | 07.jpg Digit. |
| `tour-da-nang` | tour-da-nang | 08-1.jpg furniture |
| `giai-phap-so` | giai-phap-so | achi.jpg Larson |
| `corporate-landing` | corporate-landing | exterior.jpg LaCasa |
| `vivu` | vivu | Vivu/ Design.MD travel landing |
| `aurelia-estates` | aurelia-estates | House/Design.MD Aurelia Estates |
| `tham-my-vien` | tham-my-vien | ThamMyVien/Design.MD Aesthetic Clinic (+ subpages: gioi-thieu, dich-vu, cong-nghe, kien-thuc, lien-he) |
| `nong-san` | nong-san | [Organico Home 1](http://123websitedemo.com/?id=14600) — thực phẩm nông nghiệp |

**Cursor checklist (chỉ Aurelia):** `public/demo/aurelia/manifest.json` + `CURSOR.md` + `node public/demo/aurelia/audit.mjs`

Slug trùng ảnh mockup dùng chung template (alias trong `AppService.resolveDemoTemplateSlug`).
