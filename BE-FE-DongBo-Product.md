# TAI LIEU KIEM TRA DONG BO BACKEND - FRONTEND
## Module: San pham (Hang hoa) - MetalERP

**Ngay kiem tra:** 27/05/2026
**Pham vi:** Form Them/Sua san pham + POS + Bang san pham + Detail panel
**Backend API:** GET /api/products (du lieu JSON da cung cap)

---

## 1. DANH SACH FIELD BACKEND HIEN TAI

Du lieu BE tra ve dang:

```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 46,
  "totalPages": 3,
  "data": [
    {
      "ProductId": "uuid",
      "ProductCode": "SP001",
      "ProductName": "Bua sat can go 500g",
      "Barcode": "893100000001",
      "Unit": "Cai",
      "Specification": "500g",
      "CostPrice": 85000,
      "SellPrice": 0,
      "ActualStock": 0,
      "ReservedStock": 0,
      "AvailableStock": 0,
      "MinimumStock": 0,
      "ShelfLocation": null,
      "IsActive": true,
      "ImageUrl": "https://...",
      "CategoryName": "Kim Khi",
      "BrandName": "Stanley",
      "CreatedAt": "2026-05-16T03:08:02.198285"
    }
  ]
}
```

**Tong cong BE cung cap: 18 field**

---

## 2. KET QUA KIEM TRA TUNG MAN HINH

### 2.1. BANG SAN PHAM (ProductTable) - 11 cot

| STT | Cot | Field nguon (FE) | Field BE | Ket qua |
|-----|-----|------------------|----------|---------|
| 1 | Ma hang | `productCode` / `id` | `ProductCode` | OK |
| 2 | Ten hang | `name` | `ProductName` | OK |
| 3 | Nhom hang | `group` | `CategoryName` | OK |
| 4 | Don vi | `unit` | `Unit` | OK |
| 5 | Thuong hieu | `brand` | `BrandName` | OK |
| 6 | Gia ban | `salePrice` | `SellPrice` | OK |
| 7 | Gia von | `costPrice` | `CostPrice` | OK |
| 8 | Ton kho | `stock` | `ActualStock` | OK |
| 9 | Vi tri kho | `location` | `ShelfLocation` | OK |
| 10 | Trang thai | `status` | (tinh tu `ActualStock`) | OK |
| 11 | Thoi gian tao | `createdAt` | `CreatedAt` | OK |

> **Ket luan: 11/11 cot hoat dong. Khong thieu field nao.**

---

### 2.2. DETAIL PANEL (ProductDetailPanel) - 11 field

| STT | Field hien thi | Field nguon (FE) | Field BE | Ket qua |
|-----|---------------|------------------|----------|---------|
| 1 | Nhom hang | `row.group` | `CategoryName` | OK |
| 2 | Ma hang | `row.productCode` / `row.id` | `ProductCode` | OK |
| 3 | Gia von | `row.costPrice` | `CostPrice` | OK |
| 4 | Trong luong | `row.weight` | **KHONG CO** | HIEN "Chua co" |
| 5 | Ma vach | `row.barcode` | `Barcode` | OK |
| 6 | Gia ban | `row.salePrice` | `SellPrice` | OK |
| 7 | Kich thuoc | `row.dimension` | (tu `Specification`) | OK (fallback) |
| 8 | Ton kho | `row.stock` | `ActualStock` | OK |
| 9 | Thuong hieu | `row.brand` | `BrandName` | OK |
| 10 | Dinh muc ton | `row.stockLevel` | (tu `MinimumStock`) | OK |
| 11 | Vi tri | `row.location` | `ShelfLocation` | OK |

> **Ket luan: 10/11 field OK. 1 field bi thieu: Trong luong (BE chua co `Weight`).**

---

### 2.3. FORM SUA / TAO MOI SAN PHAM (EditProductModal + ProductInfoTab)

#### 2.3.1. Nhom field CO BAN - HOAT DONG HOAN TOAN

| # | Field trong Form | Load tu BE | Save ve BE (payload) | Trang thai |
|---|---|---|---|---|
| 1 | **Ma hang** | `ProductCode` | `ProductCode` | OK |
| 2 | **Ma vach** | `Barcode` | `Barcode` | OK |
| 3 | **Ten hang** | `ProductName` | `ProductName` | OK |
| 4 | **Nhom hang** (select) | `CategoryName` | `CategoryName` | OK |
| 5 | **Thuong hieu** (select) | `BrandName` | `BrandName` | OK |
| 6 | **Anh** (1 anh) | `ImageUrl` | `ImageUrl` | OK |
| 7 | **Ton kho hien tai** | `ActualStock` | `ActualStock` | OK |
| 8 | **Dinh muc ton thap nhat** | `MinimumStock` | `MinimumStock` | OK |
| 9 | **Gia von** | `CostPrice` | `CostPrice` | OK |
| 10 | **Gia ban** | `SellPrice` | `SellPrice` | OK |
| 11 | **Vi tri** (1 vi tri) | `ShelfLocation` | `ShelfLocation` | OK |
| 12 | **Don vi tinh** | `Unit` | `Unit` | OK |
| 13 | **Trang thai** | `IsActive` -> `productStatus` | `IsActive` | OK |
| 14 | **Specification** (chuoi gop) | `Specification` | `Specification` (qua `buildSpecification`) | OK |

> **Tong: 14 field co ban hoat dong hoan toan.**

#### 2.3.2. Nhom field CO UI NHUNG PAYLOAD KHONG GUI LEN BE

| # | Field trong Form | Vi tri UI | BE co field? | Payload co gui? | Can BE them |
|---|---|---|---|---|---|
| 1 | **Trong luong** | Section "Vi tri, trong luong" | KHONG | KHONG | `Weight` (decimal/string) |
| 2 | **Don vi trong luong** (g/kg) | Select ben canh | KHONG | KHONG | `WeightUnit` (string) |
| 3 | **Rong** | Input "Rong" | KHONG | KHONG | `Width` (decimal/string) |
| 4 | **Dai** | Input "Dai" | KHONG | KHONG | `Length` (decimal/string) |
| 5 | **Don vi kich thuoc** (mm/cm/m) | Select ben canh | KHONG | KHONG | `SizeUnit` (string) |
| 6 | **Dinh muc ton cao nhat** | Input "Cao nhat" | KHONG | KHONG | `MaximumStock` (int) |
| 7 | **Ban truc tiep** | Checkbox footer | KHONG | KHONG | `DirectSale` (boolean) |

> **Tong: 7 field co UI nhung khong duoc luu. CAN BE BO SUNG GAP.**

#### 2.3.3. Nhom field NANG CAO - CO UI, PAYLOAD KHONG GUI

| # | Field trong Form | Vi tri UI | Can BE them |
|---|---|---|---|
| 1 | **Nhieu anh** (toi da 5) | ImageUploader | `Images` (array of URL strings) |
| 2 | **Thuoc tinh** (ten + gia tri) | AttributeEditor | `Attributes` (array of {name, value}) |
| 3 | **Don vi quy doi** | UnitManagement | `ConversionUnits` (array) |
| 4 | **Nhieu vi tri kho** | Chip/tag locations | `ShelfLocations` (array of strings) |

> **Tong: 4 field nang cao. NEN CO SOM.**

#### 2.3.4. Nhom field FILTER SIDEBAR CAN NHUNG BE CHUA CO

| # | Field | Vi tri | Can BE them |
|---|---|---|---|
| 1 | **Nha cung cap** | Filter sidebar | `SupplierName` (string) |
| 2 | **Loai hang** | Filter sidebar | `ItemType` (string) |
| 3 | **Lien ket kenh ban** | Filter sidebar | `SalesChannelLinked` (boolean) |
| 4 | **Du kien het hang** | Filter sidebar | `EstimatedOutAt` (datetime) |

> **Tong: 4 field. CAN NHAC SAU.**

---

### 2.4. MAN HINH POS (Point of Sale)

| # | Field trong ProductCard | Field nguon FE | Field BE goc | Ket qua |
|---|---|---|---|---|
| 1 | Anh | `image` | `ImageUrl` | OK |
| 2 | Ten SP | `name` | `ProductName` | OK |
| 3 | Gia | `price` | `SellPrice` | OK |
| 4 | SKU | `sku` | `ProductCode` | OK |
| 5 | Ton kho | `stock` | `ActualStock` | OK |
| 6 | Trang thai | `status` | (tinh tu `ActualStock`) | OK |
| 7 | Danh muc (tab) | `category` | `CategoryName` | OK (tu dong tao tu du lieu) |

> **Ket luan: POS hoat dong hoan toan voi du lieu BE. 7/7 field OK.**
> **Danh muc POS tu dong sinh tu `CategoryName` cua san pham trong kho.**

---

## 3. VAN DE DATA LOSS - `buildSpecification`

### Mo ta:

Ham `buildSpecification` trong `productUtils.js` co logic:

```js
if (form.specification) return form.specification;  // Uu tien chuoi cu
// Sau do moi combine width + length + weight
```

**Hau qua:** Khi user sua width/length/weight trong form, luc save van giu gia tri `Specification` cu tu BE, bo qua thay doi moi.

### Can fix FE:

> **Sua `buildSpecification` de uu tien width/length/weight rieng le hon chuoi `specification` cu khi nguoi dung da nhap.**

---

## 4. DU LIEU MAU BE - CAC VAN DE THUC TE

| Van de | Mo ta | Anh huong |
|--------|-------|-----------|
| `SellPrice = 0` | SP001, SP007 co gia ban = 0 | POS hien thi 0d |
| `ActualStock = 0` | TAT CA san pham ton = 0 | Toan bo hien "Het hang" |
| `ShelfLocation = null` | TAT CA vi tri = null | Cot vi tri trong |
| `ImageUrl` dang base64 | SP002 dung `data:image/webp;base64,...` | Cham load, ton RAM |

---

## 5. TONG KET

### BE hien tai: 18 field

### FE can tu BE: 33 field (da bao gom ca filter + nang cao)

### Muc do hoan thien:

| Pham vi | Tong field FE can | BE da co | Con thieu | % Hoan thien |
|----------|-------------------|----------|-----------|--------------|
| Bang san pham | 11 | 11 | 0 | 100% |
| Detail panel | 11 | 10 | 1 (Weight) | 91% |
| Form co ban | 14 | 14 | 0 | 100% |
| Form mo rong | 7 | 0 | 7 | 0% |
| Form nang cao | 4 | 0 | 4 | 0% |
| Filter sidebar | 4 | 0 | 4 | 0% |
| POS | 7 | 7 | 0 | 100% |

### Hanh dong can lam:

**BE can bo sung (theo thu tu uu tien):**

```
PRIORITY 1 - Gap:
  Weight, WeightUnit, Width, Length, SizeUnit, MaximumStock, DirectSale

PRIORITY 2 - Som:
  Images[], Attributes[], ConversionUnits[], ShelfLocations[]

PRIORITY 3 - Can nhac:
  SupplierName, ItemType, SalesChannelLinked, EstimatedOutAt
```

**FE can sua:**
- Ham `buildSpecification` trong `productUtils.js` - uu tien width/length/weight moi khi nguoi dung da nhap
- Them height vao `buildSpecification` (hien tai da co field height trong form nhung buildSpecification chua xu ly dung)

---

## 6. CAU TRUC JSON BE MONG MUON (FULL)

Day la cau truc day du FE can de tat ca tinh nang hoat dong:

```json
{
  "ProductId": "uuid",
  "ProductCode": "SP001",
  "ProductName": "Bua sat can go 500g",
  "Barcode": "893100000001",
  "Unit": "Cai",
  "Specification": "500g",
  "CostPrice": 85000,
  "SellPrice": 120000,
  "ActualStock": 50,
  "ReservedStock": 5,
  "AvailableStock": 45,
  "MinimumStock": 10,
  "MaximumStock": 100,
  "ShelfLocation": "Ke A1",
  "ShelfLocations": ["Ke A1", "Ke B2"],
  "IsActive": true,
  "DirectSale": true,
  "ImageUrl": "https://...",
  "Images": ["https://...", "https://..."],
  "CategoryName": "Kim Khi",
  "BrandName": "Stanley",
  "SupplierName": "Stanley Viet Nam",
  "ItemType": "Hang hoa thuong",
  "SalesChannelLinked": true,
  "Weight": "3.6",
  "WeightUnit": "kg",
  "Width": "30",
  "Length": "15",
  "Height": "20",
  "SizeUnit": "cm",
  "Attributes": [
    { "name": "Mau sac", "value": "Do" }
  ],
  "ConversionUnits": [
    {
      "name": "Thung",
      "convertValue": 20,
      "convertFrom": "Cai",
      "price": 2400000,
      "directSale": true
    }
  ],
  "EstimatedOutAt": "2026-06-15T00:00:00",
  "CreatedAt": "2026-05-16T03:08:02.198285"
}
```
