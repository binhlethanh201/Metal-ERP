# He Thong Phan Quyen (RBAC) - MEP ERP

## 1. Tong Quan Kien Truc

He thong phan quyen su dung mo hinh **RBAC (Role-Based Access Control)** 3 tang:

```
User (Nguoi dung)
  |-- Role (Vai tro) -- gan qua bang users_roles
  |     |-- RolePermission (Quyen cua vai tro) -- bang role_permissions
  |
  |-- UserPermission (Quyen rieng) -- bang user_permissions
        |-- IsGranted: null = ke thua tu Role, true = cho phep them, false = tu choi (override Role)
```

**Cac bang DB:**
- `permissions` - Danh sach tat ca cac quyen trong he thong (VD: `STOCK_VIEW`, `SALE_CREATE`)
- `roles` - Cac vai tro (Owner, SalesStaff, InventoryStaff, Admin)
- `role_permissions` - Quyen gan cho vai tro
- `user_permissions` - Quyen rieng cho tung user (override Role)
- `users_roles` - Gan user vao role

---

## 2. Cac Vai Tro (Roles)

| Role | Mo Ta | Dac Quyen |
|------|-------|-----------|
| **Owner** | Chu cua hang | **Bypass toan bo** Permission check (KHONG co quyen Admin) |
| **SalesStaff** | Nhan vien Ban hang | POS, Khach hang, Xem san pham, Xem kho |
| **InventoryStaff** | Nhan vien Kho | Nhap/xuat/kiem ke, San pham, Nha cung cap |
| **Admin** | Quan tri he thong | Toan he thong, nhieu cua hang |

---

## 3. Danh Sach Toan Bo Permission

### 3.1 Kho Hang & Kiem Ke (Stock)
| Code | Mo Ta |
|------|-------|
| `STOCK_VIEW` | Xem kho / ton kho |
| `STOCK_INWARD_CREATE` | Tao phieu nhap kho |
| `STOCK_INWARD_UPDATE` | Cap nhat phieu nhap kho |
| `STOCK_INWARD_DELETE` | Xoa phieu nhap kho |
| `STOCK_OUTWARD_CREATE` | Tao phieu xuat kho |
| `STOCK_OUTWARD_UPDATE` | Cap nhat phieu xuat kho |
| `STOCK_OUTWARD_DELETE` | Xoa phieu xuat kho |
| `STOCK_OUTWARD_CONFIRM` | Xac nhan phieu xuat kho |
| `STOCK_CHECK_VIEW` | Xem kiem kho + Thong bao |
| `STOCK_CHECK_CREATE` | Tao kiem kho |
| `STOCK_CHECK_APPROVE` | Duyet kiem kho |
| `STOCK_CHECK_CANCEL` | Huy kiem kho |

### 3.2 San Pham (Product)
| Code | Mo Ta |
|------|-------|
| `PRODUCT_VIEW` | Xem san pham |
| `PRODUCT_CREATE` | Tao san pham |
| `PRODUCT_UPDATE` | Cap nhat san pham |
| `PRODUCT_DELETE` | Xoa san pham |

### 3.3 Ban Hang (Sale / POS)
| Code | Mo Ta |
|------|-------|
| `SALE_VIEW` | Xem don hang |
| `SALE_CREATE` | Tao don hang |
| `SALE_UPDATE` | Cap nhat don hang |
| `SALE_DELETE` | Xoa don hang |
| `CUSTOMER_VIEW` | Xem khach hang |
| `CUSTOMER_CREATE` | Tao khach hang |
| `CUSTOMER_UPDATE` | Cap nhat khach hang |
| `CUSTOMER_DELETE` | Xoa khach hang |
| `PAYMENT_VIEW` | Xem thanh toan |
| `PAYMENT_CREATE` | Tao thanh toan |
| `PRINT_VIEW` | In hoa don / phieu |
| `PROMOTION_VIEW` | Xem khuyen mai |

### 3.4 Ca Lam Viec (Shift)
| Code | Mo Ta |
|------|-------|
| `SHIFT_VIEW` | Xem ca lam viec |
| `SHIFT_CREATE` | Mo ca lam viec |
| `SHIFT_UPDATE` | Chot ca / cap nhat ca |
| `SHIFT_DELETE` | Xoa ca lam viec |
| `SHIFT_FORCE_CLOSE` | Chot ho ca |

### 3.5 Nha Cung Cap (Supplier)
| Code | Mo Ta |
|------|-------|
| `SUPPLIER_VIEW` | Xem Nha cung cap |
| `SUPPLIER_CREATE` | Tao Nha cung cap |
| `SUPPLIER_UPDATE` | Cap nhat Nha cung cap |
| `SUPPLIER_DELETE` | Xoa Nha cung cap |
| `SUPPLIER_PAYMENT_VIEW` | Xem cong no NCC |
| `SUPPLIER_PAYMENT_CREATE` | Tao thanh toan NCC |

### 3.6 Chi Phi (Expense)
| Code | Mo Ta |
|------|-------|
| `EXPENSE_VIEW` | Xem chi phi |
| `EXPENSE_CREATE` | Tao chi phi |
| `EXPENSE_CONFIRM` | Xac nhan chi phi |
| `EXPENSE_CANCEL` | Huy chi phi |
| `EXPENSE_CATEGORY_MANAGE` | Quan ly danh muc chi phi |

### 3.7 Nhan Su (Staff)
| Code | Mo Ta |
|------|-------|
| `STAFF_VIEW` | Xem nhan vien |
| `STAFF_CREATE` | Tao nhan vien |
| `STAFF_UPDATE` | Cap nhat nhan vien |
| `STAFF_DELETE` | Xoa nhan vien |
| `STAFF_ASSIGN_BRANCH` | Chuyen chi nhanh nhan vien |

### 3.8 He Thong
| Code | Mo Ta |
|------|-------|
| `REPORT_VIEW` | Xem bao cao |
| `OWNER_MANAGE` | Quan ly cua hang |
| `SYSTEM_MANAGE` | Quan ly he thong |

---

## 4. Bo Quyen Mac Dinh Theo Vai Tro

### 4.1 SalesStaff (Nhan vien Ban hang)
```
CUSTOMER_VIEW, CUSTOMER_CREATE, CUSTOMER_UPDATE
SALE_VIEW, SALE_CREATE, SALE_UPDATE
PAYMENT_VIEW, PAYMENT_CREATE
PRINT_VIEW, PROMOTION_VIEW
SHIFT_VIEW, SHIFT_CREATE, SHIFT_UPDATE
PRODUCT_VIEW, STOCK_VIEW, STOCK_CHECK_VIEW
REPORT_VIEW
```

### 4.2 InventoryStaff (Nhan vien Kho)
```
SUPPLIER_VIEW, SUPPLIER_CREATE, SUPPLIER_UPDATE
PRODUCT_VIEW, PRODUCT_CREATE, PRODUCT_UPDATE
STOCK_VIEW
STOCK_INWARD_CREATE, STOCK_INWARD_UPDATE
STOCK_OUTWARD_CREATE, STOCK_OUTWARD_UPDATE
STOCK_CHECK_VIEW, STOCK_CHECK_CREATE
REPORT_VIEW
```

### 4.3 Owner (Chu cua hang)
**Bypass toan bo permission check** (tru Admin). Owner co moi quyen trong chi nhanh cua minh.

---

## 5. Backend: Cach Van Hanh

### 5.1 Luan Ly Kiem Tra Quyen

**File:** `Authorization/PermissionAuthorizationHandler.cs`

Thu tu kiem tra quyen khi 1 API endpoint duoc goi:

```
1. User co Role = "Owner" ?
   YES -> SUCCEED ngay lap tuc (tru Admin permissions bat dau bang "ADMIN_")
   NO  -> Tiep tuc buoc 2

2. User co UserPermission IsGranted = false cho quyen nay?
   YES -> FAIL (tu choi ro rang - override ca Role)
   NO  -> Tiep tuc buoc 3

3. User co UserPermission IsGranted = true/null cho quyen nay?
   YES -> SUCCEED (quyen rieng duoc cap them)
   NO  -> Tiep tuc buoc 4

4. Role cua User co chua quyen nay khong?
   YES -> SUCCEED (quyen tu Role)
   NO  -> FAIL
```

### 5.2 Cach Ap Dung Permission vao API

Su dung attribute `[HasPermission]` tren Controller Action:

```csharp
[HttpGet("notifications")]
[HasPermission(PermissionConstants.STOCK_CHECK_VIEW)]
public async Task<IActionResult> GetNotifications(...)
```

### 5.3 JWT Token

Khi dang nhap, backend tao JWT token chua:
- `sub` / `nameidentifier`: UserId
- `role`: RoleName (VD: "SalesStaff")
- `permission`: PermissionCode (VD: "STOCK_VIEW", "SALE_CREATE")
- `branchId`: Chi nhanh mac dinh

### 5.4 Tao Nhan Vien (OwnerStaffController.CreateStaff)

```
1. Owner chon DefaultRoleType = "SalesStaff" hoac "InventoryStaff" (hoac chon Owner neu la Admin)
2. Backend tim Role tuong ung trong DB (GetOrCreateRoleAsync)
3. Backend lay danh sach Permission tu Role do
4. Neu Owner chon CustomPermissionCodes -> dung quyen custom, khong dung quyen Role
5. Tao User moi + gan Role + gan UserPermission + tao StaffAssignment
```

### 5.5 Cap Nhat Quyen Nhan Vien (OwnerStaffController.UpdateStaff)

```
1. Validate cac PermissionCode gui len
2. Xoa toan bo UserPermission cu
3. Tao UserPermission moi voi IsGranted = true cho cac quyen duoc chon
4. Tao UserPermission voi IsGranted = false cho cac quyen Role co nhung khong duoc chon
   -> Dam bao neu Owner BO CHON 1 quyen, nhan vien se KHONG duoc su dung quyen do
      ngay ca khi Role co quyen do
```

---

## 6. Frontend: Cach Van Hanh

### 6.1 StaffModal - Form Them/Sua Nhan Vien

**File:** `src/modules/owner/components/staff/StaffModal.jsx`

```
1. Owner chon "Vai tro mac dinh":
   - Nhan vien Ban hang (SalesStaff)
   - Nhan vien Kho (InventoryStaff)

2. Mac dinh: Su dung bo quyen tu dong cua Role (isCustomizing = false)
   -> Cac quyen duoc load tu DEFAULT_ROLE_PERMISSIONS

3. Neu Owner muon tuy chinh -> bam "Toi muon tu chon / ghi de quyen thu cong"
   -> isCustomizing = true -> hien thi danh sach checkbox phan theo nhom:
     - Sale / POS & Thu ngan
     - Kho hang & Kiem ke
     - San pham
     - Nha cung cap & Cong no
     - Nhan su & Phan quyen

4. Khi luu:
   - CHE DO TAO MOI:
     - Neu isCustomizing = false -> gui DefaultRoleType, KHONG gui customPermissionCodes
       -> Backend se lay quyen tu Role
     - Neu isCustomizing = true -> gui permissionCodes vao customPermissionCodes
       -> Backend se gan UserPermission rieng (ghi de quyen Role)
   
   - CHE DO SUA:
     - Luon gui permissionCodes -> Backend se xoa UserPermission cu va tao lai
```

### 6.2 Kiem Tra Quyen Tren Frontend

**File:** `src/shared/utils/permissions.js`

Frontend su dung ham `hasPermission(user, permissionCode)` de an/hien UI elements:

```javascript
import { hasPermission } from 'shared/utils/permissions';

// Vi du: Chi hien nut "Tao san pham" neu user co quyen
{hasPermission(user, 'PRODUCT_CREATE') && (
  <button>Tao san pham</button>
)}
```

### 6.3 API Client & Loi 403

**File:** `src/services/apiClient.js`

Khi API tra ve 403 (Forbidden):
- Backend tra ve `{ message: "Không có quyền thực hiện thao tác này" }`
- Frontend hien thi thong bao loi
- Cac component nen bat loi 403 va xu ly gracefully (an chuc nang, khong crash)

---

## 7. Flow Tao Nhan Vien Moi (End-to-End)

```
FRONTEND                              BACKEND
--------                              -------
1. Owner mo StaffModal
2. Chon vai tro (SalesStaff/InventoryStaff)
3. Chon quyen (mac dinh hoac custom)
4. Bam "Tao nhan vien"
                                      5. POST /api/owner/staffs
                                      6. Validate DefaultRoleType
                                      7. GetOrCreate Role tu DB
                                      8. Lay quyen tu Role (hoac custom)
                                      9. Tao User + gan Role
                                      10. Tao UserPermission (neu custom)
                                      11. Tao StaffAssignment (gan vao chi nhanh)
                                      12. Set DefaultBranchId = current branch
9. Hien thi thong bao thanh cong        <-- 201 Created
10. Refresh danh sach nhan vien
```

---

## 8. Flow Dang Nhap & Phan Quyen

```
FRONTEND                              BACKEND
--------                              -------
1. User nhap email + password
                                      2. POST /api/auth/login
                                      3. Verify email + password + IsActive + IsVerified
                                      4. Lay Roles + Permissions tu DB
                                      5. Resolve BranchId (DefaultBranchId / StaffAssignment)
                                      6. Generate JWT token (chua role + permission + branchId)
7. Luu token vao sessionStorage         <-- 200 OK + token
8. Frontend doc role + permission
   tu token de hien thi UI dung quyen
```

---

## 9. Cac File Quan Trong

### Backend
| File | Vai Tro |
|------|---------|
| `Authorization/PermissionConstants.cs` | Dinh nghia tat ca Permission Code |
| `Authorization/PermissionAuthorizationHandler.cs` | Handler kiem tra quyen RBAC |
| `Authorization/PermissionRequirement.cs` | Requirement cho Authorize |
| `Authorization/HasPermissionAttribute.cs` | Attribute de gan vao Controller |
| `Controllers/OwnerController/OwnerStaffController.cs` | CRUD nhan vien (Owner) |
| `Controllers/AdminController/AdminAccountsController.cs` | CRUD tai khoan (Admin) |
| `Models/Role.cs` | Entity Role |
| `Models/UserPermission.cs` | Entity UserPermission (IsGranted) |
| `Seed/DatabaseSeeder.cs` | Seed quyen + role mac dinh |
| `Services/JwtHelper.cs` | Sinh JWT token |

### Frontend
| File | Vai Tro |
|------|---------|
| `src/modules/owner/components/staff/StaffModal.jsx` | Form them/sua nhan vien + chon quyen |
| `src/modules/owner/hooks/useStaffManager.js` | Hook quan ly nhan vien |
| `src/modules/owner/services/staffService.js` | API calls cho staff |
| `src/shared/utils/permissions.js` | Frontend permission check |
| `src/services/apiClient.js` | API client chung |
