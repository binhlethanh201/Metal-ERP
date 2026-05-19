/**
 * Mock data cho POS Module
 */

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
  mockPosProducts,
  mockCategories,
  mockPaymentMethods,
  mockOrders,
};

export default mockPosData;
