/**
 * Cấu hình gom nhóm Permission theo Trang/Menu để phục vụ giao diện
 * Phân quyền theo Trang (Page-based Permission UI).
 */
export const PAGE_PERMISSION_GROUPS = [
  {
    id: 'page_products',
    pageName: 'Danh sách Hàng hóa',
    category: 'Hàng hóa & Kho',
    viewPermission: 'PRODUCT_VIEW',
    subPermissions: [
      { code: 'PRODUCT_CREATE', label: 'Thêm hàng hóa mới' },
      { code: 'PRODUCT_UPDATE', label: 'Chỉnh sửa thông tin hàng hóa' },
      { code: 'PRODUCT_DELETE', label: 'Xóa hàng hóa' },
      { code: 'PRODUCT_CATEGORY_MANAGE', label: 'Quản lý nhóm hàng & thương hiệu' },
    ],
  },
  {
    id: 'page_stock_inward',
    pageName: 'Nhập kho',
    category: 'Hàng hóa & Kho',
    viewPermission: '',
    subPermissions: [
      { code: 'STOCK_INWARD_CREATE', label: 'Tạo phiếu nhập kho' },
      { code: 'STOCK_INWARD_UPDATE', label: 'Duyệt / Hủy phiếu nhập kho' },
    ],
  },
  {
    id: 'page_stock_outward',
    pageName: 'Xuất kho',
    category: 'Hàng hóa & Kho',
    viewPermission: '',
    subPermissions: [
      { code: 'STOCK_OUTWARD_CREATE', label: 'Tạo phiếu xuất kho' },
      { code: 'STOCK_OUTWARD_CONFIRM', label: 'Duyệt / Hủy phiếu xuất kho' },
    ],
  },
  {
    id: 'page_stock_check',
    pageName: 'Kiểm kê kho',
    category: 'Hàng hóa & Kho',
    viewPermission: 'STOCK_CHECK_VIEW',
    subPermissions: [
      { code: 'STOCK_CHECK_CREATE', label: 'Tạo phiếu kiểm kê' },
      { code: 'STOCK_CHECK_COUNT', label: 'Đếm sản phẩm kiểm kê' },
      { code: 'STOCK_CHECK_APPROVE', label: 'Duyệt kết quả kiểm kê' },
      { code: 'STOCK_CHECK_CANCEL', label: 'Hủy phiếu kiểm kê' },
    ],
  },
  {
    id: 'page_sales_orders',
    pageName: 'Đơn hàng & POS',
    category: 'Bán hàng',
    viewPermission: '',
    subPermissions: [
      { codes: ['SALE_CREATE', 'SALE_UPDATE', 'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PRINT_VIEW', 'PROMOTION_VIEW', 'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE', 'CUSTOMER_DELETE'], label: 'Bán hàng' },
      { codes: ['SHIFT_CREATE', 'SHIFT_UPDATE', 'SHIFT_FORCE_CLOSE'], label: 'Quản lý ca bán (POS)' },
    ],
  },
  {
    id: 'page_suppliers',
    pageName: 'Mua hàng & Nhà cung cấp',
    category: 'Mua hàng & NCC',
    viewPermission: 'SUPPLIER_VIEW',
    subPermissions: [
      { code: 'SUPPLIER_CREATE', label: 'Thêm nhà cung cấp' },
      { code: 'SUPPLIER_UPDATE', label: 'Sửa thông tin nhà cung cấp' },
      { code: 'SUPPLIER_DELETE', label: 'Xóa nhà cung cấp' },
      { code: 'SUPPLIER_PAYMENT_CREATE', label: 'Tạo thanh toán cho NCC' },
      { code: 'SUPPLIER_PAYMENT_DELETE', label: 'Xóa thanh toán NCC' },
    ],
  },
  {
    id: 'page_expenses',
    pageName: 'Thu chi & Chi phí',
    category: 'Chi phí',
    viewPermission: 'EXPENSE_VIEW',
    subPermissions: [
      { code: 'EXPENSE_CREATE', label: 'Tạo phiếu chi' },
      { code: 'EXPENSE_CONFIRM', label: 'Duyệt / Hủy phiếu chi' },
      { code: 'EXPENSE_CATEGORY_MANAGE', label: 'Quản lý danh mục chi phí' },
    ],
  },
  {
    id: 'page_staff_management',
    pageName: 'Hệ thống quản lý',
    category: 'Hệ thống & Nhân sự',
    viewPermission: 'STAFF_VIEW',
    subPermissions: [
      { codes: ['STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE'], label: 'Quản lý nhân viên' },
      { code: 'SHIFT_VIEW', label: 'Xem lịch sử ca bán (Kho)' },
    ],
  },
];

/**
 * Lấy tất cả các permission code từ một nhóm trang (bao gồm cả viewPermission)
 */
export const getAllCodesForPage = (page) => {
  const codes = [];
  if (page.viewPermission) codes.push(page.viewPermission);
  page.subPermissions.forEach((sub) => {
    if (sub.codes) {
      codes.push(...sub.codes);
    } else if (sub.code) {
      codes.push(sub.code);
    }
  });
  return codes;
};

/**
 * Lấy tất cả permission code từ tất cả các trang
 */
export const getAllPagePermissionCodes = () => {
  const codes = [];
  PAGE_PERMISSION_GROUPS.forEach((page) => {
    codes.push(...getAllCodesForPage(page));
  });
  return [...new Set(codes)];
};

/**
 * Mapping từ permission code -> viewPermission của trang cha.
 * Dùng để auto-include quyền VIEW khi chọn quyền thao tác.
 */
export const PERMISSION_TO_VIEW = {};
PAGE_PERMISSION_GROUPS.forEach((page) => {
  if (!page.viewPermission) return;
  const all = getAllCodesForPage(page);
  all.forEach((code) => {
    if (code !== page.viewPermission) {
      PERMISSION_TO_VIEW[code] = page.viewPermission;
    }
  });
});

/**
 * Lay tat ca cac permission code tu 1 subPermission (ho tro ca nhom codes).
 */
export const getSubPermissionCodes = (sub) => {
  if (sub.codes) return sub.codes;
  if (sub.code) return [sub.code];
  return [];
};
