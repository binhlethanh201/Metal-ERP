/**
 * POS Service - Tất cả API calls cho module Bán hàng.
 * Backend: http://localhost:5100/api/pos/*
 * Auth: Bearer {token}. Test: sale.bac01@mep.vn / MEP@2026
 * Flow chính: Invoice-based (create invoice → add items → hold|resume → payments → finalize)
 */
import { apiPosGet, apiPosPost, apiPosPatch, apiPosPut } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ============ Products ============
export const getPosProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_POS_PRODUCTS}${qs ? '?' + qs : ''}`);
};

export const getProductPrice = (productId) => {
  return apiPosGet(ENDPOINTS.POS.GET_PRODUCT_PRICE(productId));
};

export const getProductStock = (productId) => {
  return apiPosGet(ENDPOINTS.POS.GET_PRODUCT_STOCK(productId));
};

// ============ Invoices (Hóa đơn) ============
// GET  /pos/invoices?status=Completed → PageResultDto<InvoiceDto> (lịch sử đơn)
// POST /pos/invoices → InvoiceDto (status = Draft)
// POST /pos/invoices/:id/items → InvoiceItemDto
// POST /pos/invoices/:id/items/scan → InvoiceItemDto
// POST /pos/invoices/:id/hold → InvoiceDto (status = OnHold)
// GET  /pos/invoices/on-hold → PageResultDto<InvoiceDto>
// POST /pos/invoices/:id/resume → InvoiceDto (status = Draft)
// POST /pos/invoices/:id/finalize → InvoiceDto (status = Completed, trừ kho)
// PATCH /pos/invoices/:id/cancel → OK

export const getOrders = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_ORDERS}${qs ? '?' + qs : ''}`);
};

export const createInvoice = (data = {}) => {
  return apiPosPost(ENDPOINTS.POS.CREATE_INVOICE, data);
};

export const getInvoice = (invoiceId) => {
  return apiPosGet(ENDPOINTS.POS.GET_INVOICE(invoiceId));
};

export const getInvoicesOnHold = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_INVOICES_ON_HOLD}${qs ? '?' + qs : ''}`);
};

export const addInvoiceItem = (invoiceId, item) => {
  return apiPosPost(ENDPOINTS.POS.ADD_INVOICE_ITEM(invoiceId), item);
};

export const scanBarcode = (invoiceId, { barcode, quantity = 1 }) => {
  return apiPosPost(ENDPOINTS.POS.SCAN_BARCODE(invoiceId), { barcode, quantity });
};

export const holdInvoice = (invoiceId, data = {}) => {
  return apiPosPost(ENDPOINTS.POS.HOLD_INVOICE(invoiceId), data);
};

export const resumeInvoice = (invoiceId) => {
  return apiPosPost(ENDPOINTS.POS.RESUME_INVOICE(invoiceId), {});
};

export const finalizeInvoice = (invoiceId) => {
  return apiPosPost(ENDPOINTS.POS.FINALIZE_INVOICE(invoiceId), {});
};

export const cancelInvoice = (invoiceId) => {
  return apiPosPatch(ENDPOINTS.POS.CANCEL_INVOICE(invoiceId), {});
};

// ============ Payments ============
// POST /pos/invoices/:id/payments → PaymentDto
// GET  /pos/payments/:id/qr → PaymentDto (polling)
// POST /pos/payments/:id/confirm-transfer → OK

export const createPayment = (invoiceId, paymentData) => {
  return apiPosPost(ENDPOINTS.POS.CREATE_PAYMENT(invoiceId), paymentData);
};

export const getPaymentQR = (paymentId) => {
  return apiPosGet(ENDPOINTS.POS.GET_PAYMENT_QR(paymentId));
};

export const confirmTransfer = (paymentId) => {
  return apiPosPost(ENDPOINTS.POS.CONFIRM_TRANSFER(paymentId), {});
};

// ============ Shift Management ============
// POST /pos/shifts/start → ShiftDto (status = OPEN)
// GET  /pos/shifts/:id/summary → ShiftDto
// POST /pos/shifts/:id/end → ShiftDto (status = CLOSED)

export const startShift = (data) => {
  return apiPosPost(ENDPOINTS.POS.START_SHIFT, data);
};

export const getShifts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_SHIFTS}${qs ? '?' + qs : ''}`);
};

export const getOrdersByUser = (userId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`/pos/invoices?${qs}`);
};

export const getShiftSummary = (shiftId) => {
  return apiPosGet(ENDPOINTS.POS.GET_SHIFT_SUMMARY(shiftId));
};

export const endShift = (shiftId, data) => {
  return apiPosPost(ENDPOINTS.POS.END_SHIFT(shiftId), data);
};

// ============ Customers ============
// GET /pos/customers → PageResultDto<CustomerDto>
// GET /pos/customers/:id → CustomerDto
// POST /pos/customers → CustomerDto
// PUT /pos/customers/:id → CustomerDto
// GET /pos/customers/:id/orders → InvoiceDto[]

export const getCustomers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_CUSTOMERS}${qs ? '?' + qs : ''}`);
};

export const getCustomer = (customerId) => {
  return apiPosGet(ENDPOINTS.POS.GET_CUSTOMER(customerId));
};

export const createCustomer = (data) => {
  return apiPosPost(ENDPOINTS.POS.CREATE_CUSTOMER, data);
};

export const updateCustomer = (customerId, data) => {
  return apiPosPut(ENDPOINTS.POS.UPDATE_CUSTOMER(customerId), data);
};

export const getCustomerOrders = (customerId) => {
  return apiPosGet(ENDPOINTS.POS.GET_CUSTOMER_ORDERS(customerId));
};

// ============ Returns (Đổi trả) ============
// GET  /pos/returns → PageResultDto<ReturnDto>
// GET  /pos/returns/:id → ReturnDto
// POST /pos/returns → ReturnDto
// POST /pos/returns/:id/items → ReturnItemDto
// POST /pos/returns/:id/finalize → OK (hoàn kho + hoàn tiền)
// PATCH /pos/returns/:id/cancel → OK

export const getReturns = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiPosGet(`${ENDPOINTS.POS.GET_RETURNS}${qs ? '?' + qs : ''}`);
};

export const getReturn = (returnId) => {
  return apiPosGet(ENDPOINTS.POS.GET_RETURN(returnId));
};

export const createReturn = (data) => {
  return apiPosPost(ENDPOINTS.POS.CREATE_RETURN, data);
};

export const addReturnItem = (returnId, item) => {
  return apiPosPost(ENDPOINTS.POS.ADD_RETURN_ITEM(returnId), item);
};

export const finalizeReturn = (returnId) => {
  return apiPosPost(ENDPOINTS.POS.FINALIZE_RETURN(returnId), {});
};

export const cancelReturn = (returnId) => {
  return apiPosPatch(ENDPOINTS.POS.CANCEL_RETURN(returnId), {});
};

// ============ Settings ============
// GET /pos/settings → BranchSettingsDto
// PUT /pos/settings → BranchSettingsDto

export const getSettings = () => {
  return apiPosGet(ENDPOINTS.POS.GET_SETTINGS);
};

export const updateSettings = (data) => {
  return apiPosPut(ENDPOINTS.POS.UPDATE_SETTINGS, data);
};

export default {
  // Products
  getPosProducts,
  getProductPrice,
  getProductStock,
  // Invoices
  getOrders,
  createInvoice,
  getInvoice,
  getInvoicesOnHold,
  addInvoiceItem,
  scanBarcode,
  holdInvoice,
  resumeInvoice,
  finalizeInvoice,
  cancelInvoice,
  // Payments
  createPayment,
  getPaymentQR,
  confirmTransfer,
  // Shifts
  getShifts,
  startShift,
  getShiftSummary,
  endShift,
  // Customers
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  getCustomerOrders,
  // Returns
  getReturns,
  getReturn,
  createReturn,
  addReturnItem,
  finalizeReturn,
  cancelReturn,
  // Settings
  getSettings,
  updateSettings,
};
