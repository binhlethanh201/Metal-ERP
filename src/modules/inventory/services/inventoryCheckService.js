/**
 * Inventory Check Service - API calls chuyên trách Kiểm kê kho
 * Tất cả hàm được export dưới dạng Named Exports
 */
import { apiGet, apiPost, apiPut } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách phiếu kiểm kê (Phân trang & Lọc)
 * GET /api/InventoryCheck
 * BE nhận: status, fromDate, toDate, pageNumber, pageSize
 * @param {Object} filters - status, startDate, endDate, branchId, pageNumber, pageSize, ticketCode
 */
export const getInventoryChecks = (filters = {}) => {
  const allowed = ['status', 'pageNumber', 'pageSize'];
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    // FE dùng startDate/endDate -> BE dùng fromDate/toDate
    if (key === 'startDate') {
      params.set('fromDate', value);
    } else if (key === 'endDate') {
      params.set('toDate', value);
    } else if (allowed.includes(key)) {
      params.set(key, value);
    }
    // branchId/ticketCode: BE không nhận -> bỏ qua
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
export const getInventoryCheckDetail = (id) =>
  apiGet(ENDPOINTS.INVENTORY.GET_INVENTORY_CHECK(id));

export const getCounters = () => apiGet(ENDPOINTS.INVENTORY.GET_COUNTERS);

/**
 * Tạo mới phiếu kiểm kê (Trạng thái: Draft)
 * POST /api/InventoryCheck
 * BE body: { items: [{ id }], note?, reason? } (branchId tự resolve từ JWT)
 * @param {Array<string>} productIds - Danh sách ID sản phẩm cần kiểm kê
 * @param {string} notes - Ghi chú/Lý do kiểm kê
 * @param {string|null} assigneeUserId - (BE hiện không hỗ trợ -> bỏ qua)
 */
export const createInventoryCheck = (productIds, notes, assigneeUserId = null) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_INVENTORY_CHECK, {
    items: (productIds || []).map((id) => ({ id })),
    note: notes ?? null,
  });
};

/**
 * Cập nhật phiếu kiểm kê (Chỉ khi đang ở trạng thái Draft)
 * PUT /api/InventoryCheck/{id}
 * BE body: { note?, reason? } (không hỗ trợ add/remove product hay assignee)
 * @param {string} id - TicketId
 * @param {Object} data - { notes, assigneeUserId, addProductIds, removeProductIds }
 */
export const updateInventoryCheck = (id, data) => {
  const payload = {
    note: data?.notes ?? null,
    reason: data?.reason ?? null,
  };
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_INVENTORY_CHECK(id), payload);
};

/**
 * Xóa phiếu kiểm kê (Chỉ khi Draft, chỉ người tạo hoặc Owner)
 * DELETE /api/InventoryCheck/{id}
 * @param {string} id - TicketId
 */
export const deleteInventoryCheck = (id) => {
  return apiPost(ENDPOINTS.INVENTORY.CANCEL_INVENTORY_CHECK(id), { reason: 'Xóa phiếu nháp' });
};

/**
 * Nhập số lượng kiểm đếm thực tế và gửi duyệt
 * POST /api/InventoryCheck/{id}/fill-actual
 * Phiếu chuyển từ Draft -> WaitingForApproval
 * BE body: { quantities: [{ ticketItemId, actualQuantity, discrepancyReason? }] }
 * @param {string} id - TicketId
 * @param {Array<{detailId: string, actualQuantity: number}>} details
 */
export const fillInventoryCheck = (id, details) => {
  const quantities = (details || []).map((d) => ({
    ticketItemId: d.detailId,
    actualQuantity: d.actualQuantity,
  }));
  return apiPost(ENDPOINTS.INVENTORY.FILL_INVENTORY_CHECK(id), { quantities });
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
 * Yêu cầu đếm lại (Reject/Recount) - Phiếu về lại Draft, recountNumber tăng 1
 * POST /api/InventoryCheck/{id}/reject
 * BE body: { isRecount, note? }
 * @param {string} id - TicketId
 * @param {string} reason - Lý do yêu cầu đếm lại (bắt buộc)
 */
export const rejectInventoryCheck = (id, reason) => {
  return apiPost(ENDPOINTS.INVENTORY.REJECT_INVENTORY_CHECK(id), {
    isRecount: true,
    note: reason,
  });
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
 * PUT /api/InventoryCheck/{id}/discrepancy-reasons
 * BE body: { discrepancyReasons: [{ ticketItemId, reason? }] }
 * @param {string} id - TicketId
 * @param {Array<{detailId: string, reasonNote: string}>} details
 */
export const updateDiscrepancyReasons = (id, details) => {
  const discrepancyReasons = (details || []).map((d) => ({
    ticketItemId: d.detailId,
    reason: d.reasonNote,
  }));
  return apiPut(ENDPOINTS.INVENTORY.REASONS_INVENTORY_CHECK(id), { discrepancyReasons });
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
 * POST /api/InventoryCheck/notifications/mark-read
 * BE body: mảng List<Guid> (raw array, KHÔNG có markAllAsRead)
 * @param {Array<string>|null} notificationIds - null/mảng rỗng nếu không có id cụ thể
 * @param {boolean} markAllAsRead - thông tin cho caller; BE không có endpoint mark-all,
 *   caller phải tự truyền toàn bộ id cần đánh dấu (xem InventoryNotificationDropdown)
 */
export const markNotificationsAsRead = (notificationIds = null, markAllAsRead = false) => {
  const ids = Array.isArray(notificationIds) ? notificationIds : [];
  return apiPost(ENDPOINTS.INVENTORY.MARK_NOTIFICATION_READ, ids);
};
