# Nghiệp vụ Import Excel Nhập Kho & Bảo Hành

## Tổng quan

Luồng import Excel từ file `.xlsx/.xls/.csv` vào form Nhập kho, bao gồm parse cột Bảo hành (thời hạn + đơn vị).

---

## 1. File Excel Mẫu

Tải bằng nút "Tải file mẫu" trong form Nhập kho. Cấu trúc:

| STT | Mã hàng | Tên hàng | ĐVT | Số lượng | Đơn giá nhập | Bảo hành |
|-----|---------|----------|-----|----------|-------------|----------|
| 1 | SP-001 | Thép tấm 10mm | Tấm | 10 | 50000 | 12 tháng |
| 2 | SP-002 | Inox 304 | Tấm | 5 | 76000 | 7 ngày |
| 3 | SP-003 | Ống D50 | Cây | 20 | 120000 | 2 năm |

### Cách điền cột "Bảo hành"

| Nhập | Kết quả |
|------|---------|
| `12 tháng` / `12 thang` / `12 THÁNG` / `12 months` | Period=12, MONTH |
| `7 ngày` / `7 ngay` / `7 days` | Period=7, DAY |
| `2 năm` / `2 nam` / `2 years` | Period=2, YEAR |
| `12` (chỉ số) | Period=12, MONTH |
| `0` hoặc để trống | Period=0, MONTH (không BH) |
| `bảo hành 12 tháng` (có text thừa) | Period=12, MONTH |

---

## 2. Luồng dữ liệu Import Excel

```
Người dùng chọn file Excel
  │
  ▼
parseImportExcelFile(file)                    [excelTemplate.js]
  │  - Đọc file bằng thư viện XLSX (CDN)
  │  - Tìm cột bằng tên (dynamic header detection)
  │  - Parse cột "Bảo hành" = parseWarrantyCell()
  │  - Trả về { success, data: [...] }
  │     Mỗi item: { productCode, productName, unit, quantity, costPrice, warrantyPeriod, warrantyUnit }
  │
  ▼
ImportItemsTable.handleFileChange()           [ImportItemsTable.jsx]
  │  - Match với products trong DB
  │  - Đóng gói vào importRows (có warrantyPeriod, warrantyUnit)
  │  - Gọi onImportRows(importRows)
  │
  ▼
StockImport.handleImportRows()                [StockImport.jsx]
  │  - Merge vào state items
  │  - Ưu tiên Excel > DB default
  │
  ▼
ImportItemsTable render cột "BẢO HÀNH"        [ImportItemsTable.jsx]
  │  - Input number (warrantyPeriod)
  │  - Select (warrantyUnit: Ngày/Tháng/Năm)
  │
  ▼
StockImport.handleSubmit()                    [StockImport.jsx]
  │  - Payload gửi API: { warrantyPeriod, warrantyUnit }
  │
  ▼
InwardInventoryController.CreateInward()      [Backend]
  │  - Lưu StockTicketItem: WarrantyPeriod, WarrantyUnit, WarrantyExpiryDate
  │  - ComputeWarrantyExpiry(): DAY->AddDays, MONTH->AddMonths, YEAR->AddYears
```

---

## 3. Code chi tiết

### 3.1 excelTemplate.js - Parse file Excel

**File:** `src/modules/inventory/utils/excelTemplate.js`

```js
// Template headers
const EXCEL_TEMPLATE_HEADERS = [
  'STT', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Số lượng', 'Đơn giá nhập', 'Bảo hành',
];

// Parse ô "Bảo hành" - linh hoạt
export const parseWarrantyCell = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s || s === '0') return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };

  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return { warrantyPeriod: 0, warrantyUnit: 'MONTH' };
  const period = parseInt(numMatch[1]);

  const textAfter = s.replace(/\d+/g, '').trim().toLowerCase();
  if (!textAfter) return { warrantyPeriod: period, warrantyUnit: 'MONTH' };

  if (/ng[àa]y|day/i.test(textAfter)) return { warrantyPeriod: period, warrantyUnit: 'DAY' };
  if (/n[ăa]m|year/i.test(textAfter)) return { warrantyPeriod: period, warrantyUnit: 'YEAR' };
  return { warrantyPeriod: period, warrantyUnit: 'MONTH' };
};

// Dynamic header detection - KO phụ thuộc vị trí cột
const findColIndex = (keywords) => {
  return normalizedHeaders.findIndex((h) => {
    const norm = h.toLowerCase().replace(/\s+/g, '');
    return keywords.some((kw) => norm.includes(kw.toLowerCase().replace(/\s+/g, '')));
  });
};

const idxWarranty = findColIndex(['bảo hành', 'bao hanh', 'bh', 'warranty', 'bảo']);

// Fallback: tìm qua object keys nếu index không tìm thấy
const extractRawWarrantyValue = (rowObj) => {
  if (!rowObj || typeof rowObj !== 'object') return null;
  const keys = Object.keys(rowObj);
  const warrantyKey = keys.find((k) => {
    const nk = String(k).toLowerCase().trim();
    return nk.includes('bảo hành') || nk.includes('bao hanh') || nk.includes('bh') || nk.includes('warranty');
  });
  return warrantyKey ? rowObj[warrantyKey] : null;
};

// Kết hợp cả 2 cách
const warrantyRaw = getVal(row, idxWarranty) || extractRawWarrantyValue(rowObj);
const { warrantyPeriod, warrantyUnit } = parseWarrantyCell(warrantyRaw);
```

### 3.2 ImportItemsTable.jsx - Map dữ liệu parse -> importRows

**File:** `src/modules/inventory/components/stock/ImportItemsTable.jsx`

```jsx
// QUAN TRỌNG: Phải truyền warrantyPeriod và warrantyUnit vào importRows
importRows.push({
  productCode: row.productCode,
  productName: row.productName,
  unitName: row.unitName || row.unit,
  quantity: row.quantity,
  costPrice: row.costPrice,
  warrantyPeriod: row.warrantyPeriod ?? 0,    // <-- BẮT BUỘC
  warrantyUnit: row.warrantyUnit || 'MONTH',  // <-- BẮT BUỘC
  matchedProduct: matchedProduct || null,
});

// Cột BẢO HÀNH trong bảng
{
  key: 'warranty',
  header: 'BẢO HÀNH',
  width: 130,
  render: (_, row) => {
    const period = row.warrantyPeriod ?? 0;
    const unit = row.warrantyUnit || 'MONTH';
    return (
      <div className="flex items-center gap-1">
        <input type="number" min="0" max="999"
          value={period === 0 ? '' : period}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0);
            onUpdateItem(row.id, 'warrantyPeriod', val);
          }}
        />
        <select value={unit}
          onChange={(e) => onUpdateItem(row.id, 'warrantyUnit', e.target.value)}
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

### 3.3 StockImport.jsx - Merge vào state + Gửi API

**File:** `src/modules/inventory/pages/StockImport.jsx`

```js
// handleImportRows: merge dữ liệu Excel vào state
// Ưu tiên 1: Excel, Ưu tiên 2: DB default, Ưu tiên 3: 0
warrantyPeriod: row.warrantyPeriod !== undefined && row.warrantyPeriod !== null
  ? Number(row.warrantyPeriod)
  : (matched?.warrantyPeriod ?? 0),
warrantyUnit: row.warrantyUnit || matched?.warrantyUnit || 'MONTH',

// addProductToTicket: thêm sản phẩm từ dropdown
return [...current, {
  ...product, id: key, quantity: 1, costPrice: product.costPrice || 0,
  warrantyPeriod: product.warrantyPeriod ?? 0,
  warrantyUnit: product.warrantyUnit || 'MONTH',
}];

// handleSubmit: gửi payload
items: items.map((i) => ({
  quantity: Number(i.quantity || 0),
  costPrice: Number(i.costPrice || 0),
  warrantyPeriod: i.warrantyPeriod ?? 0,
  warrantyUnit: i.warrantyUnit || 'MONTH',
  note: '',
}))
```

### 3.4 Backend - InwardInventoryController.cs

**File:** `Controllers/InventoryController/InwardInventoryController.cs`

```csharp
var ticketItem = new StockTicketItem
{
    ...
    WarrantyPeriod = item.WarrantyPeriod > 0
        ? item.WarrantyPeriod
        : (branchProduct.Product?.WarrantyPeriod ?? 0),
    WarrantyUnit = !string.IsNullOrEmpty(item.WarrantyUnit)
        ? item.WarrantyUnit
        : (branchProduct.Product?.WarrantyUnit ?? "MONTH"),
    WarrantyExpiryDate = ComputeWarrantyExpiry(
        DateTime.UtcNow, warrantyPeriod, warrantyUnit)
};

// Helper tính ngày hết hạn BH
private static DateTime? ComputeWarrantyExpiry(DateTime baseDate, int period, string unit)
{
    if (period <= 0) return null;
    return (unit?.ToUpper()) switch
    {
        "DAY"   => baseDate.AddDays(period),
        "YEAR"  => baseDate.AddYears(period),
        _       => baseDate.AddMonths(period)  // MONTH hoặc mặc định
    };
}
```

### 3.5 Backend - Models

**File:** `Models/Product.cs`
```csharp
public int WarrantyPeriod { get; set; } = 12;
public string WarrantyUnit { get; set; } = "MONTH";
```

**File:** `Models/StockTicketItem.cs`
```csharp
public int WarrantyPeriod { get; set; }
public string WarrantyUnit { get; set; } = "MONTH";
public DateTime? WarrantyExpiryDate { get; set; }
```

### 3.6 Backend - DTOs

**File:** `DTOs/InventoryDTOs/ProductDto.cs`
```csharp
// InwardInventoryItemDto
public int WarrantyPeriod { get; set; }
public string WarrantyUnit { get; set; } = "MONTH";

// ProductSearchResultDto
public int WarrantyPeriod { get; set; }
public string WarrantyUnit { get; set; } = "MONTH";
```

---

## 4. Danh sách file liên quan

| # | File | Vai trò |
|---|------|---------|
| 1 | `src/modules/inventory/utils/excelTemplate.js` | Template Excel, parseWarrantyCell, parseImportExcelFile, dynamic header |
| 2 | `src/modules/inventory/components/stock/ImportItemsTable.jsx` | Map parse result -> importRows (có warranty), render cột BẢO HÀNH |
| 3 | `src/modules/inventory/pages/StockImport.jsx` | handleImportRows, addProductToTicket, handleSubmit |
| 4 | `Controllers/InventoryController/InwardInventoryController.cs` | ComputeWarrantyExpiry, lưu StockTicketItem |
| 5 | `Models/Product.cs` | WarrantyPeriod + WarrantyUnit |
| 6 | `Models/StockTicketItem.cs` | WarrantyPeriod + WarrantyUnit + WarrantyExpiryDate |
| 7 | `DTOs/InventoryDTOs/ProductDto.cs` | InwardInventoryItemDto, ProductSearchResultDto |
| 8 | `Models/MEPDatabaseContext.cs` | Fluent API config |

---

## 5. Bug đã fix

**Root cause:** `ImportItemsTable.jsx` dòng 92-99 khi map `result.data` -> `importRows` **không truyền `warrantyPeriod` và `warrantyUnit`** -> dữ liệu bảo hành bị mất trước khi đến `handleImportRows`.

**Fix:** Thêm 2 field vào object push trong `importRows`:
```js
warrantyPeriod: row.warrantyPeriod ?? 0,
warrantyUnit: row.warrantyUnit || 'MONTH',
```