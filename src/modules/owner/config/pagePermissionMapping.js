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
    ],
  },
  {
    id: 'page_stock_inward',
    pageName: 'Nhập kho',
    category: 'Hàng hóa & Kho',
    viewPermission: 'STOCK_VIEW',
    subPermissions: [
      { code: 'STOCK_INWARD_CREATE', label: 'Tạo phiếu nhập kho' },
      { code: 'STOCK_INWARD_UPDATE', label: 'Cập nhật phiếu nhập kho' },
      { code: 'STOCK_INWARD_DELETE', label: 'Xóa phiếu nhập kho' },
    ],
  },
  {
    id: 'page_stock_outward',
    pageName: 'Xuất kho',
    category: 'Hàng hóa & Kho',
    viewPermission: 'STOCK_VIEW',
    subPermissions: [
      { code: 'STOCK_OUTWARD_CREATE', label: 'Tạo phiếu xuất kho' },
      { code: 'STOCK_OUTWARD_UPDATE', label: 'Cập nhật phiếu xuất kho' },
      { code: 'STOCK_OUTWARD_DELETE', label: 'Xóa phiếu xuất kho' },
      { code: 'STOCK_OUTWARD_CONFIRM', label: 'Xác nhận phiếu xuất kho' },
    ],
  },
  {
    id: 'page_stock_check',
    pageName: 'Kiểm kê kho',
    category: 'Hàng hóa & Kho',
    viewPermission: 'STOCK_CHECK_VIEW',
    subPermissions: [
      { code: 'STOCK_CHECK_CREATE', label: 'Tạo phiếu kiểm kê' },
      { code: 'STOCK_CHECK_APPROVE', label: 'Duyệt kết quả kiểm kê' },
      { code: 'STOCK_CHECK_CANCEL', label: 'Hủy phiếu kiểm kê' },
    ],
  },
  {
    id: 'page_sales_orders',
    pageName: 'Đơn hàng & POS',
    category: 'Bán hàng',
    viewPermission: 'SALE_VIEW',
    subPermissions: [
      { code: 'SALE_CREATE', label: 'Tạo đơn hàng mới (Bán hàng)' },
      { code: 'SALE_UPDATE', label: 'Cập nhật đơn hàng' },
      { code: 'SALE_DELETE', label: 'Xóa/Hủy đơn hàng' },
      { code: 'CUSTOMER_VIEW', label: 'Xem danh sách khách hàng' },
      { code: 'CUSTOMER_CREATE', label: 'Thêm khách hàng' },
      { code: 'CUSTOMER_UPDATE', label: 'Sửa thông tin khách hàng' },
      { code: 'CUSTOMER_DELETE', label: 'Xóa khách hàng' },
      { code: 'PAYMENT_VIEW', label: 'Xem lịch sử thanh toán' },
      { code: 'PAYMENT_CREATE', label: 'Thanh toán đơn hàng' },
      { code: 'PRINT_VIEW', label: 'In hóa đơn / phiếu' },
      { code: 'PROMOTION_VIEW', label: 'Xem chương trình khuyến mãi' },
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
      { code: 'SUPPLIER_PAYMENT_VIEW', label: 'Xem công nợ NCC' },
      { code: 'SUPPLIER_PAYMENT_CREATE', label: 'Tạo thanh toán cho NCC' },
    ],
  },
  {
    id: 'page_expenses',
    pageName: 'Thu chi & Chi phí',
    category: 'Chi phí',
    viewPermission: 'EXPENSE_VIEW',
    subPermissions: [
      { code: 'EXPENSE_CREATE', label: 'Tạo phiếu chi' },
      { code: 'EXPENSE_CONFIRM', label: 'Xác nhận/Duyệt chi phí' },
      { code: 'EXPENSE_CANCEL', label: 'Hủy phiếu chi' },
      { code: 'EXPENSE_CATEGORY_MANAGE', label: 'Quản lý danh mục chi phí' },
    ],
  },
  {
    id: 'page_staff_management',
    pageName: 'Quản lý nhân viên & Ca làm',
    category: 'Hệ thống & Nhân sự',
    viewPermission: 'STAFF_VIEW',
    subPermissions: [
      { code: 'STAFF_CREATE', label: 'Thêm nhân viên mới' },
      { code: 'STAFF_UPDATE', label: 'Sửa thông tin nhân viên' },
      { code: 'STAFF_DELETE', label: 'Xóa / Khóa tài khoản nhân viên' },
      { code: 'STAFF_ASSIGN_BRANCH', label: 'Điều chuyển chi nhánh' },
      { code: 'SHIFT_VIEW', label: 'Xem lịch sử ca bán' },
      { code: 'SHIFT_CREATE', label: 'Mở ca làm việc' },
      { code: 'SHIFT_UPDATE', label: 'Chốt ca / Cập nhật ca' },
      { code: 'SHIFT_FORCE_CLOSE', label: 'Chốt hộ ca làm việc' },
    ],
  },
  {
    id: 'page_reports',
    pageName: 'Báo cáo tổng hợp',
    category: 'Báo cáo',
    viewPermission: 'REPORT_VIEW',
    subPermissions: [],
  },
];

/**
 * Lấy tất cả các permission code từ một nhóm trang (bao gồm cả viewPermission)
 */
export const getAllCodesForPage = (page) => {
  const codes = [page.viewPermission];
  page.subPermissions.forEach((sub) => codes.push(sub.code));
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
  const all = getAllCodesForPage(page);
  all.forEach((code) => {
    if (code !== page.viewPermission) {
      PERMISSION_TO_VIEW[code] = page.viewPermission;
    }
  });
});
