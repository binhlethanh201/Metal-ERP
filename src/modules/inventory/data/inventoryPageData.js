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
    permissions: [
      'STOCK_VIEW',
      'PRODUCT_VIEW',
      'STOCK_INWARD_CREATE',
      'STOCK_OUTWARD_CREATE',
      'STOCK_CHECK_VIEW',
    ],
    children: [
      {
        label: 'Danh sách hàng hóa',
        path: '/inventory/products',
        permissions: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE'],
      },
      {
        label: 'Nhập kho',
        path: '/inventory/import',
        permissions: ['STOCK_INWARD_CREATE', 'STOCK_INWARD_UPDATE', 'STOCK_INWARD_DELETE'],
      },
      {
        label: 'Xuất kho',
        path: '/inventory/export',
        permissions: [
          'STOCK_OUTWARD_CREATE',
          'STOCK_OUTWARD_UPDATE',
          'STOCK_OUTWARD_DELETE',
          'STOCK_OUTWARD_CONFIRM',
        ],
      },
      {
        label: 'Kiểm kê kho',
        path: '/inventory/inventory-check',
        permissions: [
          'STOCK_CHECK_CREATE',
          'STOCK_CHECK_VIEW',
          'STOCK_CHECK_APPROVE',
          'STOCK_CHECK_CANCEL',
        ],
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
    permissions: ['SALE_VIEW'],
    children: [
      { label: 'Danh sách đơn hàng', path: '/inventory/orders', permissions: ['SALE_VIEW'] },
      { label: 'Lịch sử đổi trả', path: '/inventory/return-history', permissions: ['SALE_VIEW'] },
      // { label: 'Xử lý đơn', path: '/inventory/orders/processing' },
      // { label: 'Giao hàng', path: '/inventory/orders/shipping' },
      // { label: 'Đổi trả hàng', path: '/inventory/orders/returns' },
    ],
  },
  {
    label: 'Mua hàng & NCC',
    icon: 'shopping_bag',
    permissions: ['SUPPLIER_VIEW', 'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE'],
    children: [
      {
        label: 'Nhà cung cấp',
        path: '/inventory/suppliers',
        permissions: ['SUPPLIER_VIEW', 'SUPPLIER_CREATE', 'SUPPLIER_UPDATE', 'SUPPLIER_DELETE'],
      },
      // { label: 'Đặt hàng mua', path: '/inventory/purchasing/orders' },
      // { label: 'Nhập hàng mua', path: '/inventory/purchasing/import' },
      // { label: 'Trả lại hàng mua', path: '/inventory/purchasing/returns' },
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
      {
        label: 'Quản lý chi phí',
        path: '/inventory/expenses',
        permissions: ['EXPENSE_VIEW', 'EXPENSE_CREATE'],
      },
      {
        label: 'Loại chi phí',
        path: '/inventory/expense-categories',
        permissions: ['EXPENSE_CATEGORY_MANAGE', 'EXPENSE_VIEW'],
      },
    ],
  },
  {
    label: 'Hệ thống & Nhân sự',
    icon: 'UserCog',
    permissions: ['OWNER_MANAGE', 'STAFF_VIEW', 'SHIFT_VIEW', 'PRINT_VIEW', 'SYSTEM_MANAGE'],
    children: [
      {
        label: 'Quản lý nhân viên',
        path: '/inventory/employees',
        permissions: ['STAFF_VIEW', 'OWNER_MANAGE'],
      },
      { label: 'Lịch sử ca bán', path: '/inventory/shift-history', permissions: ['SHIFT_VIEW'] },
      {
        label: 'Cài đặt cửa hàng',
        path: '/inventory/store-settings',
        permissions: ['OWNER_MANAGE'],
      },
      {
        label: 'Cấu hình mẫu in',
        path: '/inventory/print-templates',
        permissions: ['PRINT_VIEW', 'OWNER_MANAGE'],
      },
      {
        label: 'Nhật ký hoạt động',
        path: '/inventory/audit-logs',
        permissions: ['SYSTEM_MANAGE', 'OWNER_MANAGE'],
      },
    ],
  },
  {
    label: 'Báo cáo',
    icon: 'assessment',
    permissions: ['REPORT_VIEW'],
    children: [
      // { label: 'Báo cáo kho', path: '/inventory/reports', permissions: ['REPORT_VIEW'] },
      {
        label: 'Báo cáo Tổng hợp',
        path: '/inventory/owner-reports',
        permissions: ['REPORT_VIEW', 'OWNER_MANAGE'],
      },
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
