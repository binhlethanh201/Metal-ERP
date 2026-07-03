/**
 * Config data tập trung cho toàn bộ module Tổng kho: sidebar, tabs, hub configs, tone classes.
 * Mọi dữ liệu cấu hình của tất cả các page đều nằm ở đây.
 */

/* ========== Sidebar ========== */
export const sidebarItems = [
  { label: 'Tổng quan', icon: 'dashboard', path: '/inventory/dashboard' },
  { label: 'Hàng hóa', icon: 'inventory_2', path: '/inventory/products' },
  { label: 'Báo cáo', icon: 'assessment', path: '/inventory/reports' },
  { label: 'Quản lý chi nhánh', icon: 'store', path: '/inventory/branches', ownerOnly: true },
  { label: 'Quản lý nhân viên', icon: 'badge', path: '/inventory/employees', ownerOnly: true },
];

export const inventoryMenuGroups = [
  {
    title: 'QUẢN LÝ VẬN HÀNH',
    items: [
      { label: 'Tổng quan', icon: 'dashboard', active: true, path: '/inventory/dashboard' },
      { label: 'Hàng hóa', icon: 'inventory_2' },
      { label: 'Nhập kho', icon: 'move_to_inbox' },
      { label: 'Xuất kho', icon: 'outbox' },
      { label: 'Vị trí kho', icon: 'location_on' },
    ],
  },
  {
    title: 'KINH DOANH',
    items: [
      { label: 'Tài chính', icon: 'payments' },
      { label: 'Đơn hàng', icon: 'shopping_cart' },
      { label: 'Nhà cung cấp', icon: 'groups' },
    ],
  },
  { title: 'KẾT NỐI & DỮ LIỆU', items: [] },
];

/* ========== Top Tabs / Navigation ========== */
export const horizontalNav = [
  { key: 'inventory', label: 'Kho hàng', icon: 'inventory_2' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { key: 'suppliers', label: 'Nhà cung cấp', icon: 'groups' },
  { key: 'promotions', label: 'Chiết khấu', icon: 'sell' },
  { key: 'funds', label: 'Quỹ tiền', icon: 'account_balance_wallet' },
  { key: 'purchasing', label: 'Mua hàng', icon: 'shopping_bag' },
];

export const topTabs = [
  { key: 'inventory', label: 'Kho hàng', icon: 'inventory_2' },
  { key: 'orders', label: 'Đơn hàng', icon: 'shopping_cart' },
  { key: 'suppliers', label: 'Nhà cung cấp', icon: 'groups' },
  { key: 'promotions', label: 'Chiết khấu', icon: 'sell' },
  { key: 'funds', label: 'Quỹ tiền', icon: 'account_balance_wallet' },
  { key: 'purchasing', label: 'Mua hàng', icon: 'shopping_bag' },
];

/* ========== Hub Configs ========== */
export const hubConfigs = {
  inventory: {
    centerLabel: 'Kho hàng',
    centerIcon: 'inventory_2',
    actions: [
      { id: 'inv-1', label: 'Nhập kho', icon: 'input', path: '/inventory/import' },
      { id: 'inv-2', label: 'Dieu chuyen tu CH khac', icon: 'store' },
      { id: 'inv-3', label: 'Xuất kho', icon: 'output', path: '/inventory/goods-issue' },
      { id: 'inv-4', label: 'Chuyển kho', icon: 'swap_horiz' },
      { id: 'inv-5', label: 'Lệnh điều chuyển', icon: 'assignment' },
      { id: 'inv-6', label: 'Kiểm kê kho', icon: 'inventory', path: '/inventory/inventory-count' },
      {
        id: 'inv-7',
        label: 'Tổng hợp tồn kho',
        icon: 'list_alt',
        path: '/inventory/inventory-summary',
      },
      { id: 'inv-8', label: 'Tính giá xuất kho', icon: 'calculate' },
    ],
  },
  orders: {
    centerLabel: 'Đơn hàng',
    centerIcon: 'shopping_cart',
    actions: [
      { id: 'ord-1', label: 'Đơn hàng', icon: 'add_shopping_cart', path: '/inventory/orders' },
      { id: 'ord-2', label: 'Xử lý đơn', icon: 'inventory_2' },
      { id: 'ord-3', label: 'Giao hàng', icon: 'local_shipping' },
      { id: 'ord-4', label: 'Đổi trả', icon: 'cached' },
    ],
  },
  suppliers: {
    centerLabel: 'Nhà cung cấp',
    centerIcon: 'groups',
    actions: [
      { id: 'sup-1', label: 'Danh sách NCC', icon: 'list_alt' },
      { id: 'sup-2', label: 'Đánh giá NCC', icon: 'star' },
      { id: 'sup-3', label: 'Công nợ NCC', icon: 'request_quote' },
      { id: 'sup-4', label: 'Lịch sử hợp tác', icon: 'history' },
    ],
  },
  promotions: {
    centerLabel: 'Chiết khấu',
    centerIcon: 'sell',
    actions: [
      { id: 'pro-1', label: 'Chương trình chiết khấu', icon: 'campaign' },
      { id: 'pro-2', label: 'Voucher chiết khấu', icon: 'card_giftcard' },
    ],
  },
  funds: {
    centerLabel: 'Quỹ tiền',
    centerIcon: 'account_balance_wallet',
    actions: [
      { id: 'fund-1', label: 'Thu tiền', icon: 'south_west' },
      { id: 'fund-2', label: 'Chi tiền', icon: 'north_east' },
      { id: 'fund-3', label: 'Sổ quỹ', icon: 'menu_book' },
      { id: 'fund-4', label: 'Đối soát quỹ', icon: 'balance' },
    ],
  },
  purchasing: {
    centerLabel: 'Mua hàng',
    centerIcon: 'shopping_bag',
    actions: [
      { id: 'buy-1', label: 'Báo hàng', icon: 'notifications_active' },
      { id: 'buy-2', label: 'Nhập hàng', icon: 'inventory_2' },
      { id: 'buy-3', label: 'Đặt hàng', icon: 'assignment_add' },
      { id: 'buy-4', label: 'Trả lại hàng mua', icon: 'assignment_return' },
      { id: 'buy-5', label: 'Trả', icon: 'reply' },
    ],
  },
};

/* ========== Tone Classes ========== */
export const primaryToneClass = {
  navy: 'bg-blue-50 text-[#004785] group-hover:bg-[#004785] group-hover:text-white',
  orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  red: 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
  green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
};

export const progressToneClass = {
  navy: 'bg-[#004785]',
  slate: 'bg-slate-400',
  green: 'bg-green-500',
};

export const transactionToneClass = {
  export: 'bg-blue-50 text-blue-600',
  import: 'bg-green-50 text-green-600',
  transfer: 'bg-orange-50 text-orange-600',
};
