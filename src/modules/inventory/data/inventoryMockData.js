/**
 * Mock data cho trang Tổng kho MetalERP
 * Dữ liệu bám theo Figma/HTML: KPI, tài chính, biểu đồ, tin diễn đàn, giao dịch, quỹ tiền.
 */

export const dashboardKpis = [
  {
    id: 'total-stock',
    icon: 'inventory_2',
    label: 'TỔNG TỒN KHO',
    value: '12,450',
    unit: 'Đơn vị sản phẩm',
    change: '+2.4%',
    tone: 'navy',
  },
  {
    id: 'low-stock',
    icon: 'warning',
    label: 'SẮP HẾT HÀNG',
    value: '42',
    unit: 'Cần nhập kho ngay',
    tone: 'orange',
  },
  {
    id: 'out-stock',
    icon: 'error',
    label: 'HẾT HÀNG',
    value: '15',
    unit: 'Gây gián đoạn đơn hàng',
    tone: 'red',
  },
  {
    id: 'best-seller',
    icon: 'trending_up',
    label: 'HÀNG BÁN CHẠY',
    value: '108',
    unit: 'Trong 30 ngày qua',
    tone: 'green',
  },
];

export const financeKpis = [
  {
    id: 'revenue',
    label: 'DOANH THU (THÁNG)',
    value: '4.2B',
    unit: 'VND',
    progress: 75,
    tone: 'navy',
  },
  { id: 'cost', label: 'CHI PHÍ (THÁNG)', value: '1.8B', unit: 'VND', progress: 42, tone: 'slate' },
  { id: 'profit', label: 'LỢI NHUẬN', value: '2.4B', unit: 'VND', progress: 57, tone: 'green' },
  {
    id: 'orders',
    label: 'ĐƠN HÀNG',
    value: '856',
    unit: '',
    subtitle: 'Hoàn thành: 94%',
    tone: 'navy',
  },
];

export const inventoryTrend = [
  { day: 'T2', value: '7.2K', height: 60 },
  { day: 'T3', value: '8.4K', height: 75 },
  { day: 'T4', value: '9.8K', height: 90 },
  { day: 'T5', value: '7.6K', height: 65 },
  { day: 'T6', value: '8.9K', height: 80 },
  { day: 'T7', value: '10.2K', height: 95 },
  { day: 'CN', value: '9.4K', height: 85 },
];

export const forumProducts = [
  {
    id: 1,
    name: 'Sơn chống thấm KOVA thế hệ mới',
    image:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop',
    alt: 'Sơn chống thấm KOVA',
  },
  {
    id: 2,
    name: 'Máy khoan Bosch chính hãng GSB',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop',
    alt: 'Máy khoan Bosch',
  },
];

export const forumReports = [
  {
    id: 1,
    title: 'Dự báo giá thép Q4',
    desc: 'Phân tích biến động thị trường ASEAN',
    level: 'Cao',
    tone: 'red',
  },
  {
    id: 2,
    title: 'Xu hướng vật liệu xanh 2024',
    desc: 'Tiêu chuẩn xây dựng bền vững mới',
    level: 'Trung bình',
    tone: 'green',
  },
];

export const recentTransactions = [
  {
    id: 1,
    type: 'export',
    partner: 'Vinsteel - ĐH #9283',
    location: 'Khu công nghiệp VSIP I',
    time: '2 phút trước',
    amount: '12,400,000',
  },
  {
    id: 2,
    type: 'import',
    partner: 'MetalHub - Nhập kho',
    location: 'Lô B2, Khu chế xuất Tân Thuận',
    time: '1 giờ trước',
    amount: '85,000,000',
  },
  {
    id: 3,
    type: 'export',
    partner: 'Xây dựng Hòa Bình - ĐH #9280',
    location: 'Dự án Landmark 81',
    time: '3 giờ trước',
    amount: '245,500,000',
  },
  {
    id: 4,
    type: 'transfer',
    partner: 'Điều chuyển kho A → B',
    location: 'Nội bộ - Tối ưu vị trí',
    time: '5 giờ trước',
    amount: '---',
  },
];

export const cashSummary = {
  total: '1.54B',
  income: '+240M',
  expense: '-110M',
};

// Giữ lại data cũ cho các màn khác trong module inventory nếu đang dùng.
export const mockProducts = [
  {
    id: 1,
    name: 'Thép hộp mạ kẽm',
    sku: 'TH-MK-001',
    barcode: '8934234223231',
    category: 'Kim khí',
    price: 250000,
    stock: 45,
    minStock: 10,
    status: 'active',
  },
  {
    id: 2,
    name: 'Ống nước inox 304',
    sku: 'INOX-304-002',
    barcode: '8934234223232',
    category: 'Vật tư',
    price: 350000,
    stock: 8,
    minStock: 10,
    status: 'active',
  },
  {
    id: 3,
    name: 'Máy khoan bê tông',
    sku: 'MK-BT-003',
    barcode: '8934234223233',
    category: 'Dụng cụ',
    price: 450000,
    stock: 0,
    minStock: 15,
    status: 'inactive',
  },
  {
    id: 4,
    name: 'Bu lông lục giác',
    sku: 'BL-LG-004',
    barcode: '8934234223234',
    category: 'Phụ kiện',
    price: 120000,
    stock: 32,
    minStock: 10,
    status: 'active',
  },
];

export const mockStockMovements = [];
export const mockCategories = [
  { id: 1, name: 'Kim khí' },
  { id: 2, name: 'Vật tư' },
  { id: 3, name: 'Dụng cụ' },
];
export const mockImportSuggestions = [];

const mockData = {
  dashboardKpis,
  financeKpis,
  inventoryTrend,
  forumProducts,
  forumReports,
  recentTransactions,
  cashSummary,
  mockProducts,
  mockStockMovements,
  mockCategories,
  mockImportSuggestions,
};

export default mockData;
