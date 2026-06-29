/**
 * POS Service - Tất cả API calls cho module Bán hàng.
 * Gọi qua apiClient + endpoints tập trung.
 * Backend: MEP.Sale.Api (ASP.NET Core 8) - 28 endpoints.
 */
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ============ Products ============
export const getPosProducts = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint = params
    ? `${ENDPOINTS.POS.GET_POS_PRODUCTS}?${params}`
    : ENDPOINTS.POS.GET_POS_PRODUCTS;
  return apiGet(endpoint);
};

export const getProductPrice = (productId) => {
  return apiGet(ENDPOINTS.POS.GET_PRODUCT_PRICE(productId));
};

export const getProductStock = (productId) => {
  return apiGet(ENDPOINTS.POS.GET_PRODUCT_STOCK(productId));
};

export const searchProducts = (keyword) => {
  const params = new URLSearchParams({ keyword }).toString();
  return apiGet(`${ENDPOINTS.POS.GET_POS_PRODUCTS}?${params}`);
};

// ============ Invoices ============
/** Tạo hóa đơn mới (Draft) */
export const createInvoice = (data = {}) => {
  return apiPost(ENDPOINTS.POS.CREATE_INVOICE, data);
};

/** Lấy chi tiết 1 hóa đơn */
export const getInvoice = (invoiceId) => {
  return apiGet(ENDPOINTS.POS.GET_INVOICE(invoiceId));
};

/** Lịch sử hóa đơn (filter: status, dateFrom, dateTo, staffId, page) */
export const getInvoiceHistory = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint = params
    ? `${ENDPOINTS.POS.GET_INVOICE_HISTORY}?${params}`
    : ENDPOINTS.POS.GET_INVOICE_HISTORY;
  return apiGet(endpoint);
};

/** Danh sách hóa đơn đang treo */
export const getInvoicesOnHold = (page = 1) => {
  return apiGet(`${ENDPOINTS.POS.GET_INVOICES_ON_HOLD}?page=${page}`);
};

// ============ Invoice Items ============
/** Thêm sản phẩm vào hóa đơn */
export const addItem = (invoiceId, data) => {
  return apiPost(ENDPOINTS.POS.ADD_ITEM(invoiceId), data);
};

/** Quét barcode để thêm sản phẩm */
export const scanItem = (invoiceId, data) => {
  return apiPost(ENDPOINTS.POS.SCAN_ITEM(invoiceId), data);
};

/** Tìm sản phẩm để thêm (theo tên/SKU) - POST body: { keyword } */
export const searchItem = (invoiceId, data) => {
  return apiPost(ENDPOINTS.POS.SEARCH_ITEM(invoiceId), data);
};

/** Lấy danh sách items của hóa đơn */
export const getInvoiceItems = (invoiceId) => {
  return apiGet(ENDPOINTS.POS.GET_ITEMS(invoiceId));
};

// ============ Invoice Actions ============
/** Thanh toán hóa đơn (Draft → Completed) */
export const finalizeInvoice = (invoiceId) => {
  return apiPost(ENDPOINTS.POS.FINALIZE_INVOICE(invoiceId), {});
};

/** Hủy hóa đơn (Draft/OnHold → Cancelled) */
export const cancelInvoice = (invoiceId) => {
  return apiPatch(ENDPOINTS.POS.CANCEL_INVOICE(invoiceId), {});
};

/** Treo hóa đơn (Draft → OnHold) - lưu trạng thái giỏ hàng */
export const holdInvoice = (invoiceId, data = {}) => {
  return apiPost(ENDPOINTS.POS.HOLD_INVOICE(invoiceId), data);
};

/** Khôi phục hóa đơn đang treo (OnHold → Draft) */
export const resumeInvoice = (invoiceId) => {
  return apiPost(ENDPOINTS.POS.RESUME_INVOICE(invoiceId), {});
};

// ============ Payments ============
/** Tạo thanh toán (Cash/Transfer/Combined/Debt) */
export const createPayment = (invoiceId, data) => {
  return apiPost(ENDPOINTS.POS.CREATE_PAYMENT(invoiceId), data);
};

/** Lấy mã QR chuyển khoản */
export const getPaymentQR = (paymentId) => {
  return apiGet(ENDPOINTS.POS.GET_PAYMENT_QR(paymentId));
};

/** Xác nhận đã nhận tiền chuyển khoản */
export const confirmTransfer = (paymentId) => {
  return apiPost(ENDPOINTS.POS.CONFIRM_TRANSFER(paymentId), {});
};

/** Ghi nhận công nợ khách hàng */
export const recordDebt = (data) => {
  return apiPost(ENDPOINTS.POS.RECORD_DEBT, data);
};

// ============ Promotions ============
/** Áp dụng mã khuyến mãi */
export const applyPromo = (invoiceId, data) => {
  return apiPost(ENDPOINTS.POS.APPLY_PROMO(invoiceId), data);
};

/** Xóa mã khuyến mãi */
export const removePromo = (invoiceId) => {
  return apiDelete(ENDPOINTS.POS.REMOVE_PROMO(invoiceId));
};

// ============ Printing ============
/** In hóa đơn */
export const printInvoice = (invoiceId) => {
  return apiPost(ENDPOINTS.POS.PRINT_INVOICE(invoiceId), {});
};

/** Tải hóa đơn PDF */
export const downloadPdf = (invoiceId) => {
  return apiGet(ENDPOINTS.POS.DOWNLOAD_PDF(invoiceId));
};

// ============ Shift Management ============
/** Bắt đầu ca làm việc */
export const startShift = (data) => {
  return apiPost(ENDPOINTS.POS.START_SHIFT, data);
};

/** Kết thúc ca làm việc */
export const endShift = (shiftId, data) => {
  return apiPost(ENDPOINTS.POS.END_SHIFT(shiftId), data);
};

/** Tóm tắt ca làm việc */
export const getShiftSummary = (shiftId) => {
  return apiGet(ENDPOINTS.POS.GET_SHIFT_SUMMARY(shiftId));
};

/** Lịch sử ca làm việc */
export const listShifts = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint = params ? `${ENDPOINTS.POS.LIST_SHIFTS}?${params}` : ENDPOINTS.POS.LIST_SHIFTS;
  return apiGet(endpoint);
};

// ============ Customers ============
/** Danh sách khách hàng (filter: search, group, page, limit) */
export const getCustomers = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint = params
    ? `${ENDPOINTS.POS.GET_CUSTOMERS}?${params}`
    : ENDPOINTS.POS.GET_CUSTOMERS;
  return apiGet(endpoint);
};

export const getCustomer = (id) => {
  return apiGet(ENDPOINTS.POS.GET_CUSTOMER(id));
};

export const createCustomer = (data) => {
  return apiPost(ENDPOINTS.POS.CREATE_CUSTOMER, data);
};

export const updateCustomer = (id, data) => {
  return apiPut(ENDPOINTS.POS.UPDATE_CUSTOMER(id), data);
};

/** Lịch sử mua hàng của khách */
export const getCustomerOrders = (id, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const endpoint = `${ENDPOINTS.POS.GET_CUSTOMER_ORDERS(id)}${params ? '?' + params : ''}`;
  return apiGet(endpoint);
};

/** Xem điểm tích lũy (chỉ đọc) */
export const getCustomerPoints = (id) => {
  return apiGet(ENDPOINTS.POS.GET_CUSTOMER_POINTS(id));
};

// ============ Returns (Đổi trả hàng) ============
export const createReturn = (data) => apiPost(ENDPOINTS.POS.CREATE_RETURN, data);
export const getReturn = (id) => apiGet(ENDPOINTS.POS.GET_RETURN(id));
export const getReturnList = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return apiGet(ENDPOINTS.POS.LIST_RETURNS + (q ? '?' + q : ''));
};
export const addReturnItem = (returnId, data) =>
  apiPost(ENDPOINTS.POS.ADD_RETURN_ITEM(returnId), data);
export const finalizeReturn = (returnId, data) =>
  apiPost(ENDPOINTS.POS.FINALIZE_RETURN(returnId), data);
export const cancelReturn = (returnId) => apiPatch(ENDPOINTS.POS.CANCEL_RETURN(returnId), {});

export default {
  getPosProducts,
  getProductPrice,
  getProductStock,
  searchProducts,
  createInvoice,
  getInvoice,
  getInvoiceHistory,
  getInvoicesOnHold,
  addItem,
  scanItem,
  searchItem,
  getInvoiceItems,
  finalizeInvoice,
  cancelInvoice,
  holdInvoice,
  resumeInvoice,
  createPayment,
  getPaymentQR,
  confirmTransfer,
  recordDebt,
  applyPromo,
  removePromo,
  printInvoice,
  downloadPdf,
  startShift,
  endShift,
  getShiftSummary,
  listShifts,
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  getCustomerOrders,
  getCustomerPoints,
  createReturn,
  getReturn,
  getReturnList,
  addReturnItem,
  finalizeReturn,
  cancelReturn,
};
