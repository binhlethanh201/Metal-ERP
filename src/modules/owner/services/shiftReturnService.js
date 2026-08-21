import { apiGet, apiPost, apiPatch } from '../../../services/apiClient';

const SHIFTS_BASE = '/api/pos/shifts';
const RETURNS_BASE = '/api/pos/returns';

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    qs.set(key, value);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
};

// ── Lịch sử Ca bán ──────────────────────────────────────
export const getShifts = ({ search, from, to, page = 1, pageSize = 20 } = {}) =>
  apiGet(`${SHIFTS_BASE}${buildQuery({ search, from, to, page, pageSize })}`);

export const getShiftSummary = (shiftId) => apiGet(`${SHIFTS_BASE}/${shiftId}/summary`);

// ── Lịch sử Đơn Đổi/Trả ─────────────────────────────────
export const getReturnOrders = ({
  invoiceId,
  status,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 20,
} = {}) =>
  apiGet(
    `${RETURNS_BASE}${buildQuery({
      invoiceId,
      status, // <--- SỬA Ở ĐÂY: Xóa toPascalCase(status), chỉ truyền status gốc (COMPLETED, PENDING...)
      dateFrom,
      dateTo,
      page,
      pageSize,
    })}`
  );

export const getReturnOrderDetail = (id) => apiGet(`${RETURNS_BASE}/${id}`);

export const cancelReturnOrder = (returnId) => apiPatch(`${RETURNS_BASE}/${returnId}/cancel`);

export const createReturnOrder = ({ invoiceId, refundMethod, returnType, note }) =>
  apiPost(RETURNS_BASE, { invoiceId, refundMethod, returnType, note });

export const addReturnItem = (returnId, { productId, quantity, reason }) =>
  apiPost(`${RETURNS_BASE}/${returnId}/items`, { productId, quantity, reason });

export const finalizeReturnOrder = (returnId, note) =>
  apiPost(`${RETURNS_BASE}/${returnId}/finalize`, { note });

const shiftReturnService = {
  getShifts,
  getShiftSummary,
  getReturnOrders,
  getReturnOrderDetail,
  cancelReturnOrder,
  createReturnOrder,
  addReturnItem,
  finalizeReturnOrder,
};

export default shiftReturnService;
