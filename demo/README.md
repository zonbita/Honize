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
| `can-ho-cao-cap` | can-ho-cao-cap, showroom-noi-that | 04.jpg the origami |
| `trung-tam-dao-tao` | trung-tam-dao-tao, cafe-specialty | 05.jpg SCHOOL |
| `spa-wellness` | spa-wellness, cua-hang-dien-tu | 06.jpg Travel Agency |
| `tu-van-du-hoc` | tu-van-du-hoc, du-an-dat-nen | 07.jpg Digit. |
| `tour-da-nang` | tour-da-nang | 08-1.jpg furniture |
| `giai-phap-so` | giai-phap-so | achi.jpg Larson |
| `corporate-landing` | corporate-landing | exterior.jpg LaCasa |
| `vivu` | vivu | Vivu/ Design.MD travel landing |
| `aurelia-estates` | aurelia-estates | House/Design.MD Aurelia Estates |

**Cursor checklist (chỉ Aurelia):** `public/demo/aurelia/manifest.json` + `CURSOR.md` + `node public/demo/aurelia/audit.mjs`

Slug trùng ảnh mockup dùng chung template (alias trong `AppService.resolveDemoTemplateSlug`).
