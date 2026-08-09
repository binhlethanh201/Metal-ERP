import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ================= PHIẾU CHI TIỀN (Expense Voucher) =================

/**
 * Lấy danh sách phiếu chi tiền
 * @param {object} filters - { pageNumber, pageSize, categoryId, supplierId, status, fromDate, toDate, sort, order }
 */
export const getExpenses = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return apiGet(`${ENDPOINTS.EXPENSE.GET_LIST}${query ? `?${query}` : ''}`);
};

/**
 * Lấy chi tiết phiếu chi tiền
 */
export const getExpenseDetail = (id) => apiGet(ENDPOINTS.EXPENSE.GET_DETAIL(id));

/**
 * Tạo phiếu chi tiền mới
 * @param {object} payload - { categoryId, supplierId, amount, reason, note }
 */
export const createExpense = (payload) => apiPost(ENDPOINTS.EXPENSE.CREATE, payload);

/**
 * Cập nhật phiếu chi (chỉ PENDING, chỉ người tạo)
 */
export const updateExpenseVoucher = (id, payload) => apiPut(ENDPOINTS.EXPENSE.UPDATE(id), payload);

/**
 * Xác nhận phiếu chi tiền (PENDING -> COMPLETED)
 */
export const confirmExpense = (id) => apiPatch(ENDPOINTS.EXPENSE.CONFIRM(id));

/**
 * Hủy phiếu chi tiền (PENDING -> CANCELLED)
 * @param {string} id
 * @param {string} cancelReason - Bắt buộc
 */
export const cancelExpense = (id, cancelReason) =>
  apiPatch(ENDPOINTS.EXPENSE.CANCEL(id), { cancelReason });

// ================= NHÓM CHI PHÍ (Expense Category) =================

/**
 * Lấy danh sách nhóm chi phí
 */
export const getExpenseCategories = () => apiGet(ENDPOINTS.EXPENSE.GET_CATEGORIES);

/**
 * Tạo nhóm chi phí mới
 * @param {string} categoryName
 */
export const createExpenseCategory = (categoryName) =>
  apiPost(ENDPOINTS.EXPENSE.CREATE_CATEGORY, { categoryName });

/**
 * Sửa tên nhóm chi phí
 */
export const updateExpenseCategory = (id, categoryName) =>
  apiPut(ENDPOINTS.EXPENSE.UPDATE_CATEGORY(id), { categoryName });

/**
 * Xóa (soft delete) nhóm chi phí
 */
export const deleteExpenseCategory = (id) => apiDelete(ENDPOINTS.EXPENSE.DELETE_CATEGORY(id));

const expenseService = {
  getExpenses,
  getExpenseDetail,
  createExpense,
  updateExpenseVoucher,
  confirmExpense,
  cancelExpense,
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};

export default expenseService;
