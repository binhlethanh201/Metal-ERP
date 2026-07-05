/**
 * Cấu trúc Sidebar
 */
export const sidebarItems = [
  {
    label: 'Tổng quan',
    icon: 'dashboard',
    path: '/inventory/dashboard',
  },
  {
    label: 'Hàng hóa & Kho',
    icon: 'inventory_2',
    children: [
      { label: 'Danh sách hàng hóa', path: '/inventory/products' },
      { label: 'Nhập kho', path: '/inventory/import' },
      { label: 'Xuất kho', path: '/inventory/export' },
      { label: 'Kiểm kê kho', path: '/inventory/inventory-check' },
      { label: 'Tổng hợp tồn kho', path: '/inventory/inventory-summary' },
      { label: 'Lịch sử Xuất/Nhập', path: '/inventory/transactions', ownerOnly: true },
    ],
  },
  {
    label: 'Đơn hàng',
    icon: 'shopping_cart',
    children: [
      { label: 'Danh sách đơn hàng', path: '/inventory/orders' },
      { label: 'Xử lý đơn', path: '/inventory/orders/processing' },
      { label: 'Giao hàng', path: '/inventory/orders/shipping' },
      { label: 'Đổi trả hàng', path: '/inventory/orders/returns' },
    ],
  },
  {
    label: 'Mua hàng & NCC',
    icon: 'shopping_bag',
    ownerOnly: true,
    children: [
      { label: 'Danh sách NCC', path: '/inventory/suppliers' },
      { label: 'Đặt hàng mua', path: '/inventory/purchasing/orders' },
      { label: 'Nhập hàng mua', path: '/inventory/purchasing/import' },
      { label: 'Trả lại hàng mua', path: '/inventory/purchasing/returns' },
    ],
  },
  {
    label: 'Quỹ tiền',
    icon: 'account_balance_wallet',
    ownerOnly: true,
    children: [
      { label: 'Thu tiền', path: '/inventory/funds/receipts' },
      { label: 'Chi tiền', path: '/inventory/funds/payments' },
      { label: 'Sổ quỹ', path: '/inventory/funds/ledger' },
      { label: 'Đối soát quỹ', path: '/inventory/funds/reconciliation' },
    ],
  },
  {
    label: 'Khuyến mại',
    icon: 'sell',
    children: [
      { label: 'Chương trình chiết khấu', path: '/inventory/promotions' },
      { label: 'Voucher chiết khấu', path: '/inventory/promotions/vouchers' },
    ],
  },
  {
    label: 'Hệ thống & Nhân sự',
    icon: 'manage_accounts',
    ownerOnly: true,
    children: [{ label: 'Quản lý nhân viên', path: '/inventory/employees' }],
  },
  {
    label: 'Báo cáo',
    icon: 'assessment',
    children: [
      // staffOnly: Nếu là Owner sẽ bị ẩn, chỉ Staff mới thấy
      { label: 'Báo cáo kho', path: '/inventory/reports', staffOnly: true },
      // ownerOnly: Nếu là Staff sẽ bị ẩn, chỉ Owner mới thấy
      { label: 'Báo cáo Tổng hợp', path: '/inventory/owner-reports', ownerOnly: true },
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
