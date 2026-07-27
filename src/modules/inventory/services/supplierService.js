/**
 * Supplier Service - API calls cho module Quản lý Nhà cung cấp & Công nợ
 */
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// Hàm hỗ trợ build Query string cho các API GET có phân trang/lọc
const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ==========================================
// 1. QUẢN LÝ DANH MỤC NHÀ CUNG CẤP
// ==========================================
export const getSuppliers = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_SUPPLIERS}${buildQueryString(filters)}`);
};

export const getSupplierDetail = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_SUPPLIER(id));
};

export const createSupplier = (data) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_SUPPLIER, data);
};

export const updateSupplier = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_SUPPLIER(id), data);
};

export const deleteSupplier = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_SUPPLIER(id));
};

/**
 * Toggle trạng thái hợp tác NCC: "active" ↔ "inactive"
 * Body: { status: "active" | "inactive" }
 */
export const toggleSupplierStatus = (id, status) => {
  return apiPatch(ENDPOINTS.INVENTORY.TOGGLE_SUPPLIER_STATUS(id), { status });
};

// ==========================================
// 2. QUẢN LÝ CÔNG NỢ (SUPPLIER DEBT)
// ==========================================
export const getSupplierDebts = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_SUPPLIER_DEBTS}${buildQueryString(filters)}`);
};

export const getSupplierDebtDetail = (supplierId) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_SUPPLIER_DEBT(supplierId));
};

/**
 * Hàm hỗ trợ tải file Excel (Export).
 * FE gọi hàm này, nó sẽ trả về Blob data, sau đó tự tạo link tải xuống.
 */
export const exportSupplierDebt = async (filters = {}) => {
  const queryString = buildQueryString(filters);
  const url = `${ENDPOINTS.INVENTORY.EXPORT_SUPPLIER_DEBT}${queryString}`;

  // Truyền thêm header đặc biệt hoặc config nếu apiClient của bạn hỗ trợ responseType: 'blob'
  // Tạm thời gọi qua apiGet (cần custom lại apiClient nếu nó mặc định parse JSON)
  return apiGet(url, { responseType: 'blob' });
};

// ==========================================
// 3. QUẢN LÝ PHIẾU THANH TOÁN (SUPPLIER PAYMENT)
// ==========================================
export const getSupplierPayments = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_SUPPLIER_PAYMENTS}${buildQueryString(filters)}`);
};

export const createSupplierPayment = (data) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_SUPPLIER_PAYMENT, data);
};

export const updateSupplierPaymentNote = (id, note) => {
  // API chỉ cho phép cập nhật field "note"
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_SUPPLIER_PAYMENT(id), { note });
};

export const deleteSupplierPayment = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_SUPPLIER_PAYMENT(id));
};
