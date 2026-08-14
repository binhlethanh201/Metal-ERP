# Nghiệp vụ Nhập kho & Bảo hành qua Excel

## 1. File Excel Mẫu (Template)

Khi bấm nút "Tải file mẫu" trong form Nhập kho, hệ thống tạo file `mau_nhap_kho.xlsx` với cấu trúc:

| STT | Mã hàng | Tên hàng | ĐVT | Số lượng | Đơn giá nhập | **Bảo hành** |
|-----|---------|----------|-----|----------|-------------|---------------|
| 1 | SP-001 | Thép tấm 10mm | Tấm | 10 | 50000 | 12 tháng |
| 2 | SP-002 | Inox 304 tấm 1.5mm | Tấm | 5 | 76000 | 7 ngày |
| 3 | SP-003 | Thép ống D50 | Cây | 20 | 120000 | 2 năm |

### Cách điền cột "Bảo hành"

| Giá trị nhập | Kết quả parse | Ghi chú |
|-------------|---------------|---------|
| `12 tháng` | Period=12, Unit=MONTH | Chuẩn |
| `12 thang` | Period=12, Unit=MONTH | Không dấu vẫn được |
| `7 ngày` | Period=7, Unit=DAY | |
| `7 ngay` | Period=7, Unit=DAY | Không dấu |
| `2 năm` | Period=2, Unit=YEAR | |
| `2 nam` | Period=2, Unit=YEAR | Không dấu |
| `12` | Period=12, Unit=MONTH | Chỉ số -> mặc định Tháng |
| `12 months` | Period=12, Unit=MONTH | Tiếng Anh |
| `7 days` | Period=7, Unit=DAY | Tiếng Anh |
| `bảo hành 12 tháng` | Period=12, Unit=MONTH | Có text thừa |
| `0` hoặc để trống | Period=0, Unit=MONTH | Không bảo hành |
| `12 THÁNG` | Period=12, Unit=MONTH | Viết hoa |

---

## 2. Luồng Import Excel

### 2.1 Người dùng upload file

```
Form Nhập kho -> Bấm "Import Excel" -> Chọn file .xlsx/.xls/.csv
  -> parseImportExcelFile() đọc file
  -> Với mỗi dòng, parse cột "Bảo hành" (index 6) bằng parseWarrantyCell()
  -> Trả về mảng parsed items gồm: productCode, productName, unit, quantity, costPrice, warrantyPeriod, warrantyUnit
```

### 2.2 Code parseWarrantyCell()

```js
// File: src/modules/inventory/utils/excelTemplate.js

export const parseWarrantyCell = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s || s === '0') return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };

  // Tìm số đầu tiên trong chuỗi
  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };
  const period = parseInt(numMatch[1]);

  // Chỉ có số, ko có chữ -> mặc định MONTH
  const textAfter = s.replace(/\d+/g, '').trim().toLowerCase();
  if (!textAfter) return { warrantyPeriod: period, warrantyUnit: 'MONTH' };

  // Nhận diện đơn vị: ngày / tháng / năm (có dấu hoặc ko dấu, Anh-Việt)
  if (/ng[àa]y|day/i.test(textAfter)) return { warrantyPeriod: period, warrantyUnit: 'DAY' };
  if (/n[ăa]m|year/i.test(textAfter)) return { warrantyPeriod: period, warrantyUnit: 'YEAR' };
  return { warrantyPeriod: period, warrantyUnit: 'MONTH' };
};
```

### 2.3 Dữ liệu sau parse được map vào bảng

```js
// File: src/modules/inventory/pages/StockImport.jsx -> handleImportRows()

importItem = {
  ...matched,           // Thông tin sản phẩm từ DB
  id: key,
  quantity: Number(row.quantity || 0),
  costPrice: Number(row.costPrice || 0),
  warrantyPeriod: row.warrantyPeriod ?? matched?.warrantyPeriod ?? 0,
  warrantyUnit: row.warrantyUnit || matched?.warrantyUnit || 'MONTH',
};
```

---

## 3. Hiển thị trong Bảng Nhập kho

### 3.1 Cột "BẢO HÀNH" trong ImportItemsTable

```
+---------+----------+----------+-----+----------+-------------+------------------+
| Mã hàng | Tên hàng | ĐVT      | SL  | Đơn giá  | Thành tiền  | BẢO HÀNH         |
+---------+----------+----------+-----+----------+-------------+------------------+
| SP-001  | Thép 10mm| Tấm      | 10  | 50,000   | 500,000     | [12] [Tháng ▼]   |
| SP-002  | Inox 1.5 | Tấm      | 5   | 76,000   | 380,000     | [7]  [Ngày ▼]    |
| SP-003  | Ống D50  | Cây      | 20  | 120,000  | 2,400,000   | [0]  [Tháng ▼]   |
+---------+----------+----------+-----+----------+-------------+------------------+
```

Mỗi dòng có 2 ô:
- **Ô Number** (50px): Nhập số thời gian (0 = không BH, placeholder "0")
- **Ô Select** (65px): Chọn đơn vị [Ngày, Tháng, Năm]. Bị disable nếu period = 0

### 3.2 Code cột BẢO HÀNH

```jsx
// File: src/modules/inventory/components/stock/ImportItemsTable.jsx

{
  key: 'warranty',
  header: 'BẢO HÀNH',
  width: 130,
  render: (_, row) => {
    const period = row.warrantyPeriod ?? 0;
    const unit = row.warrantyUnit || 'MONTH';
    return (
      <div className="flex items-center gap-1">
        <input type="number" min="0" max="99"
          value={period || ''} placeholder="0"
          onChange={(e) => onUpdateItem(row.id, 'warrantyPeriod', parseInt(e.target.value) || 0)}
          className="w-[50px] ..."
        />
        <select value={unit}
          onChange={(e) => onUpdateItem(row.id, 'warrantyUnit', e.target.value)}
          disabled={period <= 0}
          className="w-[65px] ... disabled:opacity-40"
        >
          <option value="DAY">Ngày</option>
          <option value="MONTH">Tháng</option>
          <option value="YEAR">Năm</option>
        </select>
      </div>
    );
  },
}
```

---

## 4. Gửi về Backend

### 4.1 Payload

```js
// File: src/modules/inventory/pages/StockImport.jsx -> handleSubmit()

items: items.map((i) => ({
  quantity: Number(i.quantity || 0),
  costPrice: Number(i.costPrice || 0),
  warrantyPeriod: i.warrantyPeriod ?? 0,
  warrantyUnit: i.warrantyUnit || 'MONTH',
  note: '',
}))
```

### 4.2 Backend lưu vào DB

```csharp
// File: InwardInventoryController.cs

var ticketItem = new StockTicketItem
{
    ...
    WarrantyPeriod = item.WarrantyPeriod > 0 ? item.WarrantyPeriod : (product.WarrantyPeriod ?? 0),
    WarrantyUnit = !string.IsNullOrEmpty(item.WarrantyUnit) ? item.WarrantyUnit : (product.WarrantyUnit ?? "MONTH"),
    WarrantyExpiryDate = ComputeWarrantyExpiry(DateTime.UtcNow, warrantyPeriod, warrantyUnit)
};

// Helper:
private static DateTime? ComputeWarrantyExpiry(DateTime baseDate, int period, string unit)
{
    if (period <= 0) return null;
    return (unit?.ToUpper()) switch
    {
        "DAY" => baseDate.AddDays(period),
        "YEAR" => baseDate.AddYears(period),
        _ => baseDate.AddMonths(period)  // MONTH hoặc mặc định
    };
}
```

---

## 5. Ảnh hưởng đến Bảo hành (Warranty)

### 5.1 Tra cứu NCC (GetSuggestedSuppliers)

Khi Owner tra cứu NCC để gửi bảo hành, API **CHỈ LỌC các lô còn hạn BH**:

```csharp
// WarrantyController.cs
.Where(sti => sti.WarrantyExpiryDate == null || sti.WarrantyExpiryDate >= DateTime.UtcNow)
```

Nếu `WarrantyExpiryDate = null` (Period = 0, không BH) -> vẫn hiển thị (coi như không giới hạn).  
Nếu `WarrantyExpiryDate < UtcNow` -> **KHÔNG hiển thị** (hết hạn BH).

### 5.2 Hiển thị trong dropdown NCC

```
Tên NCC A — Hạn mức: 10 sp (Hạn BH: 15/08/2027)
Tên NCC B — Hạn mức: 5 sp (Hạn BH: 01/06/2026) [KHÔNG ĐỦ]
```

---

## 6. Danh sách file liên quan

| File | Vai trò |
|------|---------|
| `src/modules/inventory/utils/excelTemplate.js` | Template Excel + `parseWarrantyCell()` + `parseImportExcelFile()` |
| `src/modules/inventory/components/stock/ImportItemsTable.jsx` | Cột "BẢO HÀNH" (Number + Select) |
| `src/modules/inventory/pages/StockImport.jsx` | `addProductToTicket`, `handleImportRows`, submit payload |
| `Controllers/InventoryController/InwardInventoryController.cs` | `ComputeWarrantyExpiry()`, lưu StockTicketItem |
| `Controllers/SaleController/WarrantyController.cs` | `GetSuggestedSuppliers` lọc theo `WarrantyExpiryDate` |
| `Models/Product.cs` | `WarrantyPeriod` + `WarrantyUnit` |
| `Models/StockTicketItem.cs` | `WarrantyPeriod` + `WarrantyUnit` + `WarrantyExpiryDate` |
| `DTOs/InventoryDTOs/ProductDto.cs` | `InwardInventoryItemDto`, `ProductSearchResultDto` |