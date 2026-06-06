# Spec: Trang Top sản phẩm bán chạy (/forum/top-products)

## 1. Tổng quan

Trang hiển thị danh sách sản phẩm có mức tăng trưởng nhu cầu cao nhất, dựa trên dữ liệu thực tế từ hệ thống POS và đối tác. Xếp hạng theo % tăng trưởng, có phân tích thành phần (nhu cầu, mùa vụ, giá).

**Mục tiêu:** Giúp đại lý / chủ cửa hàng nhận diện sản phẩm đang lên cơn sốt để ưu tiên nhập hàng.

---

## 2. FE mong đợi từ API - JSON Response

Frontend gọi API và mong nhận đúng format JSON này:

```json
{
  "data": [
    {
      "id": "top-001",
      "title": "Máy khoan pin Makita 18V",
      "market": "Sức mua: Hà Nội - 200 shop quan tâm",
      "percent": "+65%",
      "demand": 55,
      "season": 30,
      "priceShare": 15,
      "tip": "Nhập 20-30 sản phẩm, giá đang tăng",
      "referencePrice": "3.200.000d"
    },
    {
      "id": "top-002",
      "title": "Son chong tham KOVA CT-11A",
      "market": "Sức mua: Toan quoc - 310 shop quan tam",
      "percent": "+55%",
      "demand": 70,
      "season": 20,
      "priceShare": 10,
      "tip": "Nhập 30-50 thung, mua mua keo dai",
      "referencePrice": "1.250.000d"
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 2
}
```

---

## 3. API Endpoint

### `GET /api/forum/top-products`

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `timeRange` | string | - | `30d` | `30d` \| `7d` \| `today` |
| `area` | string | - | `all` | Lọc theo khu vực. `all` = tất cả |
| `page` | number | - | `1` | Số trang |
| `limit` | number | - | `6` | Số sản phẩm / trang |

---

## 4. Data Model: TopProductItem

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `id` | string | Yes | Mã định danh |
| `title` | string | Yes | Tên sản phẩm |
| `market` | string | Yes | Chuỗi mô tả thị trường: "Sức mua: {khu vực} - {số} shop quan tâm" |
| `percent` | string | Yes | % tăng trưởng, có dấu + phía trước. VD: "+65%" |
| `demand` | number | Yes | Tỷ trọng % của yếu tố Nhu cầu trong tổng tăng trưởng (0-100) |
| `season` | number | Yes | Tỷ trọng % của yếu tố Mùa vụ trong tổng tăng trưởng (0-100) |
| `priceShare` | number | Yes | Tỷ trọng % của yếu tố Giá trong tổng tăng trưởng (0-100) |
| `tip` | string | Yes | Gợi ý / khuyến nghị nhập hàng ngắn gọn |
| `referencePrice` | string | Yes | Giá tham khảo (có đơn vị). VD: "3.200.000d" |

**Ràng buộc:** `demand + season + priceShare` = 100

---

## 5. Phân loại mức tăng trưởng (theo `percent`)

| `percent` | Label | Màu border card | Màu text % |
|---|---|---|---|
| >= 50% | Bung no | `border-red-500` | `text-red-600` |
| >= 35% | Tang manh | `border-[#004785]` | `text-[#004785]` |
| >= 25% | Tang kha | `border-orange-500` | `text-orange-600` |
| < 25% | On dinh | `border-emerald-500` | `text-emerald-600` |

---

## 6. Cách tính `percent` (Tỷ lệ tăng trưởng)

```
percent = ((luotQuanTam_hienTai - luotQuanTam_kyTruoc) / luotQuanTam_kyTruoc) * 100
```

- **30 ngày**: So sánh 30 ngày gần nhất vs 30 ngày trước đó
- **7 ngày**: So sánh 7 ngày gần nhất vs 7 ngày trước đó
- **Hôm nay**: So sánh hôm nay vs hôm qua

Kết quả làm tròn về số nguyên, thêm dấu `+` phía trước nếu dương.

---

## 7. Cách phân rã `demand` / `season` / `priceShare`

3 chỉ số này thể hiện **đóng góp** của từng yếu tố vào mức tăng trưởng:

| Chỉ số | Ý nghĩa | Cách đo |
|---|---|---|
| `demand` | Đóng góp từ nhu cầu thị trường | Lượt tìm kiếm / hỏi giá / thảo luận trên forum |
| `season` | Đóng góp từ yếu tố mùa vụ | Tương quan thời điểm trong năm với chu kỳ mùa vụ ngành |
| `priceShare` | Đóng góp từ biến động giá | Chênh lệch giá hiện tại so với trung bình 6 tháng |

```
tong = demand_raw + season_raw + priceShare_raw
demand  = round(demand_raw  / tong * 100)
season  = round(season_raw  / tong * 100)
priceShare = 100 - demand - season   // để đảm bảo tổng = 100
```

---

## 8. Cơ chế Sắp xếp & Lọc

| Hành động | Logic |
|---|---|
| Sắp xếp mặc định | `ORDER BY CAST(REPLACE(percent, '+', '') AS INT) DESC` |
| `area` filter | `market` chứa tên khu vực tương ứng |
| `timeRange` filter | Tính lại `percent` theo khung thời gian tương ứng |

---

## 9. Frontend tham khảo

File: `src/modules/forum/pages/ForumTopProducts.jsx`

### Bố cục:
1. **Header**: "Top sản phẩm bán chạy" + mô tả
2. **Filter bar**: Nút "10 sản phẩm hot nhất" + dropdown khu vực + tabs thời gian (30 ngày / 7 ngày / Hôm nay)
3. **Grid card 2 cột**: Mỗi card:
   - Border trái màu theo mức tăng trưởng
   - Tên sản phẩm + badge mức tăng trưởng
   - Dòng `market`
   - % tăng trưởng (số to, bên phải)
   - Thanh bar 3 màu thể hiện demand/season/priceShare
   - Dòng dưới: icon bóng đèn + `tip` + nút "Nhập POS"
4. **Click card** -> mở popup chi tiết: % tăng trưởng, label, market, giá tham khảo, thanh bar, tip
5. **Phân trang**: 6 sản phẩm / trang
6. **Sidebar phải**: Gợi ý theo khu vực, ghi chú, mẹo đọc chỉ số
