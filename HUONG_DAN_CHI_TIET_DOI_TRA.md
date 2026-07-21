# Hướng Dẫn Chi Tiết Module Đổi/Trả Hàng — MEP Metal ERP

## Mục lục

1. [Tổng quan](#1-t%E1%BB%95ng-quan)
2. [Kiến trúc module](#2-ki%E1%BA%BFn-tr%C3%BAc-module)
3. [Chính sách đổi/trả — 2 cấp độ](#3-ch%C3%ADnh-s%C3%A1ch-%C4%91%E1%BB%95itr%E1%BA%A3--2-c%E1%BA%A5p-%C4%91%E1%BB%99)
4. [Luồng xử lý tạo phiếu đổi/trả](#4-lu%E1%BB%93ng-x%E1%BB%AD-l%C3%BD-t%E1%BA%A1o-phi%E1%BA%BFu-%C4%91%E1%BB%95itr%E1%BA%A3)
5. [Điều kiện sản phẩm được đổi/trả](#5-%C4%91i%E1%BB%81u-ki%E1%BB%87n-s%E1%BA%A3n-ph%E1%BA%A9m-%C4%91%C6%B0%E1%BB%A3c-%C4%91%E1%BB%95itr%E1%BA%A3)
6. [Cách tính thời hạn đổi/trả](#6-c%C3%A1ch-t%C3%ADnh-th%E1%BB%9Di-h%E1%BA%A1n-%C4%91%E1%BB%95itr%E1%BA%A3)
7. [Cách tính tiền hoàn trả](#7-c%C3%A1ch-t%C3%ADnh-ti%E1%BB%81n-ho%C3%A0n-tr%E1%BA%A3)
8. [Quản lý số lượng đã đổi/trả](#8-qu%E1%BA%A3n-l%C3%BD-s%E1%BB%91-l%C6%B0%E1%BB%A3ng-%C4%91%C3%A3-%C4%91%E1%BB%95itr%E1%BA%A3)
9. [Trạng thái phiếu đổi/trả và vòng đời](#9-tr%E1%BA%A1ng-th%C3%A1i-phi%E1%BA%BFu-%C4%91%E1%BB%95itr%E1%BA%A3-v%C3%A0-v%C3%B2ng-%C4%91%E1%BB%9Di)
10. [Các API endpoints](#10-c%C3%A1c-api-endpoints)
11. [Cơ chế đồng bộ chính sách](#11-c%C6%A1-ch%E1%BA%BF-%C4%91%E1%BB%93ng-b%E1%BB%99-ch%C3%ADnh-s%C3%A1ch)
12. [Danh sách file nguồn](#12-danh-s%C3%A1ch-file-ngu%E1%BB%93n)
13. [Bất cập và lưu ý](#13-b%E1%BA%A5t-c%E1%BA%ADp-v%C3%A0-l%C6%B0u-%C3%BD)

---

## 1. Tổng quan

Module đổi/trả hàng cho phép nhân viên bán hàng (POS) tạo phiếu đổi/trả cho khách hàng đã mua hàng. Hệ thống hỗ trợ 2 loại giao dịch:

| Loại | Mô tả |
|------|-------|
| **REFUND** (Trả hàng) | Khách trả lại hàng, nhận lại tiền hoàn |
| **EXCHANGE** (Đổi hàng) | Khách đổi sản phẩm khác, không hoàn tiền |

Module hoạt động ở 2 phạm vi:

| Phạm vi | Người dùng | Mô tả |
|---------|-----------|-------|
| **POS** | Nhân viên bán hàng | Tạo phiếu, xem danh sách, finalize/hủy |
| **Owner** | Chủ cửa hàng | Xem lịch sử, quản lý chính sách đổi/trả theo nhóm hàng |

---

## 2. Kiến trúc module

### 2.1. Sơ đồ tổng thể

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React JS)                           │
│                                                                      │
│  ┌─────────────────────┐    ┌──────────────────────────────┐        │
│  │  POS Module         │    │  Owner Module                │        │
│  │                     │    │                              │        │
│  │  ReturnOrderPage    │    │  ReturnHistory               │        │
│  │  ├─ ReturnForm      │    │  ├─ ReturnTable              │        │
│  │  ├─ ReturnList      │    │  ├─ ReturnDetailModal        │        │
│  │  └─ ReturnDetail    │    │  └─ CategoryReturnPolicy     │        │
│  │                     │    │                              │        │
│  │  posService.js      │    │  shiftReturnService.js       │        │
│  │                     │    │  useCategoryReturnPolicies   │        │
│  └─────────────────────┘    └──────────────────────────────┘        │
│                              │                                       │
│                   localStorage (pos_category_return_policies)        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼ API
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (C# / .NET)                          │
│                                                                      │
│  ReturnsController                  BranchController                │
│  ├─ POST /pos/returns              ├─ GET /.../settings             │
│  ├─ POST /.../items                └─ PUT /.../settings             │
│  ├─ POST /.../finalize                                                │
│  └─ PATCH /.../cancel                                                 │
│                                                                      │
│  ReturnOrder Entity                Branch Entity                     │
│  ReturnItem Entity                 │  ReturnDaysAllowed              │
│                                    │  ExchangeDaysAllowed            │
│                                    SystemConfig                      │
│                                    │  CATEGORY_RETURN_POLICIES       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Mô hình dữ liệu

#### ReturnOrder

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `ReturnOrderId` | `Guid` | PK |
| `ReturnCode` | `string?` | Pattern: `RET-yyyyMMdd-XXXX` |
| `OrderId` | `Guid` | FK → Order |
| `UserId` | `Guid` | FK → User |
| `RefundAmount` | `decimal` | Tổng tiền hoàn |
| `RefundMethod` | `string?` | `CASH` / `TRANSFER` / `EXCHANGE` |
| `ReturnType` | `string?` | `EXCHANGE` / `REFUND` |
| `Status` | `string?` | `Pending` / `Completed` / `Cancelled` |
| `Note` | `string?` | Ghi chú |

#### ReturnItem

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `ReturnItemId` | `Guid` | PK |
| `ReturnOrderId` | `Guid` | FK → ReturnOrder |
| `BranchProductId` | `Guid` | FK → BranchProduct |
| `Quantity` | `int` | Số lượng trả |
| `RefundAmount` | `decimal?` | Tiền hoàn (đã trừ chiết khấu) |
| `Reason` | `string?` | Lý do trả (mặc định `OTHER`) |

---

## 3. Chính sách đổi/trả — 2 cấp độ

### 3.1. Cấp chi nhánh (Branch-level)

Lưu trong model `Branch`:

| Trường | Kiểu | Ý nghĩa |
|--------|------|---------|
| `ReturnDaysAllowed` | `int?` | Số ngày được phép **trả** hàng. `null` = tắt CS |
| `ExchangeDaysAllowed` | `int?` | Số ngày được phép **đổi** hàng. `null` = tắt CS |

- **API**: `GET/PUT /api/owner/branches/{id}/settings`
- **Giá trị mặc định**: `ReturnDaysAllowed = 30` nếu không cấu hình
- **Backend kiểm tra**: `invoice.CreatedAt + ReturnDaysAllowed >= now`
- Nếu gửi `0` → set về `null` (disable policy)

### 3.2. Cấp nhóm hàng (Category-level) — **QUAN TRỌNG NHẤT**

Lưu trong `SystemConfig` với key `CATEGORY_RETURN_POLICIES`, dạng JSON:

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

- **API**: `GET/PUT /api/owner/branches/{id}/return-policies/categories`
- **Đây là tầng kiểm tra chính ở frontend**
- Chỉ nhóm hàng được cấu hình mới được phép đổi/trả

### 3.3. Cách định cấu hình

Owner vào **Cài đặt cửa hàng** → **Chính sách đổi/trả theo nhóm hàng**:

1. Nhấn "Thêm nhóm", chọn nhóm hàng
2. Nhập số ngày được phép TRẢ (để trống = không cho trả)
3. Nhập số ngày được phép ĐỔI (để trống = không cho đổi)
4. Giao diện hỗ trợ nhập theo: **ngày**, **tháng** (30 ngày/tháng), hoặc **năm** (365 ngày/năm)

Policy được **tự động đồng bộ xuống localStorage** ngay khi lưu để POS có thể dùng ngay.

---

## 4. Luồng xử lý tạo phiếu đổi/trả

### 4.1. Sơ đồ luồng

```
BƯỚC 1: Tìm hóa đơn
┌─────────────────────────────────────────────────────────────┐
│ NV nhập mã hóa đơn → gọi API GET /pos/invoices?status=Completed│
│   → Tìm hóa đơn trong danh sách Completed                     │
│   → Gọi GET /pos/invoices/{id} lấy chi tiết + items           │
│   → Xác định category cho từng sản phẩm                       │
│   → Kiểm tra policy (từ localStorage)                         │
│   → Tính số lượng còn lại có thể đổi/trả                      │
│   → Lọc chỉ giữ items có _remainingQty > 0 && hasAnyPolicy    │
│                                                               │
│   NẾU không có item nào hợp lệ:                               │
│     → "Sản phẩm không thuộc nhóm hàng được đổi trả"           │
│     hoặc "Tất cả sản phẩm đã được đổi trả hết"               │
│                                                               │
│   NẾU có item hợp lệ: → Chuyển Bước 2                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
BƯỚC 2: Chọn sản phẩm + lý do
┌─────────────────────────────────────────────────────────────┐
│ Chọn loại: TRẢ HÀNG (REFUND) hoặc ĐỔI HÀNG (EXCHANGE)       │
│   → Khi đổi loại: Clear danh sách đã chọn                    │
│   → Mỗi sản phẩm kiểm tra policy tương ứng với loại          │
│                                                               │
│ Chọn sản phẩm:                                               │
│   → Checkbox → toggleProduct()                                │
│   → Tăng/giảm số lượng (tối đa = _remainingQty)              │
│                                                               │
│ Nhập lý do đổi trả                                            │
│ Chọn phương thức hoàn tiền (nếu là REFUND):                   │
│   → CASH: Tiền mặt                                           │
│   → TRANSFER: Chuyển khoản                                   │
│                                                               │
│ Kiểm tra lần cuối trước submit:                               │
│   → selectedProducts.length > 0                               │
│   → reason.trim() != ''                                       │
│   → Từng SP phải có policy phù hợp với returnType             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
BƯỚC 3: Submit (Gọi API)
┌─────────────────────────────────────────────────────────────┐
│ POST /pos/returns → payload:                                 │
│   {                                                          │
│     invoiceId, returnType, reason,                           │
│     refundMethod, notes,                                     │
│     items: [{ productId, quantity }]                         │
│   }                                                          │
│                                                               │
│ Nếu backend không nhận items inline:                          │
│   → Gọi thêm POST /.../items cho từng SP                     │
│                                                               │
│ Lưu tracking vào localStorage:                                │
│   → key: 'pos_return_items_{invoiceCode}'                    │
│   → value: { [lineKey]: { qty, productId } }                │
│                                                               │
│ Status → Pending                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
BƯỚC 4: Xác nhận hoàn tất (Finalize)
┌─────────────────────────────────────────────────────────────┐
│ NV bấm "Xác nhận hoàn tiền" / "Xác nhận đổi hàng"            │
│   → POST /pos/returns/{id}/finalize                          │
│                                                               │
│ Backend xử lý:                                                │
│   1. Kiểm tra phiếu Pending, có ít nhất 1 SP                 │
│   2. Tính RefundAmount = Σ(item.RefundAmount)                 │
│   3. Hoàn kho:                                               │
│      → AvailableStock += Quantity                             │
│      → ActualStock += Quantity                                │
│   4. Hoàn tiền mặt:                                          │
│      → Nếu RefundMethod == "CASH"                             │
│      → Tạo RefundRecord status = REFUNDED                     │
│   5. Status → Completed                                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. Hủy phiếu

- **API**: `PATCH /pos/returns/{id}/cancel`
- Chỉ hủy được phiếu đang `Pending`
- Khi hủy, **trừ lại tracking trong localStorage** để số lượng tồn được tính lại đúng
- Status → `Cancelled`

---

## 5. Điều kiện sản phẩm được đổi/trả

Có **4 điều kiện** tất cả phải thỏa mãn:

### 5.1. Hóa đơn gốc phải hoàn tất (Completed)

- Frontend: Chỉ tìm hóa đơn với `status: 'Completed'` (dòng 99, ReturnForm.jsx)
- Backend: Mã lỗi **MSG-78** — "Chỉ hóa đơn đã hoàn tất mới được đổi trả"

### 5.2. Nhóm hàng phải có chính sách đổi/trả

Đây là điều kiện quan trọng nhất, kiểm tra ở cả 2 đầu:

| Tình huống | Kết quả |
|-----------|---------|
| Không có policy cho category | `isItemAllowed = false` → **Không được đổi/trả** |
| `returnDays <= 0` | **Không được trả** (REFUND) |
| `exchangeDays <= 0` | **Không được đổi** (EXCHANGE) |
| Có policy và số ngày > 0 | **Được phép** |

Code kiểm tra (ReturnForm.jsx, dòng 44-52):
```javascript
const isItemAllowed = (item, type) => {
  const policy = item._policy;
  if (!policy) return false;
  if (type === 'REFUND') return parseInt(policy.returnDays, 10) > 0;
  if (type === 'EXCHANGE') return parseInt(policy.exchangeDays, 10) > 0;
  return true;
};
```

### 5.3. Thời hạn đổi/trả

**BACKEND KIỂM TRA**: `invoice.CreatedAt + ReturnDaysAllowed >= now` (mã lỗi MSG-65)

- Mặc định `ReturnDaysAllowed = 30` ngày nếu branch không cấu hình
- Tính từ `invoice.createdAt` — thời điểm hóa đơn được tạo

**FRONTEND KHÔNG KIỂM TRA** ngày tháng — đây là bất cập (xem mục 13).

### 5.4. Số lượng còn lại chưa đổi/trả

```
_remainingQty = originalQty - totalReturned
```

Với `totalReturned` được tính từ 2 nguồn:
1. **API**: Tổng số lượng đã trả từ các phiếu return không bị hủy (theo `productId`)
2. **localStorage**: Tracking chính xác theo từng dòng (`invoiceItemId`) qua key `pos_return_items_{invoiceCode}`

**Thứ tự ưu tiên**: localStorage → API (localStorage chính xác hơn vì phân biệt được từng dòng riêng biệt)

### 5.5. Kiểm tra phía Backend (tóm tắt)

| Bước | Rule | Mã lỗi |
|------|------|--------|
| 1 | Hóa đơn gốc tồn tại và thuộc chi nhánh hiện tại | MSG-01 |
| 2 | Hóa đơn gốc status = `Completed` | MSG-78 |
| 3 | Thời hạn: `invoice.CreatedAt + ReturnDaysAllowed >= now` | MSG-65 |
| 4 | Không có phiếu return `Pending` khác cho cùng hóa đơn | MSG-66 |
| 5 | Sản phẩm phải có trong hóa đơn gốc | MSG-59 |
| 6 | Số lượng trả không vượt quá số lượng đã mua | MSG-66 |

---

## 6. Cách tính thời hạn đổi/trả

### 6.1. Công thức

```
Có được đổi/trả?  ⇔  invoice.createdAt + SốNgàyChoPhép >= today
```

Trong đó:
- **`invoice.createdAt`**: Thời điểm hóa đơn được tạo (có múi giờ Việt Nam)
- **`SốNgàyChoPhép`**: Phụ thuộc cấu hình:
  - **Branch-level** (backend dùng): `Branch.ReturnDaysAllowed` / `Branch.ExchangeDaysAllowed`
  - **Category-level** (frontend dùng): `policy.returnDays` / `policy.exchangeDays`
- **`today`**: Thời điểm hiện tại

### 6.2. Ví dụ

| Ngày mua | Số ngày cho phép | Hạn cuối | Ngày hiện tại | Kết quả |
|----------|-----------------|-----------|---------------|---------|
| 01/06/2026 | 30 ngày | 01/07/2026 | 15/07/2026 | **Quá hạn** |
| 01/06/2026 | 30 ngày | 01/07/2026 | 25/06/2026 | **Còn hạn** |
| 01/06/2026 | 7 ngày | 08/06/2026 | 10/06/2026 | **Quá hạn** |

### 6.3. Đơn vị thời gian

Giao diện cấu hình hỗ trợ:
- **ngày**: số ngày trực tiếp
- **tháng**: `số tháng × 30` ngày
- **năm**: `số năm × 365` ngày

Ví dụ: 2 tháng → `2 × 30 = 60 ngày`, 1 năm → `1 × 365 = 365 ngày`

---

## 7. Cách tính tiền hoàn trả

### 7.1. Công thức

```javascript
// Tính giá trung bình cho từng sản phẩm
avgPrice = Σ(SellPrice × Quantity) / totalBought

// Tiền hoàn gộp cho dòng này
grossRefundLine = Quantity × avgPrice

// Tỷ lệ chiết khấu áp dụng cho hóa đơn
discountRatio = min(1, max(0, Invoice.DiscountAmount / invoiceSubtotal))

// Phần chiết khấu khấu trừ
discountPortion = grossRefundLine × discountRatio

// Tiền hoàn thực tế (đã trừ chiết khấu)
refundLine = max(0, grossRefundLine - discountPortion)
```

### 7.2. Trên giao diện (tính tạm)

Frontend tính tạm trước khi submit (ReturnForm.jsx, dòng 53-57):
```javascript
const subtotal = selectedProducts.reduce((sum, p) => sum + p.quantity * (p.sellPrice || 0), 0);
const discountRatio = invoice?.discountAmount && invoice?.subtotal
  ? invoice.discountAmount / invoice.subtotal
  : 0;
const discountPortion = subtotal * discountRatio;
const totalRefund = Math.max(0, subtotal - discountPortion);
```

### 7.3. Lưu ý

- Khi **đổi hàng (EXCHANGE)**: Không hoàn tiền → không hiển thị số tiền hoàn
- Khi **trả hàng (REFUND)**: Hiển thị số tiền hoàn dự kiến và phương thức hoàn (CASH / TRANSFER)

---

## 8. Quản lý số lượng đã đổi/trả

### 8.1. Hai nguồn dữ liệu

#### Nguồn 1: API

```javascript
// Lọc các phiếu return không bị hủy của hóa đơn này
const relatedReturns = allReturns.filter(r => {
  return r.status !== 'CANCELLED'
    && r.invoiceCode === invCode;
});

// Tính tổng số lượng đã trả theo productId
relatedReturns.forEach(ret => {
  (ret.items || []).forEach(item => {
    const pid = item.productId;
    returnedMap[pid] = (returnedMap[pid] || 0) + item.quantity;
  });
});
```

#### Nguồn 2: localStorage

Key: `pos_return_items_{invoiceCode}` — lưu tracking chính xác đến từng dòng:

```javascript
{
  "invoiceItemId_1": { qty: 2, productId: "p1" },
  "invoiceItemId_2": { qty: 1, productId: "p2" }
}
```

### 8.2. Cách tính số lượng còn lại

```
1. Ưu tiên tra theo lineKey (invoiceItemId) trong localStorage
   → remainingQty = originalQty - localQty

2. Nếu không có local, dùng API productId
   → adjustedTotal = max(0, apiTotal - localForProduct)
   → remainingQty = max(0, originalQty - adjustedTotal)
```

### 8.3. Cập nhật sau khi tạo phiếu

Sau khi tạo phiếu thành công, lưu tracking vào localStorage:
```javascript
const storageKey = 'pos_return_items_' + invoiceCode;
selectedProducts.forEach(p => {
  existing[p._key] = {
    qty: existing[p._key].qty + p.quantity,
    productId: p.productId
  };
});
localStorage.setItem(storageKey, JSON.stringify(existing));
```

### 8.4. Khi hủy phiếu

Khi hủy phiếu, tracking trong localStorage được trừ lại:
```javascript
detail.returnItems.forEach(item => {
  existing[item._key].qty -= item.quantity;
  if (existing[item._key].qty <= 0) delete existing[item._key];
});
localStorage.setItem(storageKey, JSON.stringify(existing));
```

---

## 9. Trạng thái phiếu đổi/trả và vòng đời

### 9.1. Các trạng thái

| Trạng thái | Label | Mô tả |
|-----------|-------|-------|
| `PENDING` | Chờ duyệt | Phiếu mới tạo, chờ xác nhận |
| `COMPLETED` | Hoàn tất | Đã finalize — hoàn kho + hoàn tiền |
| `CANCELLED` | Đã hủy | Đã hủy phiếu |

### 9.2. Sơ đồ trạng thái

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                    ┌────┴────┐
                    │         │
                    ▼         ▼
              ┌─────────┐ ┌──────────┐
              │COMPLETED│ │CANCELLED │
              └─────────┘ └──────────┘
```

### 9.3. Hành động theo trạng thái

| Hành động | PENDING | COMPLETED | CANCELLED |
|-----------|---------|-----------|-----------|
| Xem chi tiết | ✓ | ✓ | ✓ |
| Finalize (hoàn tiền/đổi) | ✓ | ✗ | ✗ |
| Hủy phiếu | ✓ | ✗ | ✗ |

---

## 10. Các API endpoints

### 10.1. POS Returns

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/pos/returns` | Danh sách phiếu đổi trả |
| `GET` | `/pos/returns/{id}` | Chi tiết phiếu |
| `POST` | `/pos/returns` | Tạo phiếu mới |
| `POST` | `/pos/returns/{id}/items` | Thêm sản phẩm vào phiếu |
| `POST` | `/pos/returns/{id}/finalize` | Hoàn tất phiếu |
| `PATCH` | `/pos/returns/{id}/cancel` | Hủy phiếu |

### 10.2. Owner — Chính sách

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/owner/branches/{id}/settings` | Lấy cài đặt chi nhánh |
| `PUT` | `/api/owner/branches/{id}/settings` | Cập nhật cài đặt |
| `GET` | `/api/owner/branches/{id}/return-policies/categories` | DS chính sách theo nhóm hàng |
| `PUT` | `/api/owner/branches/{id}/return-policies/categories` | Cập nhật chính sách |

### 10.3. Error Codes

| Code | Message |
|------|---------|
| MSG-01 | Không tìm thấy phiếu đổi trả / hóa đơn gốc |
| MSG-59 | Sản phẩm này không có trong hóa đơn gốc |
| MSG-61 | Phiếu đổi trả phải có ít nhất 1 sản phẩm |
| MSG-65 | Đã quá thời hạn {n} ngày kể từ ngày mua. Không thể đổi trả. |
| MSG-66 | Hóa đơn này đang có phiếu đổi trả đang xử lý / Số lượng trả vượt quá số lượng đã mua |
| MSG-78 | Chỉ hóa đơn đã hoàn tất mới được đổi trả / Chỉ phiếu đang chờ xử lý mới được thao tác |

---

## 11. Cơ chế đồng bộ chính sách

### 11.1. Luồng đồng bộ

```
Owner cấu hình (CategoryReturnPolicy.jsx)
       │
       ├───► updatePolicy() → set state policies
       │
       ├───► syncToLocal() → ghi vào localStorage('pos_category_return_policies')
       │
       └───► savePolicies() → PUT API → backend lưu SystemConfig
                                       → ghi lại localStorage để đảm bảo
```

### 11.2. Khi load trang

```
useCategoryReturnPolicies()
       │
       ├───► getCategories() + getCategoryPolicies() (song song)
       │         │
       │         ├── API thành công → cập nhật state
       │         │                   → ghi localStorage nếu có dữ liệu
       │         │
       │         └── API lỗi → fallback đọc localStorage
       │                      → nếu có data, push ngược lên API (đồng bộ 1 chiều)
       │
       └───► ReturnForm.jsx đọc localStorage → dùng để kiểm tra policy
```

### 11.3. Key localStorage

| Key | Mục đích |
|-----|---------|
| `pos_category_return_policies` | Policy đổi/trả theo nhóm hàng (dạng JSON map) |
| `pos_return_items_{invoiceCode}` | Tracking số lượng đã trả theo từng dòng |

---

## 12. Danh sách file nguồn

### POS Module

| File | Vai trò |
|------|---------|
| `src/modules/pos/pages/ReturnOrderPage.jsx` | Trang quản lý đổi trả, split panel, filter, stats |
| `src/modules/pos/components/return/ReturnForm.jsx` | **Form tạo phiếu đổi trả** — logic kiểm tra chính |
| `src/modules/pos/components/return/ReturnDetail.jsx` | Chi tiết phiếu + finalize + hủy |
| `src/modules/pos/components/return/ReturnList.jsx` | Danh sách phiếu (theo phong cách table) |
| `src/modules/pos/services/posService.js` | Service gọi API returns |

### Owner Module

| File | Vai trò |
|------|---------|
| `src/modules/owner/pages/ReturnHistory.jsx` | Lịch sử đổi/trả cho Owner |
| `src/modules/owner/pages/StoreSettings.jsx` | Cài đặt cửa hàng (tích hợp CategoryReturnPolicy) |
| `src/modules/owner/hooks/useReturnHistory.js` | Hook filter, phân trang, tải chi tiết |
| `src/modules/owner/hooks/useCategoryReturnPolicies.js` | Hook quản lý chính sách nhóm hàng |
| `src/modules/owner/services/shiftReturnService.js` | Service gọi API returns (phía Owner) |
| `src/modules/owner/services/branchSettingsService.js` | Service API settings + policies |
| `src/modules/owner/components/settings/CategoryReturnPolicy.jsx` | Giao diện quản lý chính sách nhóm hàng |
| `src/modules/owner/components/return/ReturnTable.jsx` | Bảng danh sách phiếu (Owner) |
| `src/modules/owner/components/return/ReturnDetailModal.jsx` | Modal chi tiết phiếu (Owner) |

### Khác

| File | Vai trò |
|------|---------|
| `src/services/endpoints.js` | Định nghĩa endpoints |
| `CHINH_SACH_DOI_TRA.md` | Tài liệu chính sách gốc |

---

## 13. Bất cập và lưu ý

### 13.1. Bất cập #1 — Frontend không kiểm tra thời hạn

**Vấn đề**: `ReturnForm.jsx` chỉ kiểm tra `policy.returnDays > 0`/`policy.exchangeDays > 0` — không so sánh `invoice.createdAt` với ngày hiện tại. Nghĩa là:
- Nếu policy có `returnDays: 30` → frontend luôn cho chọn, dù hóa đơn tạo từ 2 tháng trước
- Chỉ đến khi submit, backend mới từ chối với MSG-65

**Tác động**: Nhân viên bán hàng mất công nhập thông tin, chọn sản phẩm, rồi mới biết không được.

### 13.2. Bất cập #2 — Hai nguồn policy khác nhau

**Vấn đề**: 
- **Frontend** dùng **Category-level** policy từ `localStorage` (theo nhóm hàng)
- **Backend** dùng **Branch-level** policy từ `Branch.ReturnDaysAllowed` (chung toàn chi nhánh)

Có thể xảy ra: category có `returnDays: 30` nhưng branch-level chỉ cho `7` ngày → frontend hiển thị được chọn, backend từ chối.

### 13.3. Bất cập #3 — localStorage có thể bị xóa

**Vấn đề**: Chính sách được lưu trong `localStorage` key `pos_category_return_policies`. Nếu người dùng clear localStorage (hoặc sử dụng tính năng riêng tư), policy sẽ mất → không sản phẩm nào được đổi/trả → nhân viên tưởng hệ thống lỗi.

**Hiện tại**: Có cơ chế fallback (đọc từ API nếu localStorage trống), nhưng ở hook `useCategoryReturnPolicies`, không phải ở `ReturnForm`.

### 13.4. Bất cập #4 — Backend C# chưa có trong repo

**Vấn đề**: Toàn bộ logic backend (ReturnsController, validation, entities) được mô tả trong tài liệu nhưng không có trong repository hiện tại. Không thể kiểm tra code backend thực tế.

---

## 14. Các cải tiến đã thực hiện (fix 22/07/2026)

### 14.1. Xóa `hasAnyPolicy` — mỗi item tự đánh giá độc lập

Trước đây, code dùng `hasAnyPolicy` để kiểm tra xem có ít nhất 1 item có policy hay không:
- Nếu CÓ → proceed với tất cả item (kể cả item không có policy)
- Nếu KHÔNG → chặn toàn bộ hóa đơn, không cho tạo phiếu

Đã xóa hoàn toàn `hasAnyPolicy`. Chỉ kiểm tra còn hàng hay không (`_remainingQty > 0`), không kiểm tra policy ở bước quyết định luồng.

**File**: `ReturnForm.jsx` — dòng 313-319

### 14.2. Tra cứu policy bằng categoryId

Policy được lưu với key = `categoryId` thay vì `categoryName`:
- Key chính: `categoryId` (tra cứu chính xác)
- Fallback: scan `categoryName` trong values (backward compatible với dữ liệu cũ)

**Các file sửa**:
- `useCategoryReturnPolicies.js` — lưu `{ [categoryId]: { categoryId, categoryName, returnDays, exchangeDays } }`
- `CategoryReturnPolicy.jsx` — `syncToLocal` dùng categoryId làm key
- `ReturnForm.jsx` — tra cứu ưu tiên categoryId, sau đó scan categoryName

### 14.3. Bỏ `product.group` khỏi fallback category

Trước đây, nếu item không có `categoryName`, code fallback sang `item.product?.group`. Vì `product.group` thường là giá trị chung như "Hàng hóa" cho tất cả sản phẩm, nên tất cả item đều nhận cùng một category → cùng một policy → gây sai.

Đã bỏ hoàn toàn `product.group` khỏi fallback. Các item không có category sẽ được tra cứu qua API `getProductCategory`.

### 14.4. `getProductCategory` trả về `{ id, name }`

Đổi từ trả về string thành `{ id, name }`:
- Cho phép tra cứu chính xác bằng categoryId
- Backward compatible: ReturnForm xử lý cả 2 format

**File**: `posService.js` — dòng 177-248

### 14.5. Sơ đồ UI item-blocked

Khi item không thuộc nhóm hàng được cấu hình:

```
┌─────────────────────────────────────────────────────┐
│ Sản phẩm đổi trả *                                   │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ☐ Áo thun                        Đã mua: 1      │ │ ← opacity-50, bg-slate-50
│ │   FASHION · Đơn giá: 120,000                     │ │
│ │   🔴 Nhóm hàng "FASHION" chưa được thiết lập    │ │ ← text-red-400
│ │      chính sách trả                              │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ ☐ Laptop                           Đã mua: 1    │ │ ← opacity-50, bg-slate-50
│ │   ELECTRONIC · Đơn giá: 15,000,000               │ │
│ │   🔴 Nhóm hàng "ELECTRONIC" chưa được thiết lập  │ │ ← text-red-400
│ │      chính sách trả                              │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 14.6. Xử lý khi đổi loại (REFUND ↔ EXCHANGE)

Khi nhân viên chuyển giữa "Trả hàng" và "Đổi hàng":
- `returnDays` được dùng cho REFUND
- `exchangeDays` được dùng cho EXCHANGE
- Mỗi item được đánh giá lại độc lập theo loại mới
- Danh sách đã chọn được clear để tránh giữ lại sản phẩm không hợp lệ

---

*Tài liệu được tạo ngày 22/07/2026 — dựa trên codebase MEP Metal ERP. Lần sửa cuối: 22/07/2026.*
