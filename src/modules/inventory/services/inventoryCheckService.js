/**
 * Inventory Check Service - API calls chuyên trách Kiểm kê kho
 * Tất cả hàm được export dưới dạng Named Exports
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách phiếu kiểm kê (Phân trang & Lọc)
 * @param {Object} filters - Các bộ lọc: status, startDate, endDate, branchId, pageNumber, pageSize
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
 * @param {string} id - ID phiếu kiểm kê
 */
export const getInventoryCheckDetail = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_INVENTORY_CHECK(id));
};

/**
 * Tạo mới phiếu kiểm kê (Trạng thái: Nháp)
 * NOTE: API tự lấy chi nhánh qua JWT Token - KHÔNG gửi branchId
 * @param {Array<string>} productIds - Danh sách ID sản phẩm cần kiểm kê
 * @param {string} notes - Ghi chú/Lý do kiểm kê
 * @param {string|null} assigneeUserId - ID người phụ trách kiểm kê
 */
export const createInventoryCheck = (productIds, notes, assigneeUserId = null) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_INVENTORY_CHECK, {
    productIds,
    notes,
    assigneeUserId,
  });
};

/**
 * Cập nhật phiếu kiểm kê (Chỉ khi đang ở trạng thái Nháp)
 * @param {string} id - ID phiếu kiểm kê
 * @param {Object} data - Dữ liệu cần cập nhật
 */
export const updateInventoryCheck = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_INVENTORY_CHECK(id), data);
};

/**
 * Xóa phiếu kiểm kê (Chỉ khi đang ở trạng thái Nháp)
 * @param {string} id - ID phiếu kiểm kê
 */
export const deleteInventoryCheck = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_INVENTORY_CHECK(id));
};

/**
 * Cập nhật số lượng kiểm đếm thực tế và gửi duyệt
 * @param {string} id - ID phiếu kiểm kê
 * @param {Array<{detailId: string, actualQuantity: number}>} details - Danh sách chi tiết số lượng thực tế
 */
export const fillInventoryCheck = (id, details) => {
  return apiPut(ENDPOINTS.INVENTORY.FILL_INVENTORY_CHECK(id), { details });
};

/**
 * Duyệt phiếu kiểm kê (Chuyển trạng thái sang Hoàn thành & điều chỉnh tồn kho)
 * @param {string} id - ID phiếu kiểm kê
 */
export const approveInventoryCheck = (id) => {
  return apiPost(ENDPOINTS.INVENTORY.APPROVE_INVENTORY_CHECK(id));
};

/**
 * Yêu cầu đếm lại phiếu kiểm kê (Từ chối duyệt - Trả về trạng thái Nháp)
 * @param {string} id - ID phiếu kiểm kê
 * @param {string} reason - Lý do yêu cầu đếm lại
 */
export const rejectInventoryCheck = (id, reason) => {
  return apiPost(ENDPOINTS.INVENTORY.REJECT_INVENTORY_CHECK(id), { reason });
};

/**
 * Hủy phiếu kiểm kê (Chuyển sang trạng thái Đã hủy)
 * @param {string} id - ID phiếu kiểm kê
 * @param {string} reason - Lý do hủy phiếu (Tùy chọn)
 */
export const cancelInventoryCheck = (id, reason = '') => {
  return apiPost(ENDPOINTS.INVENTORY.CANCEL_INVENTORY_CHECK(id), { reason });
};

/**
 * Nhập giải trình chênh lệch cho các sản phẩm có số lượng chênh lệch
 * @param {string} id - ID phiếu kiểm kê
 * @param {Array<{detailId: string, reasonNote: string}>} details - Danh sách giải trình
 */
export const reasonInventoryCheck = (id, details) => {
  return apiPost(ENDPOINTS.INVENTORY.REASONS_INVENTORY_CHECK(id), { details });
};

/**
 * Lấy danh sách thông báo kiểm kê
 * @param {Object} filters - Các bộ lọc
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
 * @param {Array<string>|null} notificationIds - Danh sách ID thông báo cần đánh dấu
 * @param {boolean} markAllAsRead - Đánh dấu tất cả đã đọc
 */
export const markNotificationsAsRead = (notificationIds = null, markAllAsRead = false) => {
  return apiPut(ENDPOINTS.INVENTORY.MARK_NOTIFICATION_READ, { notificationIds, markAllAsRead });
};
