# Fix lỗi "Price override below floor price" (MSG-63)

## Mô tả lỗi

Khi bán sản phẩm **Dây điện Cadivi 2x1.5 (100m)** với đơn vị quy đổi **"Mét"** thông qua POS (phương thức Chuyển khoản), backend trả về lỗi:

```
MSG-63: Price override below floor price
```

## Phân tích nguyên nhân

### Dữ liệu sản phẩm

| Field | Giá trị |
|-------|---------|
| `productName` | Dây điện Cadivi 2x1.5 (100m) |
| `baseUnit` | Cuộn |
| `costPrice` | 850,000 |
| `salePrice` | 1,050,000 |

### Đơn vị quy đổi (product_conversion_units)

| unit_name | convert_value | price |
|-----------|--------------|-------|
| Cuộn | 100 | 1,050,000 |
| Mét | 1 | 10,500 |

### Luồng xử lý

Trong `InvoicesController.cs`, khi thêm item vào hóa đơn:

1. Người dùng chọn đơn vị **"Mét"** (khác baseUnit "Cuộn")
2. Backend lấy `convertValue = 1` và `unitPrice = 10,500` từ bảng `product_conversion_units`
3. Dòng **287** kiểm tra:
   ```csharp
   if (unitPrice < bp.CostPrice) // 10,500 < 850,000 → TRUE → lỗi!
   ```
4. **Sai:** So sánh giá 1 Mét (10,500) với giá nhập 1 Cuộn (850,000) mà không scale theo đơn vị

### Công thức scale đúng

```
effectiveCost = bp.CostPrice * convertValue / baseConvertValue

Với "Mét":   effectiveCost = 850,000 × 1 / 100 = 8,500
             → 10,500 < 8,500? → false → OK

Với "Cuộn":  effectiveCost = 850,000 × 100 / 100 = 850,000
             → 1,050,000 < 850,000? → false → OK
```

## File cần sửa

**Đường dẫn:** `Controllers/SaleController/InvoicesController.cs`

### Dòng 287

**Code cũ:**
```csharp
if (unitPrice < bp.CostPrice) 
    return BadRequest(ApiErrorResponse.Create("MSG-63", "Price override below floor price"));
```

**Code mới:**
```csharp
if (unitPrice < bp.CostPrice * convertValue / (bp.Product.ProductConversionUnits.FirstOrDefault(u => u.UnitName == bp.Product.BaseUnit)?.ConvertValue ?? 1m))
    return BadRequest(ApiErrorResponse.Create("MSG-63", "Price override below floor price"));
```

### Giải thích

- `convertValue`: hệ số quy đổi của đơn vị đang chọn (lấy từ `convUnit.ConvertValue` ở dòng 267)
- `baseConvertValue`: hệ số quy đổi của đơn vị cơ sở (tìm trong bảng `ProductConversionUnits` theo `BaseUnit`)
- Khi không có đơn vị quy đổi: `convertValue = 1m`, `baseConvertValue ?? 1m` → kiểm tra giữ nguyên như cũ

## Lưu ý về dữ liệu

Giá trị `convert_value = 1` cho đơn vị "Mét" có thể gây **sai số lượng khi trừ kho** (mua 1 Mét trừ 1 Cuộn). Cần kiểm tra lại:

```sql
SELECT * FROM product_conversion_units 
WHERE product_id = '80340d2f-b3b3-4b3a-811c-79900acd0a3a';
```

Nếu `convert_value` của "Mét" là `1` thì đáng lẽ phải là `0.01` (1 Mét = 0.01 Cuộn).
