# ÉLARA — Design Spec (Thời trang)

Reference layout: [YaMe.vn](https://yame.vn/) (hero banner, category strip, e-commerce structure)  
Product grid: [Elise phụ kiện](https://elise.vn/phu-kien) (4 cột, SALE badge, giá gốc gạch ngang)  
Demo: `/du-an/demo/shop-thoi-trang`  
Styles: `public/demo/shop-thoi-trang.css`  
View: `views/demo/pages/shop-thoi-trang.hbs`  
Data: `src/app.service.ts` → `getDemoProducts('shop-thoi-trang')`

---

## Assets (`public/images/ThoiTrang/`)

| File | Loại | Usage |
|------|------|-------|
| `01-hero-bg.png` | Background | Hero full-bleed |
| `02-hero-model.png` | Minh họa (cutout) | Hero model bên phải |
| `03-category-ao.png` | Minh họa | Category card Áo |
| `04-category-vay.png` | Minh họa | Category card Váy |
| `05-category-quan.png` | Minh họa | Category card Quần |
| `06-category-phukien.png` | Minh họa | Category card Phụ kiện |
| `07-product-tui-xach.png` | Sản phẩm | Grid item 1 |
| `08-product-vay-midi.png` | Sản phẩm | Grid item 2 |
| `09-product-ao-so-mi.png` | Sản phẩm | Grid item 3 |
| `10-product-quan-ong-rong.png` | Sản phẩm | Grid item 4 |
| `11-collection-banner-bg.png` | Background | Collection banner |
| `12-newsletter-bg.png` | Background | Newsletter section |
| `13-3d-handbag.png` | 3D | Hero + newsletter decor |
| `14-3d-sunglasses.png` | 3D | Hero decor |
| `15-3d-heels.png` | 3D | Collection banner decor |
| `16-lifestyle-editorial.png` | Minh họa | About / editorial |

| `17-product-ao-linen.png` | Sản phẩm | Section Áo |
| `18-product-vay-den.png` | Sản phẩm | Section Váy |
| `19-product-quan-jeans.png` | Sản phẩm | Section Quần |
| `20-product-tui-kem.png` | Sản phẩm | Section Phụ kiện |
| `21-product-ao-polo.png` | Sản phẩm | Section Áo |
| `22-product-vay-hoa.png` | Sản phẩm | Section Váy |

### YaMe category blocks (`collections`)

Mỗi section: tiêu đề lớn + tagline + chip lọc + grid 4 SP (Elise) + “XEM TẤT CẢ …”

1. **ÁO LINEN & COTTON** (`#ao`)
2. **VÁY MÙA HÈ** (`#vay`)
3. **QUẦN DÀI KHOE DÁNG** (`#quan`)
4. **PHỤ KIỆN THỜI TRANG** (`#phukien`)

Data: `getDemoCollections('shop-thoi-trang')` in `app.service.ts`.

Tất cả ảnh: không chữ, không logo, góc vuông, tông cream/beige đồng nhất.

---

## Color system

```css
--el-ink: #1a1a1a;
--el-cream: #faf7f2;
--el-beige: #e8e0d5;
--el-red: #c0392b;   /* SALE badge */
```

---

## Sections

1. Promo bar — khuyến mãi đen
2. Header sticky — logo ÉLARA, nav, cart
3. Hero — bg `01` + model `02` + 3D `13`/`14`
4. Categories — 4 card ảnh `03–06`
5. Products — grid 4 cột Elise style, filter tabs
6. Collection — banner `11` + 3D heels `15`
7. About — lifestyle `16`
8. Newsletter — bg `12` + 3D bag `13`
9. Footer
