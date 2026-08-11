/**
 * Granular RBAC - Permission Action Mapping
 * Dinh nghia moi action can quyen gi trong tung module.
 *
 * Nguyen tac: Moi hanh dong (tao, sua, duyet, huy) deu yeu cau
 * dung permission code rieng biet. Khong su dung _VIEW cho hanh dong.
 */

// ==================== STOCK INWARD (Nhap Kho) ====================
export const INWARD_ACTIONS = {
  VIEW_LIST:     'STOCK_INWARD_CREATE',   // Xem danh sach phieu nhap
  VIEW_DETAIL:   'STOCK_INWARD_CREATE',   // Xem chi tiet phieu
  CREATE:        'STOCK_INWARD_CREATE',   // Tao phieu nhap + Luu nhap
  UPDATE:        'STOCK_INWARD_UPDATE',   // Sua phieu nhap (khi PENDING)
  CONFIRM:       'STOCK_INWARD_UPDATE',   // Xac nhan / Cong kho
  CANCEL:        'STOCK_INWARD_DELETE',   // Huy phieu nhap
  DELETE:        'STOCK_INWARD_DELETE',   // Xoa phieu nhap
};

// ==================== STOCK OUTWARD (Xuat Kho) ====================
export const OUTWARD_ACTIONS = {
  VIEW_LIST:     'STOCK_OUTWARD_CREATE',   // Xem danh sach phieu xuat
  VIEW_DETAIL:   'STOCK_OUTWARD_CREATE',   // Xem chi tiet phieu
  CREATE:        'STOCK_OUTWARD_CREATE',   // Tao phieu xuat + Luu nhap
  UPDATE:        'STOCK_OUTWARD_UPDATE',   // Sua phieu xuat
  CONFIRM:       'STOCK_OUTWARD_CONFIRM',  // Xac nhan xuat kho
  CANCEL:        'STOCK_OUTWARD_DELETE',   // Huy phieu xuat
  DELETE:        'STOCK_OUTWARD_DELETE',   // Xoa phieu xuat
};

// ==================== STOCK CHECK (Kiem Ke) ====================
export const CHECK_ACTIONS = {
  VIEW_LIST:     'STOCK_CHECK_CREATE',    // Xem danh sach kiem ke
  VIEW_DETAIL:   'STOCK_CHECK_CREATE',    // Xem chi tiet
  CREATE:        'STOCK_CHECK_CREATE',    // Tao phieu kiem ke
  FILL:          'STOCK_CHECK_CREATE',    // Nhap so lieu kiem ke
  APPROVE:       'STOCK_CHECK_APPROVE',   // Duyet kiem ke
  CANCEL:        'STOCK_CHECK_CANCEL',    // Huy kiem ke
};

// ==================== PRODUCT (San Pham) ====================
export const PRODUCT_ACTIONS = {
  VIEW_LIST:     'PRODUCT_VIEW',
  VIEW_DETAIL:   'PRODUCT_VIEW',
  CREATE:        'PRODUCT_CREATE',
  UPDATE:        'PRODUCT_UPDATE',
  DELETE:        'PRODUCT_DELETE',
  IMPORT_EXCEL:  'PRODUCT_CREATE',
  TOGGLE_STATUS: 'PRODUCT_UPDATE',
};

// ==================== SUPPLIER (Nha Cung Cap) ====================
export const SUPPLIER_ACTIONS = {
  VIEW_LIST:     'SUPPLIER_VIEW',
  CREATE:        'SUPPLIER_CREATE',
  UPDATE:        'SUPPLIER_UPDATE',
  DELETE:        'SUPPLIER_DELETE',
  VIEW_PAYMENT:  'SUPPLIER_PAYMENT_VIEW',
  CREATE_PAYMENT:'SUPPLIER_PAYMENT_CREATE',
};

// ==================== SALE / POS ====================
export const SALE_ACTIONS = {
  VIEW_LIST:     'SALE_VIEW',
  CREATE:        'SALE_CREATE',
  UPDATE:        'SALE_UPDATE',
  DELETE:        'SALE_DELETE',
  PAYMENT:       'PAYMENT_CREATE',
};

// ==================== CUSTOMER (Khach Hang) ====================
export const CUSTOMER_ACTIONS = {
  VIEW_LIST:     'CUSTOMER_VIEW',
  CREATE:        'CUSTOMER_CREATE',
  UPDATE:        'CUSTOMER_UPDATE',
  DELETE:        'CUSTOMER_DELETE',
};

// ==================== EXPENSE (Chi Phi) ====================
export const EXPENSE_ACTIONS = {
  VIEW_LIST:     'EXPENSE_VIEW',
  CREATE:        'EXPENSE_CREATE',
  CONFIRM:       'EXPENSE_CONFIRM',
  CANCEL:        'EXPENSE_CANCEL',
  MANAGE_CAT:    'EXPENSE_CATEGORY_MANAGE',
};

// ==================== SHIFT (Ca Lam Viec) ====================
export const SHIFT_ACTIONS = {
  VIEW:          'SHIFT_VIEW',
  CREATE:        'SHIFT_CREATE',
  UPDATE:        'SHIFT_UPDATE',
  DELETE:        'SHIFT_DELETE',
  FORCE_CLOSE:   'SHIFT_FORCE_CLOSE',
};

// ==================== STAFF (Nhan Su) ====================
export const STAFF_ACTIONS = {
  VIEW:          'STAFF_VIEW',
  CREATE:        'STAFF_CREATE',
  UPDATE:        'STAFF_UPDATE',
  DELETE:        'STAFF_DELETE',
  ASSIGN_BRANCH: 'STAFF_ASSIGN_BRANCH',
};

// ==================== LOOKUP PERMISSIONS ====================
 * VD: Nguoi co STOCK_INWARD_CREATE duoc phep goi GET /api/suppliers de chon NCC trong form nhap kho.
 */
export const LOOKUP_ACCESS = {
  // API get suppliers list -> dung cho dropdown chon NCC
  'SUPPLIER_VIEW': [
    'STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE',
    'STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_UPDATE',
    'STOCK_CHECK_CREATE',
    'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE',
    'SUPPLIER_PAYMENT_VIEW', 'SUPPLIER_PAYMENT_CREATE',
    'EXPENSE_CREATE', 'EXPENSE_VIEW',
  ],
  // API get products list -> dung cho dropdown chon san pham
  'PRODUCT_VIEW': [
    'STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE',
    'STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_UPDATE',
    'STOCK_CHECK_CREATE',
    'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
    'SALE_CREATE', 'SALE_VIEW',
  ],
  // API get categories/brands/locations -> dung cho form nhap/xuat
  'STOCK_VIEW': [
    'STOCK_INWARD_CREATE', 'STOCK_OUTWARD_CREATE',
    'PRODUCT_CREATE', 'PRODUCT_VIEW',
  ],
};
