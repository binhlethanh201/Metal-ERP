import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách nhân viên do Owner hiện tại tạo (CreatedBy == ownerId)
 * @param {Object} params - { page = 1, pageSize = 20, search }
 */
export const getStaffs = ({ page = 1, pageSize = 20, search = '' } = {}) => {
  const queryParams = new URLSearchParams();
  if (page) queryParams.set('page', page);
  if (pageSize) queryParams.set('pageSize', pageSize);
  if (search && search.trim() !== '') queryParams.set('search', search.trim());

  const queryString = queryParams.toString();
  return apiGet(`${ENDPOINTS.OWNER.STAFFS}${queryString ? `?${queryString}` : ''}`);
};

/**
 * Lấy danh sách quyền khả dụng trong hệ thống để làm UI Checkbox
 */
export const getAvailablePermissions = () => {
  return apiGet(ENDPOINTS.OWNER.STAFF_AVAILABLE_PERMISSIONS);
};

/**
 * Lấy chi tiết nhân viên theo UserId
 * @param {string} id - GUID của nhân viên
 */
export const getStaffDetail = (id) => {
  return apiGet(ENDPOINTS.OWNER.STAFF_DETAIL(id));
};

/**
 * Tạo nhân viên mới
 * @param {Object} staffData - CreateStaffWithPermissionRequest
 * { username, email, fullName, password, phoneNumber, defaultRoleType, customPermissionCodes }
 */
export const createStaff = (staffData) => {
  return apiPost(ENDPOINTS.OWNER.STAFFS, staffData);
};

/**
 * Cập nhật nhân viên (Partial Update)
 * Lưu ý: Gửi permissionCodes: [] sẽ xóa sạch quyền của nhân viên!
 * @param {string} id - GUID của nhân viên
 * @param {Object} staffData - UpdateStaffPermissionRequest
 * { email, phoneNumber, fullName, isActive, password, permissionCodes }
 */
export const updateStaff = (id, staffData) => {
  return apiPut(ENDPOINTS.OWNER.STAFF_DETAIL(id), staffData);
};

/**
 * Bật/tắt trạng thái hoạt động (IsActive: 1 <-> 0)
 * @param {string} id - GUID của nhân viên
 */
export const toggleStaffStatus = (id) => {
  return apiPatch(ENDPOINTS.OWNER.STAFF_TOGGLE_STATUS(id));
};

/**
 * Xóa cứng nhân viên ra khỏi hệ thống
 * @param {string} id - GUID của nhân viên
 */
export const deleteStaff = (id) => {
  return apiDelete(ENDPOINTS.OWNER.STAFF_DETAIL(id));
};
