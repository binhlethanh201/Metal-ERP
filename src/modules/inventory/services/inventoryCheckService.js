/**
 * Inventory Check Service - API calls chuyên trách Kiểm kê kho
 * Tất cả hàm được export dưới dạng Named Exports
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách phiếu kiểm kê (Phân trang & Lọc)
 * GET /api/InventoryCheck
 * @param {Object} filters - status, startDate, endDate, branchId, pageNumber, pageSize, ticketCode
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
 * GET /api/InventoryCheck/{id}
 * @param {string} id - TicketId
 */
export const getInventoryCheckDetail = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_INVENTORY_CHECK(id));
};

/**
 * Tạo mới phiếu kiểm kê (Trạng thái: Draft)
 * POST /api/InventoryCheck
 * NOTE: Backend tự resolve branchId từ JWT Token - KHÔNG gửi branchId
 * @param {Array<string>} productIds - Danh sách ID sản phẩm cần kiểm kê (bắt buộc, không rỗng)
 * @param {string} notes - Ghi chú/Lý do kiểm kê
 * @param {string|null} assigneeUserId - ID người phụ trách (Staff chỉ được gán cho chính mình)
 */
export const createInventoryCheck = (productIds, notes, assigneeUserId = null) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_INVENTORY_CHECK, {
    productIds,
    notes,
    assigneeUserId: assigneeUserId || null,
  });
};

/**
 * Cập nhật phiếu kiểm kê (Chỉ khi đang ở trạng thái Draft)
 * PUT /api/InventoryCheck/{id}
 * @param {string} id - TicketId
 * @param {Object} data - { notes, assigneeUserId, addProductIds, removeProductIds }
 */
export const updateInventoryCheck = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_INVENTORY_CHECK(id), data);
};

/**
 * Xóa phiếu kiểm kê (Chỉ khi Draft, chỉ người tạo hoặc Owner)
 * DELETE /api/InventoryCheck/{id}
 * @param {string} id - TicketId
 */
export const deleteInventoryCheck = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_INVENTORY_CHECK(id));
};

/**
 * Nhập số lượng kiểm đếm thực tế và gửi duyệt
 * PUT /api/InventoryCheck/{id}/fill
 * Phiếu chuyển từ Draft -> WaitingForApproval
 * SystemQuantity được chốt từ DB tại thời điểm gọi API này
 * @param {string} id - TicketId
 * @param {Array<{detailId: string, actualQuantity: number}>} details
 */
export const fillInventoryCheck = (id, details) => {
  return apiPut(ENDPOINTS.INVENTORY.FILL_INVENTORY_CHECK(id), { details });
};

/**
 * Duyệt phiếu kiểm kê - điều chỉnh tồn kho (cộng dồn discrepancy)
 * POST /api/InventoryCheck/{id}/approve
 * Chỉ khi Status = WaitingForApproval, tất cả detail isCounted = true
 * newStock = currentStockAtApprove + discrepancy
 * @param {string} id - TicketId
 */
export const approveInventoryCheck = (id) => {
  // Phải truyền body {} theo HTTP spec cho POST
  return apiPost(ENDPOINTS.INVENTORY.APPROVE_INVENTORY_CHECK(id), {});
};

/**
 * Yêu cầu đếm lại (Reject) - Phiếu về lại Draft, recountNumber tăng 1
 * POST /api/InventoryCheck/{id}/reject
 * Chỉ khi Status = WaitingForApproval, bắt buộc có reason
 * @param {string} id - TicketId
 * @param {string} reason - Lý do yêu cầu đếm lại (bắt buộc)
 */
export const rejectInventoryCheck = (id, reason) => {
  return apiPost(ENDPOINTS.INVENTORY.REJECT_INVENTORY_CHECK(id), { reason });
};

/**
 * Hủy phiếu kiểm kê - không ảnh hưởng tồn kho
 * POST /api/InventoryCheck/{id}/cancel
 * Không áp dụng khi Status = Completed hoặc Cancelled
 * @param {string} id - TicketId
 * @param {string} reason - Lý do hủy (tùy chọn)
 */
export const cancelInventoryCheck = (id, reason = '') => {
  return apiPost(ENDPOINTS.INVENTORY.CANCEL_INVENTORY_CHECK(id), { reason });
};

/**
 * Cập nhật giải trình lý do chênh lệch
 * POST /api/InventoryCheck/{id}/reasons
 * Chỉ khi Status = WaitingForApproval hoặc Completed
 * Chỉ Owner/người có quyền APPROVE
 * @param {string} id - TicketId
 * @param {Array<{detailId: string, reasonNote: string}>} details
 */
export const updateDiscrepancyReasons = (id, details) => {
  return apiPost(ENDPOINTS.INVENTORY.REASONS_INVENTORY_CHECK(id), { details });
};

/**
 * Lấy danh sách thông báo kiểm kê
 * GET /api/InventoryCheck/notifications
 * @param {Object} filters - { pageNumber, pageSize, unreadOnly }
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

export const getSystemNotifications = (days = 7) => {
  return apiGet(`/api/Users/me/system-notifications?days=${days}`);
};

/**
 * Đánh dấu thông báo đã đọc
 * PUT /api/InventoryCheck/notifications/read
 * @param {Array<string>|null} notificationIds - null nếu dùng markAllAsRead
 * @param {boolean} markAllAsRead
 */
export const markNotificationsAsRead = (notificationIds = null, markAllAsRead = false) => {
  return apiPut(ENDPOINTS.INVENTORY.MARK_NOTIFICATION_READ, {
    notificationIds,
    markAllAsRead,
  });
};
