# Spec: Trang Sản phẩm mới nổi bật (/forum/new-products)

## 1. Tổng quan

Trang tổng hợp sản phẩm mới nhập từ **tất cả các kho hàng** đang vận hành trên hệ thống ERP. Hệ thống tự động phân tích và xếp hạng sản phẩm dựa trên tín hiệu thị trường (lượt quan tâm, tốc độ bán, độ mới) mà **không tiết lộ dữ liệu nhạy cảm** của từng kho (tồn kho chính xác, giá nhập).

**Mục tiêu:** Giúp các đại lý / chủ cửa hàng nhanh chóng phát hiện sản phẩm mới đáng chú ý để quyết định nhập hàng.

---

## 2. FE mong đợi từ API - JSON Response

Frontend gọi API và mong nhận đúng format JSON này:

```json
{
  "data": [
    {
      "id": "new-001",
      "image": "https://example.com/images/kova-ct11a.jpg",
      "title": "Son chong tham KOVA CT-11A Gold",
      "danhMuc": "Vat lieu xay dung",
      "khuVuc": "Ha Noi, TP.HCM",
      "nguonKho": "Kho Ha Noi",
      "ngayNhapKho": "2026-06-06",
      "giaBanSi": "850k - 950k",
      "tocDoBan": 4.5,
      "soShopQuanTam": 42,
      "diemHot": 95,
      "khuyenNghi": "Nhu cau cuc cao mua mua. Nen nhap 30-50 thung de du hang ban trong thang.",
      "tags": ["#son_chong_tham", "#kova", "#vat_lieu_xay_dung"]
    },
    {
      "id": "new-002",
      "image": "https://example.com/images/makita-dhp453.jpg",
      "title": "May khoan pin Makita 18V DHP453Z",
      "danhMuc": "Dung cu dien",
      "khuVuc": "Toan quoc",
      "nguonKho": "Kho TP.HCM",
      "ngayNhapKho": "2026-06-05",
      "giaBanSi": "3.200k - 3.450k",
      "tocDoBan": 3.8,
      "soShopQuanTam": 36,
      "diemHot": 88,
      "khuyenNghi": "Dong khoan pin ban chay nhat. Nen nhap them 10-15 may, gia dang co xu huong tang.",
      "tags": ["#may_khoan", "#makita", "#dung_cu_dien"]
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

---

## 3. API Endpoint

### `GET /api/forum/new-products`

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `sortBy` | string | - | `hot` | `hot` \| `new` \| `sales` |
| `khuVuc` | string | - | `Tất cả` | Lọc theo khu vực kho |
| `page` | number | - | `1` | Số trang |
| `limit` | number | - | `6` | Số sản phẩm / trang |

---

## 4. Data Model: NewProductItem

| Field | Type | Required | Mô tả | Nguồn dữ liệu |
|---|---|---|---|---|
| `id` | string | Yes | Mã định danh sản phẩm | `products.id` |
| `image` | string | Yes | URL ảnh sản phẩm | `products.image_url` |
| `title` | string | Yes | Tên sản phẩm | `products.name` |
| `danhMuc` | string | Yes | Danh mục. VD: "Vật liệu xây dựng" | `categories.name` |
| `khuVuc` | string | Yes | Các khu vực có kho đang giữ SP này, cách nhau bởi `, ` | Tổng hợp từ `warehouses.region` |
| `nguonKho` | string | Yes | Tên hiển thị của kho nhập gần nhất. VD: "Kho Hà Nội" | `warehouses.display_name` |
| `ngayNhapKho` | date | Yes | Ngày nhập kho gần nhất (định dạng `YYYY-MM-DD`) | `MAX(inventory.imported_at)` |
| `giaBanSi` | string | Yes | Khoảng giá sỉ tham khảo. VD: "850k - 950k" | `MIN(price) - MAX(price)` |
| `tocDoBan` | number | Yes | SL bán TB / ngày, tổng hợp POS tất cả kho | `SUM(pos.sold_qty) / DATEDIFF(...)` |
| `soShopQuanTam` | number | Yes | Số shop đã xem / hỏi giá SP này trong 30 ngày | `COUNT(DISTINCT product_views.user_id)` |
| `diemHot` | number | Yes | Điểm tổng hợp 0-100 | Server tính |
| `khuyenNghi` | string | Yes | Gợi ý nhập hàng | AI suggestion hoặc `products.recommendation` |
| `tags` | string[] | Yes | Tags liên quan | `product_tags` |

### Các field KHÔNG trả về (dữ liệu nhạy cảm):
- ~~`tonKho`~~ - Không public số tồn chính xác
- ~~`giaNhap`~~ - Không public giá vốn
- ~~`warehouse_id`~~ - Không public định danh kho cụ thể

---

## 5. Cách tính điểm Hot (diemHot)

Điểm hot là composite score từ 0-100, tổng hợp từ 3 yếu tố với trọng số:

```
diemHot = (diemDoMoi * 0.35) + (diemQuanTam * 0.35) + (diemTocDoBan * 0.30)
```

### 4.1 Điểm độ mới (0-100)
Dựa trên `ngayNhapKho`:

| Ngày nhập | Điểm |
|---|---|
| Hôm nay | 100 |
| 1-2 ngày trước | 90 |
| 3-5 ngày trước | 75 |
| 6-10 ngày trước | 50 |
| 11-20 ngày trước | 25 |
| > 20 ngày | 10 |

### 4.2 Điểm quan tâm (0-100)
Dựa trên `soShopQuanTam`, chuẩn hóa về thang 0-100:
```
diemQuanTam = MIN(soShopQuanTam / MAX_SHOP_QUAN_TAM * 100, 100)
```
Với `MAX_SHOP_QUAN_TAM` = giá trị cao nhất trong tập dữ liệu hiện tại (để scale tương đối).

### 4.3 Điểm tốc độ bán (0-100)
Dựa trên `tocDoBan`, chuẩn hóa về thang 0-100:
```
diemTocDoBan = MIN(tocDoBan / MAX_TOC_DO_BAN * 100, 100)
```
Với `MAX_TOC_DO_BAN` = giá trị cao nhất trong tập dữ liệu hiện tại.

### 4.4 Phân loại mức Hot

| Điểm | Label | Màu |
|---|---|---|
| >= 85 | Cực hot | Đỏ |
| >= 70 | Hot | Xanh dương |
| >= 55 | Tiềm năng | Cam |
| < 55 | Mới | Xanh lá |

---

## 6. Cơ chế Sắp xếp

| `sortBy` | Logic |
|---|---|
| `hot` (mặc định) | `ORDER BY diemHot DESC` |
| `new` | `ORDER BY ngayNhapKho DESC` |
| `sales` | `ORDER BY tocDoBan DESC` |

---

## 7. Cơ chế Lọc

| Filter | Logic |
|---|---|
| `khuVuc` | Lọc sản phẩm có ít nhất 1 kho trong khu vực đó. `product.khuVuc` chứa tất cả region có hàng, dùng `LIKE %khuVuc%` |

---

## 8. Cơ chế sinh `khuyenNghi` (Khuyến nghị nhập hàng)

Ưu tiên:
1. Nếu admin / nhà cung cấp đã viết sẵn → dùng luôn
2. Nếu không có → sinh tự động theo template dựa trên `tocDoBan` và `soShopQuanTam`:

| Điều kiện | Template |
|---|---|
| `tocDoBan > 5 && diemHot >= 85` | "Hàng bán rất chạy, tốc độ {tocDoBan} cái/ngày. Nên nhập lô lớn để hưởng chiết khấu sỉ." |
| `diemHot >= 70` | "Nhu cầu đang tăng. Nên nhập thêm để đủ hàng bán trong tháng." |
| `soShopQuanTam > 20 && tocDoBan < 2` | "Nhiều shop hỏi nhưng bán chậm. Nên nhập số lượng nhỏ, tránh ôm tồn." |
| `tocDoBan >= 3` | "Hàng tiêu hao nhanh, nên nhập đều mỗi đợt để tránh đứt hàng." |
| default | "Nhu cầu ổn định. Nên duy trì nhập đều hàng tháng." |

---

## 9. Frontend tham khảo

File: `src/modules/forum/pages/ForumNewProducts.jsx`

### Bố cục:
1. **Header**: Tiêu đề "Sản phẩm mới nổi bật" + mô tả
2. **Filter bar**: 3 nút sort (Hot nhất / Mới nhất / Bán chạy nhất) + dropdown chọn khu vực
3. **Danh sách card**: Mỗi card hiển thị:
   - Ảnh sản phẩm (có badge mức hot trên góc ảnh)
   - Danh mục + Nguồn kho
   - Tên sản phẩm
   - Tags
   - Giá sỉ tham khảo
   - Điểm hot (số to) + 2 dòng chỉ số: ngày nhập + shop quan tâm, tốc độ bán
   - 2 nút: "Nhập vào kho" + "Xem chi tiết"
4. **Popup chi tiết**: Điểm hot, danh mục, khu vực, nguồn kho, ngày nhập, giá sỉ, tốc độ bán, shop quan tâm, khuyến nghị, tags
5. **Phân trang**: 6 sản phẩm / trang
6. **Sidebar phải**: Sản phẩm mới nhập gần đây, thống kê hệ thống, cách tính điểm hot

### Các field KHÔNG hiển thị trên frontend:
- Tồn kho (số chính xác) → chỉ hiển thị trạng thái Còn hàng / Sắp hết nếu cần
- Giá nhập (giá vốn)
- Định danh kho cụ thể → chỉ hiển thị tên hiển thị (VD: "Kho Hà Nội")

---

## 10. Ghi chú cho Backend

1. **Dữ liệu đầu vào**: Cần join các bảng `products`, `inventory`, `warehouses`, `pos_orders`, `forum_product_views` để tổng hợp.
2. **Cache**: Nên cache response 15-30 phút vì dữ liệu không cần real-time tuyệt đối.
3. **Scale**: `MAX_SHOP_QUAN_TAM` và `MAX_TOC_DO_BAN` nên tính trên tập dữ liệu trả về (sau filter) để scale tương đối chính xác, không nên dùng hard-coded constant.
4. **Bảo mật**: Tuyệt đối không trả về `tonKho` (số tồn chính xác), `giaNhap` (giá vốn), `warehouse_id` (định danh kho) trong response public này.
