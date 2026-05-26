/**
 * Mock data POS - Danh mục, sản phẩm, giỏ hàng mẫu, phương thức TT, đơn hàng mẫu.
 * Dữ liệu fallback khi API chưa sẵn sàng.
 */
export const posCategories = [
  'Tất cả',
  'Máy móc',
  'Dụng cụ cầm tay',
  'Vật liệu xây dựng',
  'Sơn & Chống thấm',
  'Bulong & Ốc vít',
  'Kim khí tổng hợp',
];

export const posProducts = [
  {
    id: 1,
    name: 'Máy khoan động lực Bosch GSB 16 RE',
    price: 1550000,
    sku: 'BOS-GSB-16RE',
    stock: 25,
    category: 'Máy móc',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Chống thấm cao cấp KOVA CT-11A Plus 20kg',
    price: 3450000,
    sku: 'KOV-CT11A-20',
    stock: 4,
    category: 'Sơn & Chống thấm',
    status: 'Sắp hết',
    image:
      'https://images.unsplash.com/photo-1597595749882-66556d4a3b55?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Kìm bấm cos thủy lực YQK-300',
    price: 950000,
    sku: 'KIM-THUY-LUC',
    stock: 12,
    category: 'Dụng cụ cầm tay',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Đá mài sắt Hải Dương 100×6×16mm',
    price: 5500,
    sku: 'DAI-MAI-HD',
    stock: 500,
    category: 'Kim khí tổng hợp',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Bộ lục giác Chrome-Vanadium 9 chi tiết',
    price: 125000,
    sku: 'LUC-GIAC-CRV',
    stock: 45,
    category: 'Dụng cụ cầm tay',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Bulong inox M10 × 50mm hộp 100 chiếc',
    price: 185000,
    sku: 'BUL-M10-50',
    stock: 86,
    category: 'Bulong & Ốc vít',
    status: 'Còn hàng',
    image:
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=900&auto=format&fit=crop',
  },
];

export const initialCart = [
  { ...posProducts[0], quantity: 1 },
  { ...posProducts[1], quantity: 1 },
  { ...posProducts[2], quantity: 1 },
];

export const mockPosProducts = [
  {
    id: 1,
    name: 'Áo sơ mi nam',
    barcode: '8934234223231',
    price: 250000,
    image: 'https://via.placeholder.com/100',
    category: 'Quần áo',
    stock: 45,
  },
  {
    id: 2,
    name: 'Quần jean nam',
    barcode: '8934234223232',
    price: 350000,
    image: 'https://via.placeholder.com/100',
    category: 'Quần áo',
    stock: 8,
  },
  {
    id: 3,
    name: 'Giày thể thao',
    barcode: '8934234223233',
    price: 450000,
    image: 'https://via.placeholder.com/100',
    category: 'Giày dép',
    stock: 0,
  },
  {
    id: 4,
    name: 'Mũ lưỡi trai',
    barcode: '8934234223234',
    price: 120000,
    image: 'https://via.placeholder.com/100',
    category: 'Phụ kiện',
    stock: 32,
  },
];

export const mockCategories = ['Quần áo', 'Giày dép', 'Phụ kiện'];

export const mockPaymentMethods = [
  { id: 'cash', name: 'Tiền mặt', icon: '💵' },
  { id: 'card', name: 'Thẻ', icon: '💳' },
  { id: 'transfer', name: 'Chuyển khoản', icon: '📱' },
];

export const mockOrders = [
  {
    id: 'ORD001',
    date: '2024-05-08',
    totalAmount: 600000,
    items: 2,
    paymentMethod: 'cash',
    status: 'completed',
  },
  {
    id: 'ORD002',
    date: '2024-05-08',
    totalAmount: 1200000,
    items: 4,
    paymentMethod: 'card',
    status: 'completed',
  },
];

const mockPosData = {
  posCategories,
  posProducts,
  initialCart,
  mockPosProducts,
  mockCategories,
  mockPaymentMethods,
  mockOrders,
};
export default mockPosData;
