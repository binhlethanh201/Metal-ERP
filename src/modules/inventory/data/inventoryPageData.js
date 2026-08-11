/**
 * Cấu trúc Sidebar
 */
export const sidebarItems = [
  {
    label: 'Tổng quan',
    icon: 'dashboard',
    path: '/inventory/dashboard',
    permissions: ['STOCK_VIEW'],
    hideWhenPermissions: ['OWNER_MANAGE'],
  },
  {
    label: 'Tổng quan',
    icon: 'dashboard',
    path: '/inventory/owner-dashboard',
    permissions: ['OWNER_MANAGE'],
  },
  {
    label: 'Hàng hóa & Kho',
    icon: 'inventory_2',
    permissions: ['STOCK_VIEW', 'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_CATEGORY_MANAGE', 'STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE', 'STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_CONFIRM', 'STOCK_CHECK_VIEW', 'STOCK_CHECK_CREATE', 'STOCK_CHECK_COUNT', 'STOCK_CHECK_APPROVE', 'STOCK_CHECK_CANCEL'],
    children: [
      {
        label: 'Danh sách hàng hóa',
        path: '/inventory/products',
        permissions: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_CATEGORY_MANAGE'],
      },
      {
        label: 'Nhập kho',
        path: '/inventory/import',
        permissions: ['STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE'],
      },
      {
        label: 'Xuất kho',
        path: '/inventory/export',
        permissions: ['STOCK_OUTWARD_CREATE', 'STOCK_OUTWARD_CONFIRM'],
      },
      {
        label: 'Kiểm kê kho',
        path: '/inventory/inventory-check',
        permissions: ['STOCK_CHECK_CREATE', 'STOCK_CHECK_COUNT', 'STOCK_CHECK_VIEW', 'STOCK_CHECK_APPROVE', 'STOCK_CHECK_CANCEL'],
      },
      {
        label: 'Lịch sử Xuất/Nhập',
        path: '/inventory/transactions',
        permissions: ['STOCK_VIEW'],
      },
    ],
  },
  {
    label: 'Đơn hàng',
    icon: 'shopping_cart',
    permissions: ['OWNER_MANAGE'],
    children: [
      { label: 'Danh sách đơn hàng', path: '/inventory/orders', permissions: ['OWNER_MANAGE'] },
      { label: 'Lịch sử đổi trả', path: '/inventory/return-history', permissions: ['OWNER_MANAGE'] },
    ],
  },
  {
    label: 'Mua hàng & NCC',
    icon: 'shopping_bag',
    permissions: ['SUPPLIER_VIEW', 'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE', 'SUPPLIER_PAYMENT_VIEW', 'SUPPLIER_PAYMENT_CREATE', 'SUPPLIER_PAYMENT_DELETE'],
    children: [
      { label: 'Nhà cung cấp', path: '/inventory/suppliers', permissions: ['SUPPLIER_VIEW', 'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE'] },
      { label: 'Công nợ NCC', path: '/inventory/supplier-debt', permissions: ['SUPPLIER_PAYMENT_VIEW'], hideWhenPermissions: ['OWNER_MANAGE'] },
      { label: 'Thanh toán NCC', path: '/inventory/supplier-payments', permissions: ['SUPPLIER_PAYMENT_CREATE', 'SUPPLIER_PAYMENT_DELETE'], hideWhenPermissions: ['OWNER_MANAGE'] },
    ],
  },
  // {
  //   label: 'Quỹ tiền',
  //   icon: 'account_balance_wallet',
  //   ownerOnly: true,
  //   children: [
  //     { label: 'Thu tiền', path: '/inventory/funds/receipts' },
  //     { label: 'Chi tiền', path: '/inventory/funds/payments' },
  //     { label: 'Sổ quỹ', path: '/inventory/funds/ledger' },
  //     { label: 'Đối soát quỹ', path: '/inventory/funds/reconciliation' },
  //   ],
  // },
  // {
  //   label: 'Khuyến mại',
  //   icon: 'sell',
  //   children: [
  //     { label: 'Chương trình chiết khấu', path: '/inventory/promotions' },
  //     { label: 'Voucher chiết khấu', path: '/inventory/promotions/vouchers' },
  //   ],
  // },

  {
    label: 'Chi phí',
    icon: 'request_quote',
    permissions: ['EXPENSE_VIEW'],
    children: [
      { label: 'Quản lý chi phí', path: '/inventory/expenses', permissions: ['EXPENSE_VIEW'] },
      { label: 'Loại chi phí', path: '/inventory/expense-categories', permissions: ['EXPENSE_CATEGORY_MANAGE'] },
    ],
  },
  {
    label: 'Hệ thống & Nhân sự',
    icon: 'UserCog',
    permissions: ['OWNER_MANAGE', 'STAFF_VIEW', 'SHIFT_VIEW', 'SYSTEM_MANAGE'],
    children: [
      { label: 'Quản lý nhân viên', path: '/inventory/employees', permissions: ['STAFF_VIEW', 'STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE', 'STAFF_ASSIGN_BRANCH'] },
      { label: 'Lịch sử ca bán', path: '/inventory/shift-history', permissions: ['SHIFT_VIEW'] },
      { label: 'Cài đặt cửa hàng', path: '/inventory/store-settings', permissions: ['OWNER_MANAGE'] },
      { label: 'Cấu hình mẫu in', path: '/inventory/print-templates', permissions: ['PRINT_VIEW'] },
      { label: 'Nhật ký hoạt động', path: '/inventory/audit-logs', permissions: ['SYSTEM_MANAGE', 'OWNER_MANAGE'] },
    ],
  },
  {
    label: 'Báo cáo',
    icon: 'assessment',
    permissions: ['OWNER_MANAGE'],
    children: [
      { label: 'Báo cáo Tổng hợp', path: '/inventory/reports', permissions: ['OWNER_MANAGE'] },
    ],
  },
];

/* ========== Tone Classes ========== */
export const transactionToneClass = {
  export: 'bg-blue-50 text-blue-600',
  import: 'bg-green-50 text-green-600',
  transfer: 'bg-orange-50 text-orange-600',
};

export const primaryToneClass = {
  navy: 'bg-blue-50 text-[#004785]',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
};
