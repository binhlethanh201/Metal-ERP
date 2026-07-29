import { apiGet, apiPut, apiDelete, apiPost } from '../../../services/apiClient';

// ========== Stock Print Template ==========
const STOCK_URL = '/api/inventory/print-templates/stock-ticket';
const STOCK_PREVIEW_URL = `${STOCK_URL}/preview`;
const STOCK_LIST_URL = '/api/inventory/print-templates/stock-ticket';

export const getStockTemplate = (ticketType) => {
  const qs = ticketType ? `?ticketType=${encodeURIComponent(ticketType)}` : '';
  return apiGet(`${STOCK_LIST_URL}${qs}`);
};

export const upsertStockTemplate = (data) => apiPut(STOCK_URL, data);

export const deleteStockTemplate = (id) => apiDelete(`${STOCK_URL}/${id}`);

export const previewStockTemplate = (stockTicketId) =>
  apiPost(`${STOCK_PREVIEW_URL}?stockTicketId=${encodeURIComponent(stockTicketId)}`);

// ========== Invoice Print Template ==========
const INVOICE_URL = '/api/sales/invoice-templates';
const INVOICE_PREVIEW_URL = `${INVOICE_URL}/preview`;

export const getInvoiceTemplate = () => apiGet(INVOICE_URL);

export const upsertInvoiceTemplate = (data) => apiPut(INVOICE_URL, data);

export const deleteInvoiceTemplate = (id) => apiDelete(`${INVOICE_URL}/${id}`);

export const previewInvoiceTemplate = (invoiceId) =>
  apiPost(`${INVOICE_PREVIEW_URL}?invoiceId=${encodeURIComponent(invoiceId)}`);
