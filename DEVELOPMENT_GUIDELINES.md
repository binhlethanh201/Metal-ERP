# Metal-ERP - Hướng dẫn Phát triển & Quy chuẩn Code

> **Mục tiêu:** Đảm bảo mọi thành viên trong team viết code nhất quán, dễ đọc, dễ bảo trì và dễ mở rộng. Tài liệu này là nguồn tham chiếu duy nhất (single source of truth) cho mọi quyết định về tổ chức code.

---

## Mục lục

1. [Tech Stack](#1-tech-stack)
2. [Kiến trúc Tổng thể](#2-kiến-trúc-tổng-thể)
3. [Luồng Dữ liệu (Data Flow)](#3-luồng-dữ-liệu-data-flow)
4. [Quy tắc Đặt tên](#4-quy-tắc-đặt-tên)
5. [Quy tắc Tổ chức File & Thư mục](#5-quy-tắc-tổ-chức-file--thư-mục)
6. [Cách tạo Module / Page Mới](#6-cách-tạo-module--page-mới)
7. [Quy tắc Chia Component](#7-quy-tắc-chia-component)
8. [Quy tắc Viết Component](#8-quy-tắc-viết-component)
9. [Quy tắc Sử dụng Icon](#9-quy-tắc-sử-dụng-icon)
10. [Quy tắc Viết Hook](#10-quy-tắc-viết-hook)
11. [Quy tắc Viết Service & API Call](#11-quy-tắc-viết-service--api-call)
12. [Quy tắc Styling với Tailwind](#12-quy-tắc-styling-với-tailwind)
13. [Quy tắc Xử lý Mock Data](#13-quy-tắc-xử-lý-mock-data)
14. [Quy tắc Import](#14-quy-tắc-import)
15. [Quy tắc Chung](#15-quy-tắc-chung)
16. [Checklist Code Review](#16-checklist-code-review)

---

## 1. Tech Stack

| Lớp | Công nghệ | Version |
|-----|-----------|---------|
| Framework | React | 19.2.6 |
| Routing | react-router-dom | 7.15.0 |
| Styling | Tailwind CSS | 3.4.4 |
| Icons | lucide-react | 1.14.0 |
| Build Tool | react-scripts (CRA) | 5.0.1 |
| Code Format | Prettier + prettier-plugin-tailwindcss | 3.8.3 |
| Git Hooks | Husky + lint-staged | 9.x / 17.x |

---

## 2. Kiến trúc Tổng thể

Dự án dùng **Module-based Architecture**. Mỗi phân hệ nghiệp vụ là 1 module độc lập, có cấu trúc nội bộ giống hệt nhau.

```
src/
├── services/              ← API toàn cục (apiClient, endpoints, authService)
├── shared/                ← Mọi thứ dùng chung
│   ├── components/        ← UI components dùng chung (Button, Modal, Table, Icon...)
│   │   └── layout/        ← Layout components (Sidebar, Header, PrivateRoute)
│   ├── hooks/             ← Hooks dùng chung (useAuth, useDebounce)
│   ├── utils/             ← Utility functions (formatCurrency, formatDate)
│   └── data/              ← Mock data dùng chung (mockUsers)
│
├── modules/               ← Các phân hệ nghiệp vụ
│   ├── inventory/         ← Tổng kho
│   ├── pos/               ← Bán hàng
│   ├── forum/             ← Diễn đàn
│   └── admin/             ← Quản trị
│       └── <mỗi module có cấu trúc con giống hệt nhau>:
│           ├── components/   ← Component đặc thù (theo feature)
│           │   ├── home/     ← Cho Dashboard
│           │   ├── product/  ← Cho Product (table, filter, form...)
│           │   └── modals/   ← Các modal
│           ├── data/         ← Mock data + page config
│           ├── hooks/        ← Custom hooks (business logic)
│           ├── layouts/      ← Layout wrapper (dùng <Outlet />)
│           ├── pages/        ← Page components (đầu vào của route)
│           ├── services/     ← API service layer
│           └── utils/        ← Utilities riêng
│
├── pages/                 ← Trang độc lập (Landing, Login, Register, 404, 403, 500)
├── assets/                ← Ảnh, fonts, resources tĩnh
├── styles/                ← CSS toàn cục (index.css)
├── App.js                 ← Cây route gốc (lazy load từng module)
└── index.js               ← Entry point
```

---

## 3. Luồng Dữ liệu (Data Flow)

Mọi dữ liệu đi qua **6 tầng** cố định, không được bỏ tầng hay đi tắt:

```
[Backend API]
    ↓  1. fetch() với base URL + timeout + auth header
apiClient.js            ← src/services/apiClient.js
    ↓  2. URL endpoint được định nghĩa tập trung
endpoints.js            ← src/services/endpoints.js
    ↓  3. Thin wrapper, mỗi function = 1 API call
<module>Service.js      ← src/modules/<name>/services/<name>Service.js
    ↓  4. Gọi service, quản lý state (useState/useEffect), fallback mock data
use<Feature>.js         ← src/modules/<name>/hooks/use<Feature>.js
    ↓  5. Orchestrate hooks, xử lý event handlers, truyền data xuống
<PageComponent>.jsx     ← src/modules/<name>/pages/<Page>.jsx
    ↓  6. Nhận props, render UI thuần
<UIComponent>.jsx       ← src/modules/<name>/components/<feature>/<Comp>.jsx
```

**Ví dụ cụ thể - Luồng "Xem danh sách sản phẩm":**

```
1. apiClient.js
   → fetch('http://localhost:3000/api/api/products?Page=1&PageSize=100', {
       headers: { Authorization: 'Bearer <token>' }
     })

2. endpoints.js
   → ENDPOINTS.INVENTORY.GET_PRODUCTS = '/api/products'

3. inventoryService.js
   → export const getProducts = (filters) =>
       apiGet(`/api/products?Page=1&PageSize=100`)

4. useProductList.js
   → const [products, setProducts] = useState(inventoryRows)
   → useEffect(() => { getProducts().then(normalize).catch(fallback) }, [token])
   → return { products, handleSaveProduct, handleDeleteProduct }

5. InventoryProduct.jsx
   → const { products, handleSaveProduct, handleDeleteProduct } = useProductList()
   → const filters = useProductFilters(products)
   → <ProductTable rows={displayedRows} onEdit={...} onDelete={...} />

6. ProductTable.jsx
   → Nhận props: rows, sortConfig, onEdit, onDelete
   → Render <table> với Tailwind
```

---

## 4. Quy tắc Đặt tên

### 4.1 File & Folder

| Loại | Quy tắc | Đúng | Sai |
|------|---------|------|-----|
| Component file | `PascalCase.jsx` | `ProductTable.jsx` | `productTable.jsx`, `product-table.jsx` |
| Hook file | `camelCase.js`, bắt đầu `use` | `useProductList.js` | `UseProductList.js`, `productListHook.js` |
| Service file | `camelCase.js`, kết thúc `Service` | `inventoryService.js` | `InventoryService.js`, `inventory.js` |
| Utility file | `camelCase.js` | `productUtils.js` | `ProductUtils.js`, `product-utils.js` |
| Data/Mock file | `camelCase.js` | `inventoryMockData.js` | `inventory-mock-data.js` |
| Page config file | `camelCase.js` | `inventoryPageData.js` | `pageData.js` |
| Tên module | `lowercase` | `inventory` | `Inventory`, `inventory-module` |
| Feature folder | `lowercase` | `product`, `home` | `Product`, `ProductPage` |

### 4.2 Biến & Hàm

```jsx
// ✅ ĐÚNG - camelCase
const productList = [];
const handleSaveProduct = () => {};
const isLoading = false;
const getUserFullName = () => {};

// ❌ SAI
const ProductList = [];        // PascalCase chỉ dành cho Component / Class
const handle_save_product = (); // snake_case
const GetUserFullName = ();    // PascalCase cho function thường
```

### 4.3 Component & Props

```jsx
// ✅ ĐÚNG - PascalCase cho component
export const ProductTable = ({ rows, onEdit, onDelete }) => { ... };

// ✅ ĐÚNG - camelCase cho props, on<Event> cho callback
<ProductTable
  rows={data}
  isLoading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// ❌ SAI
export const productTable = ...         // lowercase component
<ProductTable Rows={data} OnEdit={...} /> // PascalCase props
```

---

## 5. Quy tắc Tổ chức File & Thư mục

### 5.1 Quy tắc "1 file = 1 trách nhiệm"

```
✅ ĐÚNG:
hooks/useProductList.js     ← CHỈ chứa logic fetch, save, delete sản phẩm
hooks/useProductFilters.js  ← CHỈ chứa logic filter, sort, pagination
pages/InventoryProduct.jsx  ← CHỈ chứa orchestration (gọi hook, render layout)

❌ SAI:
hooks/useInventory.js       ← Gom tất cả logic của module vào 1 file 500 dòng
pages/InventoryProduct.jsx  ← Vừa gọi API, vừa xử lý filter, vừa render table chi tiết
```

### 5.2 Quy tắc "Component theo feature"

Mỗi sub-folder trong `components/` tương ứng 1 feature / page:

```
modules/inventory/components/
├── home/                   ← Component cho InventoryDashboard
│   ├── InventorySidebar.jsx
│   ├── InventoryTopbar.jsx
│   ├── HubOverlay.jsx
│   ├── KPICard.jsx
│   ├── StockCard.jsx
│   └── ...
├── product/                ← Component cho InventoryProduct
│   ├── ProductTable.jsx
│   ├── ProductFilterSidebar.jsx
│   ├── ProductDetailPanel.jsx
│   └── ...
└── modals/                 ← Modal dùng chung trong module
    ├── EditProductModal.jsx
    └── ...
```

### 5.3 Quy tắc "Không lẫn lộn giữa shared và module"

```
KHI NÀO ĐƯA VÀO shared/:
- Component được dùng ở >= 2 module khác nhau
- Hook / Util thực sự generic, không phụ thuộc nghiệp vụ cụ thể

KHI NÀO GIỮ Ở module/:
- Component chỉ dùng trong 1 module (dù có thể "trông giống" shared)
- Hook chứa logic nghiệp vụ đặc thù
```

---

## 6. Cách tạo Module / Page Mới

### 6.1 Tạo Module Mới hoàn toàn (vd: HRM - Nhân sự)

**Bước 1:** Tạo cấu trúc thư mục:

```
src/modules/hrm/
├── components/
│   └── employee/
│       ├── EmployeeTable.jsx
│       └── EmployeeFilterBar.jsx
├── data/
│   └── hrmMockData.js
├── hooks/
│   └── useEmployeeList.js
├── layouts/
│   └── HrmLayout.jsx
├── pages/
│   ├── HrmDashboard.jsx
│   └── HrmEmployee.jsx
├── services/
│   └── hrmService.js
└── utils/
    └── employeeUtils.js
```

**Bước 2:** Thêm endpoint vào `src/services/endpoints.js`:

```js
// trong object ENDPOINTS:
HRM: {
  GET_EMPLOYEES: '/hrm/employees',
  GET_EMPLOYEE: (id) => `/hrm/employees/${id}`,
  CREATE_EMPLOYEE: '/hrm/employees',
  UPDATE_EMPLOYEE: (id) => `/hrm/employees/${id}`,
  DELETE_EMPLOYEE: (id) => `/hrm/employees/${id}`,
},
```

**Bước 3:** Tạo service `hrmService.js`:

```js
import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v != null && v !== '') params.set(k, v);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const getEmployees = (filters) =>
  apiGet(`${ENDPOINTS.HRM.GET_EMPLOYEES}${buildQuery(filters)}`);

export const getEmployee = (id) =>
  apiGet(ENDPOINTS.HRM.GET_EMPLOYEE(id));

export const createEmployee = (data) =>
  apiPost(ENDPOINTS.HRM.CREATE_EMPLOYEE, data);

export const updateEmployee = (id, data) =>
  apiPut(ENDPOINTS.HRM.UPDATE_EMPLOYEE(id), data);

export const deleteEmployee = (id) =>
  apiDelete(ENDPOINTS.HRM.DELETE_EMPLOYEE(id));
```

**Bước 4:** Tạo hook `useEmployeeList.js`:

```js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getEmployees } from '../services/hrmService';
import { employeeRows } from '../data/hrmMockData';

export const useEmployeeList = () => {
  const [employees, setEmployees] = useState(employeeRows);
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '' });
  const { token } = useAuth();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setApiStatus({ loading: true, error: '' });
      try {
        const data = await getEmployees({ page: 1, pageSize: 100 });
        if (!active) return;
        setEmployees(data?.items || data || employeeRows);
        setApiStatus({ loading: false, error: '' });
      } catch (err) {
        if (!active) return;
        setEmployees(employeeRows);
        setApiStatus({ loading: false, error: 'Đang dùng dữ liệu mẫu' });
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  return { employees, apiStatus };
};
```

**Bước 5:** Tạo Layout `HrmLayout.jsx`:

```jsx
import { Outlet } from 'react-router-dom';

const HrmLayout = () => (
  <div className="min-h-screen bg-[#FAFAFA]">
    <div className="ml-[260px]">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  </div>
);
export default HrmLayout;
```

**Bước 6:** Tạo Page `HrmEmployee.jsx`:

```jsx
import { useEmployeeList } from '../hooks/useEmployeeList';
import EmployeeTable from '../components/employee/EmployeeTable';

const HrmEmployee = () => {
  const { employees, apiStatus } = useEmployeeList();

  return (
    <div className="w-full space-y-4">
      <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        apiStatus.error
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}>
        {apiStatus.loading ? 'Đang đồng bộ...' : apiStatus.error || 'Đã đồng bộ dữ liệu'}
      </div>
      <EmployeeTable rows={employees} />
    </div>
  );
};
export default HrmEmployee;
```

**Bước 7:** Đăng ký route trong `App.js`:

```jsx
// Thêm lazy import ở đầu file:
const HrmLayout = lazy(() => import('./modules/hrm/layouts/HrmLayout'));
const HrmEmployee = lazy(() => import('./modules/hrm/pages/HrmEmployee'));
const HrmDashboard = lazy(() => import('./modules/hrm/pages/HrmDashboard'));

// Thêm trong <Routes>:
<Route path="/hrm" element={<HrmLayout />}>
  <Route index element={<HrmDashboard />} />
  <Route path="employees" element={<HrmEmployee />} />
</Route>
```

### 6.2 Thêm Page mới vào Module có sẵn

Ví dụ thêm trang "Nhà cung cấp" vào Inventory:

```
CẦN LÀM:
1. Tạo src/modules/inventory/pages/InventorySupplier.jsx
2. Tạo src/modules/inventory/hooks/useSupplierList.js (nếu cần)
3. Tạo src/modules/inventory/components/supplier/SupplierTable.jsx (nếu cần)
4. Thêm <Route path="suppliers" element={<InventorySupplier />} /> trong App.js

KHÔNG CẦN LÀM:
- Tạo service mới (thêm function vào inventoryService.js hiện có)
- Tạo layout mới (dùng lại InventoryLayout)
```

---

## 7. Quy tắc Chia Component

### 7.1 Tiêu chí Tách Component

Tách component riêng khi thỏa **>= 1** trong các điều kiện sau:

| # | Tiêu chí | Dấu hiệu nhận biết |
|---|----------|-------------------|
| 1 | **Tái sử dụng >= 2 lần** | Thấy copy-paste JSX giữa 2 file |
| 2 | **File > 250 dòng** | Khó scroll, khó tìm code |
| 3 | **Có state/props độc lập** | Đoạn code có `useState` riêng, hoạt động được nếu tách ra |
| 4 | **Ranh giới nghiệp vụ rõ ràng** | "Đây là phần thanh toán", "Đây là phần filter", "Đây là phần giỏ hàng" |
| 5 | **Thay đổi độc lập** | 2 phần có khả năng được sửa bởi 2 người khác nhau hoặc 2 thời điểm khác nhau |

### 7.2 Khi nào KHÔNG tách

- Đoạn code < 20 dòng, không dùng lại ở đâu khác
- Chỉ khác nhau 1-2 props → dùng props để điều khiển, không tạo component mới
- Tách chỉ vì "cảm thấy nên tách" mà không có lý do cụ thể → giữ nguyên

### 7.3 Container (Smart) vs Presentational (Dumb)

Dự án áp dụng pattern này xuyên suốt:

```
CONTAINER (Smart) = PAGE COMPONENTS (src/modules/<name>/pages/)
┌─────────────────────────────────────────────┐
│ Biết MỌI THỨ:                               │
│ - Gọi hooks (useProductList, usePosCart...)  │
│ - Quản lý UI state (modal open/close, ...)   │
│ - Xử lý event handlers                       │
│ - Truyền data + callbacks xuống con          │
│ - KHÔNG viết JSX chi tiết                    │
└─────────────────────────────────────────────┘
                    ↓ props
PRESENTATIONAL (Dumb) = MODULE COMPONENTS + SHARED COMPONENTS
┌─────────────────────────────────────────────┐
│ Chỉ biết NHỮNG GÌ ĐƯỢC TRUYỀN VÀO:          │
│ - Nhận data qua props                        │
│ - Nhận callbacks qua on<Event> props         │
│ - Render JSX chi tiết                        │
│ - KHÔNG gọi API trực tiếp                    │
│ - KHÔNG dùng useContext (trừ auth context)   │
└─────────────────────────────────────────────┘
```

**Ví dụ thực tế từ dự án:**

```jsx
// ==========================================
// CONTAINER: InventoryProduct.jsx (PAGE)
// ==========================================
const ProductManagement = () => {
  // --- Biết hooks ---
  const { products, handleSaveProduct, handleDeleteProduct } = useProductList();
  const filters = useProductFilters(products);

  // --- Biết UI state ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // --- Biết handler ---
  const handleSave = (updated) => {
    handleSaveProduct(updated, productToEdit, () => {
      setEditModalOpen(false);
      setProductToEdit(null);
    });
  };

  // --- Chỉ render layout + truyền props ---
  return (
    <div className="w-full space-y-4">
      <ProductFilterSidebar filters={filters} />
      <ProductTable
        rows={displayedRows}
        onEdit={(row) => { setProductToEdit(row); setEditModalOpen(true); }}
        onDelete={handleDeleteProduct}
      />
      {editModalOpen && (
        <EditProductModal
          product={productToEdit}
          onSave={handleSave}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

// ==========================================
// PRESENTATIONAL: ProductTable.jsx (COMPONENT)
// ==========================================
const ProductTable = ({
  rows,           // Data từ cha
  sortConfig,     // Config từ cha
  getSortIcon,    // Helper từ cha
  onToggleSort,   // Callback lên cha
  expandedId,     // State từ cha
  onToggleExpand, // Callback lên cha
  onEdit,         // Callback lên cha
  onDelete,       // Callback lên cha
}) => {
  // Chỉ có logic HIỂN THỊ
  // KHÔNG gọi API, KHÔNG dùng hooks (trừ những hook UI như useRef cho animation)
  return (
    <table className="w-full">
      <thead>...</thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>
              <button onClick={() => onEdit(row)}>Sửa</button>
              <button onClick={() => onDelete(row)}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 7.4 Cây quyết định: Code mới để ở đâu?

```
Cần viết code mới
│
├─ Là UI element generic (button, modal, input...)?
│  └─ shared/components/<TenComponent>.jsx
│     Luôn có variants + sizes + className prop để linh hoạt
│
├─ Là logic nghiệp vụ (gọi API, xử lý state)?
│  └─ modules/<module>/hooks/use<TenFeature>.js
│     Export state + handler functions
│
├─ Là trang mới trong module có sẵn?
│  ├─ modules/<module>/pages/<TenTrang>.jsx   ← Orchestrate
│  ├─ modules/<module>/hooks/use<...>.js      ← Logic (nếu cần)
│  └─ modules/<module>/components/<feature>/  ← UI con
│
├─ Là module hoàn toàn mới?
│  └─ Tạo toàn bộ: components/ hooks/ services/ pages/ layouts/ data/
│     Copy cấu trúc từ module inventory làm template
│
└─ Cần thêm API endpoint?
   ├─ Thêm URL vào services/endpoints.js
   └─ Thêm function vào module service tương ứng
```

---

## 8. Quy tắc Viết Component

### 8.1 Cấu trúc file Component

```jsx
// 1. Import React & thư viện ngoài
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Import shared
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';

// 3. Import module: services, hooks, components, utils, data
import { getProducts } from '../services/inventoryService';
import { useProductFilters } from '../hooks/useProductFilters';
import ProductTable from '../components/product/ProductTable';

// 4. Khai báo constants (nếu có)
const PAGE_SIZE = 15;

// 5. Component (named export + default export)
export const ProductManagement = () => {
  // 5a. Hooks (useState, useEffect, custom hooks)
  // 5b. Derived state (useMemo, useCallback)
  // 5c. Event handlers
  // 5d. Render
  return ( ... );
};

export default ProductManagement;
```

### 8.2 Props Pattern

```jsx
// ✅ ĐÚNG: Props object với default value rõ ràng
export const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children,
  footer = null,
  size = 'md',
  closeButton = true,
}) => { ... };

// ✅ ĐÚNG: Luôn có className prop để cha có thể override style
export const Card = ({
  children,
  header = null,
  className = '',
  ...props
}) => (
  <div className={`rounded-lg border bg-white shadow-md ${className}`} {...props}>
    {children}
  </div>
);

// ❌ SAI: Thiếu default value, không có className
export const Card = (props) => (
  <div className="rounded-lg border bg-white shadow-md">
    {props.children}
  </div>
);
```

### 8.3 Export Pattern

```jsx
// ✅ ĐÚNG: Named export + Default export
export const ProductTable = ({ rows, onEdit, onDelete }) => { ... };
export default ProductTable;

// ✅ ĐÚNG: Service file - named export từng function + default export object
export const getProducts = (filters) => apiGet(...);
export const createProduct = (data) => apiPost(...);
// ...
const inventoryService = { getProducts, createProduct, ... };
export default inventoryService;

// ❌ SAI: Chỉ có default export (khó import kiểu { TenCuThe })
export default () => { ... };
```

---

## 9. Quy tắc Sử dụng Icon

### 9.1 Chỉ dùng 1 component `<Icon />`

Dự án dùng **1 component Icon duy nhất** từ `src/shared/components/Icon.jsx`. Icon này wrap toàn bộ thư viện `lucide-react`.

**Luôn dùng `<Icon name="..." />`, không import trực tiếp từ lucide-react.**

```jsx
// ✅ ĐÚNG
import Icon from '../../../shared/components/Icon';
<Icon name="search" className="mr-2 text-slate-400" />
<Icon name="add" className="text-sm" />
<Icon name="delete" className="text-red-500" size={20} />

// ❌ SAI - KHÔNG import trực tiếp từ lucide-react
import { Search, Plus, Trash2 } from 'lucide-react';
<Search className="mr-2" />
```

### 9.2 Danh sách tên icon có sẵn

Component `Icon` có 1 static map (`staticIconMap`) ánh xạ tên ngắn gọn → tên Lucide. Dùng **key bên trái** làm giá trị `name`:

```
Các icon phổ biến:
┌──────────────────────┬──────────────────────────┐
│ name (DÙNG CÁI NÀY)  │ Lucide Icon               │
├──────────────────────┼──────────────────────────┤
│ search               │ Search                    │
│ add                  │ Plus                      │
│ delete               │ Trash2                    │
│ edit                 │ Pencil                    │
│ close                │ X                         │
│ chevron_left         │ ChevronLeft               │
│ chevron_right        │ ChevronRight              │
│ chevron_down         │ ChevronDown               │
│ dashboard            │ LayoutDashboard           │
│ inventory_2          │ Package                   │
│ factory              │ Factory                   │
│ forum                │ MessageSquare             │
│ notifications        │ Bell                      │
│ shopping_cart        │ ShoppingCart              │
│ upload_file          │ UploadCloud               │
│ download             │ Download                  │
│ tune                 │ SlidersHorizontal         │
│ info                 │ Info                      │
│ warning              │ AlertTriangle             │
│ error                │ AlertOctagon              │
│ check                │ Check                     │
│ star                 │ Star                      │
│ payments             │ Banknote                  │
│ badge                │ IdCard                    │
│ history              │ History                   │
│ store                │ Store                     │
│ chat                 │ MessageCircle             │
│ copy                 │ Copy                      │
│ send                 │ Send                      │
│ inventory            │ Boxes                     │
│ assignment           │ ClipboardList             │
│ groups               │ Users                     │
│ local_shipping       │ Truck                     │
│ sell                 │ Tag                       │
│ campaign             │ Megaphone                 │
│ bolt                 │ Sparkles                  │
│ smart_toy            │ Bot                       │
│ assessment           │ BarChart3                 │
│ calculate            │ Calculator                │
│ credit_card          │ CreditCard                │
│ barcode_scanner      │ ScanBarcode               │
│ balance              │ Scale                     │
│ account_balance_wallet│ Wallet                   │
│ more_horiz           │ MoreHorizontal            │
└──────────────────────┴──────────────────────────┘
```

### 9.3 Cách thêm icon mới

Khi cần icon chưa có trong static map, thêm entry mới vào `staticIconMap` trong `Icon.jsx`:

```js
const staticIconMap = {
  // ... existing entries
  ten_tieng_viet: 'LucideIconName',  // ← key: snake_case tiếng Việt, value: tên Lucide icon
  filter_list: 'Filter',
};
```

### 9.4 Props của `<Icon />`

```jsx
<Icon
  name="search"        // Tên trong staticIconMap (bắt buộc)
  className=""          // Class bổ sung (màu sắc, margin, kích thước bổ sung)
  size={20}            // Kích thước px (mặc định: 20)
  strokeWidth={2}      // Độ dày nét (mặc định: 2)
/>
```

---

## 10. Quy tắc Viết Hook

### 10.1 Cấu trúc Hook

```js
// 1. Mô tả ngắn gọn mục đích của hook
/**
 * Hook quản lý danh sách X: fetch, create, update, delete.
 * Tự fallback về mock data khi API lỗi.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getX, createX, updateX, deleteX } from '../services/xService';

export const useXList = () => {
  // 2. State declarations
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const { token } = useAuth();

  // 3. useEffect cho data fetching
  useEffect(() => {
    let active = true;
    const load = async () => {
      setStatus({ loading: true, error: '' });
      try {
        const data = await getX();
        if (!active) return;
        setItems(data);
        setStatus({ loading: false, error: '' });
      } catch (err) {
        if (!active) return;
        setItems(mockData);   // ← Luôn có fallback
        setStatus({ loading: false, error: 'Đang dùng dữ liệu mẫu' });
      }
    };
    load();
    return () => { active = false; };   // ← Cleanup tránh memory leak
  }, [token]);

  // 4. Handler functions
  const handleCreate = async (data, onSuccess) => {
    // ...
    onSuccess?.();
  };

  const handleDelete = async (id) => {
    // ...
  };

  // 5. Return: state + handlers
  return { items, status, handleCreate, handleDelete };
};
```

### 10.2 Nguyên tắc

- **Luôn có cleanup function** trong `useEffect` (`return () => { active = false; }`) để tránh setState trên component đã unmount
- **Luôn có fallback mock data** khi API lỗi → app không crash
- **Dependency rõ ràng**: nếu hook phụ thuộc vào auth token, thêm `token` vào dependency array
- **Return object, không return array** → dễ destructure và dễ mở rộng sau này:

```js
// ✅ ĐÚNG - return object
return { products, apiStatus, handleSaveProduct, handleDeleteProduct };
// Dùng: const { products, apiStatus } = useProductList();

// ❌ SAI - return array (dễ vỡ khi thêm field)
return [products, apiStatus, handleSaveProduct];
// Dùng: const [products, apiStatus] = useProductList(); // vỡ nếu thêm field mới
```

---

## 11. Quy tắc Viết Service & API Call

### 11.1 Tổ chức file Service

Mỗi module có 1 file service duy nhất. Tất cả API call của module đó nằm trong file này.

```js
// src/modules/inventory/services/inventoryService.js

import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// Helper private - không export
const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

// ============ Products ============
export const getProducts = (filters = {}) =>
  apiGet(`${ENDPOINTS.INVENTORY.GET_PRODUCTS}${buildQueryString(filters)}`);

export const getProduct = (id) =>
  apiGet(ENDPOINTS.INVENTORY.GET_PRODUCT(id));

export const createProduct = (data) =>
  apiPost(ENDPOINTS.INVENTORY.CREATE_PRODUCT, data);

export const updateProduct = (id, data) =>
  apiPut(ENDPOINTS.INVENTORY.UPDATE_PRODUCT(id), data);

export const deleteProduct = (id) =>
  apiDelete(ENDPOINTS.INVENTORY.DELETE_PRODUCT(id));

// ...more API calls

// Default export object (dùng khi cần import tất cả)
const inventoryService = { getProducts, getProduct, createProduct, ... };
export default inventoryService;
```

### 11.2 Thêm endpoint mới

Luôn thêm vào `src/services/endpoints.js`, **không hardcode URL** trong service:

```js
// ✅ ĐÚNG
// Trong endpoints.js:
HRM: {
  GET_EMPLOYEES: '/hrm/employees',
}
// Trong hrmService.js:
export const getEmployees = () => apiGet(ENDPOINTS.HRM.GET_EMPLOYEES);

// ❌ SAI
export const getEmployees = () => apiGet('/hrm/employees'); // Hardcode URL
```

### 11.3 Xử lý lỗi

Service function **không try-catch** (để hook xử lý). Service chỉ throw error, hook sẽ catch và fallback:

```js
// ✅ ĐÚNG - Service mỏng, không try-catch
export const getProducts = (filters) =>
  apiGet(`${ENDPOINTS.GET_PRODUCTS}${buildQueryString(filters)}`);

// ✅ ĐÚNG - Hook catch lỗi và fallback
try {
  const data = await getProducts();
  setProducts(data);
} catch (err) {
  setProducts(mockData);  // fallback
}

// ❌ SAI - Service nuốt lỗi, hook không biết có lỗi
export const getProducts = async (filters) => {
  try {
    return await apiGet(...);
  } catch {
    return [];  // Nuốt lỗi, hook không phân biệt được
  }
};
```

---

## 12. Quy tắc Styling với Tailwind

### 12.1 Dùng color token từ theme

Dự án đã cấu hình sẵn color tokens trong `tailwind.config.js`. **Luôn dùng token, không hardcode mã màu:**

```jsx
// ✅ ĐÚNG - Dùng theme token
<div className="bg-primary text-on-primary">         // #004785, #ffffff
<div className="border-slate-200 text-slate-600">
<div className="bg-surface-container text-on-surface">
<div className="text-error bg-error-container">

// ❌ SAI - Hardcode mã màu
<div className="bg-[#004785] text-[#ffffff]">       // Dùng bg-primary text-on-primary
<div className="border-[#D1D1D1]">                   // Dùng border-borderLight
```

### 12.2 Các color token quan trọng

| Token | Giá trị | Mục đích |
|-------|---------|----------|
| `primary` | `#004785` | Màu chủ đạo (xanh navy) |
| `on-primary` | `#ffffff` | Text trên nền primary |
| `surface` | `#f7f9fc` | Nền trang |
| `surface-container` | `#eceef1` | Container nổi trên nền |
| `on-surface` | `#191c1e` | Text chính |
| `outline` | `#707783` | Viền input |
| `borderLight` | `#D1D1D1` | Viền nhạt |
| `error` | `#ba1a1a` | Màu lỗi |
| `error-container` | `#ffdad6` | Nền lỗi nhạt |
| `success` | `#2D6A4F` | Màu thành công |
| `warning` | `#FBC02D` | Màu cảnh báo |
| `danger` | `#9B2226` | Màu nguy hiểm |
| `textMain` | `#1C1C1C` | Text chính (customer) |
| `textAdmin` | `#333333` | Text chính (admin) |
| `placeholder` | `#6E6E73` | Placeholder |

**Ngoại lệ:** `bg-[#004785]` được dùng cho brand color chính xác (logo area, brand button). Có thể dùng `bg-primary` thay thế nếu phù hợp.

### 12.3 Thứ tự class

Tuân theo thứ tự (Prettier tailwind plugin sẽ tự sắp xếp):

```
Layout (display, position) → Spacing (margin, padding) → Sizing (width, height)
→ Typography → Background → Border → Effects → Transitions
```

### 12.4 Responsive

```jsx
// ✅ ĐÚNG - Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ ĐÚNG - Grid responsive
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

---

## 13. Quy tắc Xử lý Mock Data

### 13.1 File mock data

```js
// src/modules/<name>/data/<name>MockData.js

export const inventoryRows = [
  {
    id: 'SP001',
    productCode: 'SP001',
    name: 'Thép tấm 10mm',
    group: 'Thép',
    unit: 'Kg',
    stock: 1500,
    salePrice: 25000,
    status: 'Sẵn hàng',
    image: '',
  },
  // ...
];

export const dashboardKpis = [ ... ];
```

### 13.2 Fallback pattern

```js
// Trong hook: luôn có fallback khi API lỗi
try {
  const data = await getProducts();
  if (data?.length > 0) setProducts(data);
} catch {
  setProducts(inventoryRows);  // ← Fallback về mock data
}
```

### 13.3 Page data config

Tách config giao diện (menu items, hub config...) ra file `*PageData.js` riêng, không để trong component:

```js
// src/modules/inventory/data/inventoryPageData.js
export const hubConfigs = {
  inventory: { title: 'Tổng kho', items: [...] },
  product: { title: 'Hàng hóa', items: [...] },
};
```

---

## 14. Quy tắc Import

### 14.1 Thứ tự Import

Luôn nhóm import theo thứ tự, cách nhau bởi 1 dòng trắng:

```jsx
// 1. React & thư viện ngoài
import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// 2. Shared components, hooks, utils
import Icon from '../../../shared/components/Icon';
import { useAuth } from '../../../shared/hooks/useAuth';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

// 3. Module services
import { getProducts, createProduct } from '../services/inventoryService';

// 4. Module hooks
import { useProductList } from '../hooks/useProductList';
import { useProductFilters } from '../hooks/useProductFilters';

// 5. Module components
import ProductTable from '../components/product/ProductTable';
import EditProductModal from '../components/modals/EditProductModal';

// 6. Module data & utils
import { inventoryRows } from '../data/inventoryMockData';
import { normalizeProduct } from '../utils/productUtils';
```

### 14.2 Relative path

Dự án dùng **relative imports**. Quy tắc:
- Từ module đến shared: `../../../shared/...`
- Trong cùng module: `../hooks/...`, `../components/...`, `./`

---

## 15. Quy tắc Chung

### 15.1 Component mặc định dùng function, không dùng class

```jsx
// ✅ ĐÚNG
export const ProductTable = ({ rows }) => { ... };

// ❌ SAI
class ProductTable extends React.Component { ... }
```

### 15.2 Luôn có cleanup cho effect

```jsx
// ✅ ĐÚNG
useEffect(() => {
  let active = true;
  fetchData().then((data) => {
    if (active) setData(data);
  });
  return () => { active = false; };
}, []);

// ❌ SAI - Không cleanup, setState trên unmounted component
useEffect(() => {
  fetchData().then(setData);
}, []);
```

### 15.3 Optional chaining & nullish coalescing

```jsx
// ✅ ĐÚNG
const name = user?.profile?.name ?? 'Ẩn danh';
const items = data?.items ?? [];

// ❌ SAI
const name = user && user.profile && user.profile.name ? user.profile.name : 'Ẩn danh';
```

### 15.4 Destructure props, không dùng `props.xxx`

```jsx
// ✅ ĐÚNG
export const Card = ({ children, header, className = '' }) => ( ... );

// ❌ SAI
export const Card = (props) => (
  <div className={props.className}>{props.children}</div>
);
```

### 15.5 Callback props: `on<Event>` hoặc `handle<Event>`

```jsx
// ✅ ĐÚNG - Props cho component con: on<Event>
<ProductTable onEdit={handleEdit} onDelete={handleDelete} />

// ✅ ĐÚNG - Handler nội bộ: handle<Event>
const handleEdit = (row) => { ... };
const handleDelete = (id) => { ... };

// ❌ SAI
<ProductTable edit={handleEdit} delete={handleDelete} />
```

### 15.6 Boolean props ngắn gọn

```jsx
// ✅ ĐÚNG
<Modal isOpen />
<Button disabled />

// ✅ ĐÚNG - Cho rõ ràng
<Modal isOpen={true} />

// ❌ SAI
<Modal isOpen={isOpen ? true : false} />  // Chỉ cần isOpen={isOpen}
```

### 15.7 Không comment thừa

Code tự document thông qua tên biến/hàm rõ ràng. Chỉ comment khi WHY không hiển nhiên:

```jsx
// ✅ ĐÚNG - Giải thích WHY
// Dùng sessionStorage thay vì localStorage vì MVP yêu cầu dữ liệu chỉ tồn tại trong phiên
sessionStorage.setItem('authToken', token);

// ❌ SAI - Comment WHAT (code đã nói rõ rồi)
// Lưu token vào session storage
sessionStorage.setItem('authToken', token);
```

### 15.8 Xử lý loading & empty state

Mọi component có async data phải xử lý 3 trạng thái:

```jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorBanner message={error} />;
if (items.length === 0) return <EmptyState message="Không có dữ liệu" />;
return <DataTable rows={items} />;
```

### 15.9 Prettier

Dự án dùng Prettier với `prettier-plugin-tailwindcss`. Khi commit, lint-staged sẽ tự format. Đảm bảo code đã được format trước khi push.

---

## 16. Checklist Code Review

Khi review code hoặc tự kiểm tra trước khi push, kiểm tra:

- [ ] File đặt đúng thư mục? (page → pages/, hook → hooks/, component → components/, v.v.)
- [ ] Tên file đúng convention? (PascalCase.jsx cho component, camelCase.js cho hook/service/util)
- [ ] Component tách đúng mức? (Page chỉ orchestrate, UI chỉ render, không lẫn lộn)
- [ ] Dùng `<Icon name="..." />` không import trực tiếp từ lucide-react?
- [ ] Dùng color token từ tailwind config, không hardcode `bg-[#...]` trừ brand color?
- [ ] Có cleanup function trong useEffect không?
- [ ] Có fallback mock data khi API lỗi không?
- [ ] Có xử lý loading state và empty state không?
- [ ] Props có default value không?
- [ ] Export đủ cả named + default không?
- [ ] Import theo đúng thứ tự (React → Shared → Module) không?
- [ ] Có comment thừa không?
- [ ] API endpoint được định nghĩa trong `endpoints.js` chứ không hardcode?
- [ ] Code đã được format qua Prettier chưa?
- [ ] Không bỏ `console.log` debug trong code production?

---

> **Ghi chú cuối:** Tài liệu này phản ánh codebase hiện tại (React 19 + React Router 7 + Tailwind 3). Khi có sự thay đổi về tech stack hoặc team quyết định thay đổi convention, hãy cập nhật tài liệu này và thông báo cho cả team.
