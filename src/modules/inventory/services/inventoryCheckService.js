import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách phiếu kiểm kê (Phân trang & Lọc)
 */
export const getInventoryChecks = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return apiGet(
    `${ENDPOINTS.INVENTORY.GET_INVENTORY_CHECKS}${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * Lấy chi tiết một phiếu kiểm kê
 */
export const getInventoryCheckDetail = (id) => {
  // Đã sửa lại tên hằng số cho khớp với endpoints.js
  return apiGet(ENDPOINTS.INVENTORY.GET_INVENTORY_CHECK(id));
};

/**
 * Tạo mới phiếu kiểm kê (Nháp)
 * @param {Array<string>} productIds - Danh sách ID sản phẩm cần kiểm
 * @param {string} notes - Ghi chú phiếu
 * @param {string|null} assigneeUserId - User ID được giao kiểm kê (Tùy chọn)
 */
export const createInventoryCheck = (productIds, notes, assigneeUserId = null) => {
  // Đã sửa branchId thành assigneeUserId theo đúng API document
  return apiPost(ENDPOINTS.INVENTORY.CREATE_INVENTORY_CHECK, { productIds, notes, assigneeUserId });
};

/**
 * Cập nhật phiếu kiểm kê (Chỉ khi đang Draft)
 */
export const updateInventoryCheck = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_INVENTORY_CHECK(id), data);
};

/**
 * Xóa phiếu kiểm kê (Chỉ khi đang Draft)
 */
export const deleteInventoryCheck = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_INVENTORY_CHECK(id));
};

/**
 * Cập nhật số lượng kiểm đếm thực tế
 * @param {string} id - ID phiếu
 * @param {Array<{detailId: string, actualQuantity: number}>} details
 */
export const fillInventoryCheck = (id, details) => {
  return apiPut(ENDPOINTS.INVENTORY.FILL_INVENTORY_CHECK(id), { details });
};

/**
 * Duyệt phiếu kiểm kê
 */
export const approveInventoryCheck = (id) => {
  return apiPost(ENDPOINTS.INVENTORY.APPROVE_INVENTORY_CHECK(id));
};

/**
 * Hủy phiếu kiểm kê
 * @param {string} id - ID phiếu
 * @param {string} reason - Lý do hủy (Tùy chọn)
 */
export const cancelInventoryCheck = (id, reason = '') => {
  return apiPost(ENDPOINTS.INVENTORY.CANCEL_INVENTORY_CHECK(id), { reason });
};

/**
 * Nhập giải trình chênh lệch
 * @param {string} id - ID phiếu
 * @param {Array<{detailId: string, reasonNote: string}>} details
 */
export const reasonInventoryCheck = (id, details) => {
  return apiPost(ENDPOINTS.INVENTORY.REASONS_INVENTORY_CHECK(id), { details });
};

/**
 * Yêu cầu đếm lại (Reject phiếu)
 */
export const rejectInventoryCheck = (id, reason) => {
  return apiPost(ENDPOINTS.INVENTORY.REJECT_INVENTORY_CHECK(id), { reason });
};

/**
 * Lấy danh sách thông báo kiểm kê
 */
export const getInventoryNotifications = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return apiGet(`${ENDPOINTS.INVENTORY.GET_NOTIFICATIONS}${queryString ? `?${queryString}` : ''}`);
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markNotificationsAsRead = (notificationIds = null, markAllAsRead = false) => {
  return apiPut(ENDPOINTS.INVENTORY.MARK_NOTIFICATION_READ, { notificationIds, markAllAsRead });
};
