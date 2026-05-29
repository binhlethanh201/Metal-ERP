/**
 * Goods Issue Utilities - Hàm tiện ích cho module Xuất Kho.
 * Bao gồm: normalize dữ liệu, format, build payload.
 */

export const extractList = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  if (response.result && Array.isArray(response.result.items)) return response.result.items;
  return [];
};

export const normalizeIssueRow = (item, index) => ({
  id: item.id || item.IssueId || item.issueId || `XK${String(index).padStart(3, '0')}`,
  issueNumber: item.issueNumber || item.IssueNumber || item.IssueNo || item.id || '',
  syncStatus: item.syncStatus || item.SyncStatus || 'Chưa đồng bộ',
  syncNumber: item.syncNumber || item.SyncNumber || '',
  date: item.date || item.Date || item.CreatedDate || new Date().toISOString(),
  reference: item.reference || item.Reference || '',
  customer: item.customer || item.Customer || item.CustomerName || '',
  totalAmount: Number(item.totalAmount || item.TotalAmount || item.total || 0),
  totalPayment: Number(item.totalPayment || item.TotalPayment || item.payment || 0),
  paymentMethod: item.paymentMethod || item.PaymentMethod || '',
  issueType: item.issueType || item.IssueType || item.Type || 'Xuất kho khác',
  createdBy: item.createdBy || item.CreatedBy || item.Creator || '',
});

export const buildIssuePayload = (header, lines) => ({
  IssueNumber: header.issueNumber,
  IssueType: header.issueType,
  CustomerId: header.customerId,
  CustomerName: header.customerName,
  Description: header.description,
  Reference: header.reference,
  Date: header.date,
  CreatedBy: header.createdBy,
  Lines: lines.map((line, idx) => ({
    LineNumber: idx + 1,
    ProductId: line.productId,
    ProductCode: line.productCode,
    ProductName: line.productName,
    LotNumber: line.lotNumber || '',
    ExpiryDate: line.expiryDate || '',
    WarehouseId: line.warehouseId,
    WarehouseName: line.warehouseName,
    Location: line.location || '',
    Unit: line.unit,
    Quantity: Number(line.quantity),
    UnitPrice: Number(line.unitPrice),
    TotalAmount: Math.round(Number(line.quantity) * Number(line.unitPrice)),
  })),
});

export const buildIssueLine = () => ({
  id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  productId: '',
  productCode: '',
  productName: '',
  lotNumber: '',
  expiryDate: '',
  warehouseId: 'KHO_TONG',
  warehouseName: 'Kho Tổng',
  location: '',
  unit: '',
  quantity: 1,
  unitPrice: 0,
  totalAmount: 0,
});

export const formatMoney = (value) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const goodsIssueUtils = {
  extractList,
  normalizeIssueRow,
  buildIssuePayload,
  buildIssueLine,
  formatMoney,
};

export default goodsIssueUtils;
