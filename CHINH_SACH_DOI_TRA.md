# Chính Sách Đổi Trả Hàng (Return/Exchange Policy)

## 1. Cấu hình chính sách

### 1.1. Cấp chi nhánh (Branch-level)

Lưu trong model `Branch` (`Models/Branch.cs`):

| Trường | Kiểu | Ý nghĩa |
|--------|------|---------|
| `ReturnDaysAllowed` | `int?` | Số ngày được phép **trả** hàng kể từ ngày mua. `null` = tắt chính sách |
| `ExchangeDaysAllowed` | `int?` | Số ngày được phép **đổi** hàng kể từ ngày mua. `null` = tắt chính sách |

**API quản lý** (`OwnerBranchController`):

- `GET /api/owner/branches/{id}/settings` — Lấy cài đặt
- `PUT /api/owner/branches/{id}/settings` — Cập nhật cài đặt
  - Nếu gửi `0` → set về `null` (disable policy)
  - Nếu gửi giá trị âm → **400 Bad Request**

### 1.2. Cấp nhóm hàng (Category-level)

Lưu trong `SystemConfig` với key `CATEGORY_RETURN_POLICIES` dạng JSON array:

```json
[
  {
    "categoryName": "Điện tử",
    "returnDays": 7,
    "exchangeDays": 14
  },
  {
    "categoryName": "Thời trang",
    "returnDays": 30,
    "exchangeDays": 30
  }
]
```

**API quản lý** (`OwnerBranchController`):

- `GET /api/owner/branches/{id}/return-policies/categories` — Lấy danh sách
- `PUT /api/owner/branches/{id}/return-policies/categories` — Cập nhật danh sách

---

## 2. Luồng xử lý đổi trả (`ReturnsController`)

### 2.1. Tạo phiếu đổi trả — `POST /api/pos/returns`

**Validation:**

| Bước | Rule | Mã lỗi |
|------|------|--------|
| 1 | Hóa đơn gốc phải tồn tại và thuộc chi nhánh hiện tại | `MSG-01` |
| 2 | Hóa đơn gốc phải có status = `Completed` | `MSG-78` |
| 3 | (BR-80) Kiểm tra thời hạn: `invoice.CreatedAt + ReturnDaysAllowed >= now` | `MSG-65` |
| | **Default:** `ReturnDaysAllowed = 30` nếu branch không cấu hình | |
| 4 | Không được có phiếu đổi trả `Pending` khác cho cùng hóa đơn | `MSG-66` |

**Tạo entity:**

| Trường | Giá trị |
|--------|---------|
| `ReturnCode` | Tự sinh: `RET-yyyyMMdd-XXXX` |
| `RefundMethod` | `CASH` (default), `TRANSFER`, hoặc `EXCHANGE` |
| `ReturnType` | `REFUND` (trả hàng) hoặc `EXCHANGE` (đổi hàng) |
| `Status` | `Pending` |

### 2.2. Thêm sản phẩm — `POST /api/pos/returns/{id}/items`

**Validation:**
- Phiếu phải ở trạng thái `Pending`
- Sản phẩm phải có trong hóa đơn gốc
- Số lượng trả không vượt quá số lượng đã mua

**Cách tính tiền hoàn trả:**
```
avgPrice = Σ(SellPrice × Quantity) / totalBought
grossRefundLine = req.Quantity × avgPrice
discountRatio = min(1, max(0, Invoice.DiscountAmount / invoiceSubtotal))
discountPortion = grossRefundLine × discountRatio
refundLine = max(0, grossRefundLine - discountPortion)
```

### 2.3. Hoàn tất phiếu — `POST /api/pos/returns/{id}/finalize`

- Kiểm tra phiếu `Pending` và có ít nhất 1 sản phẩm
- Tính `RefundAmount = Σ(RefundAmount các items)`
- **Hoàn kho:** `AvailableStock += Quantity` và `ActualStock += Quantity`
- **Hoàn tiền mặt:** Nếu `RefundMethod == "CASH"`, tạo `RefundRecord` với status `REFUNDED`
- Status → `Completed`

### 2.4. Hủy phiếu — `PATCH /api/pos/returns/{id}/cancel`

- Chỉ hủy được phiếu đang `Pending`
- Status → `Cancelled`

---

## 3. Mô hình dữ liệu

### ReturnOrder (`Models/ReturnOrder.cs`)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `ReturnOrderId` | `Guid` | PK |
| `ReturnCode` | `string?` | Unique, pattern: `RET-yyyyMMdd-XXXX` |
| `OrderId` | `Guid` | FK → Order |
| `UserId` | `Guid` | FK → User |
| `RefundAmount` | `decimal` | Tổng tiền hoàn |
| `RefundMethod` | `string?` | `CASH` / `TRANSFER` / `EXCHANGE` |
| `ReturnType` | `string?` | `EXCHANGE` / `REFUND` |
| `Status` | `string?` | `Pending` / `Completed` / `Cancelled` |
| `Note` | `string?` | Ghi chú |

### ReturnItem

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `ReturnItemId` | `Guid` | PK |
| `ReturnOrderId` | `Guid` | FK → ReturnOrder |
| `BranchProductId` | `Guid` | FK → BranchProduct |
| `Quantity` | `int` | Số lượng trả |
| `RefundAmount` | `decimal?` | Tiền hoàn (đã trừ chiết khấu) |
| `Reason` | `string?` | Lý do trả (mặc định `OTHER`) |

---

## 4. Error codes

| Code | Message |
|------|---------|
| `MSG-01` | Không tìm thấy phiếu đổi trả / hóa đơn gốc |
| `MSG-59` | Sản phẩm này không có trong hóa đơn gốc |
| `MSG-61` | Phiếu đổi trả phải có ít nhất 1 sản phẩm |
| `MSG-65` | Đã quá thời hạn {n} ngày kể từ ngày mua. Không thể đổi trả. |
| `MSG-66` | Hóa đơn này đang có phiếu đổi trả đang xử lý / Số lượng trả vượt quá số lượng đã mua |
| `MSG-78` | Chỉ hóa đơn đã hoàn tất mới được đổi trả / Chỉ phiếu đang chờ xử lý mới được thao tác |
