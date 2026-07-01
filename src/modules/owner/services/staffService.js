import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách nhân viên (có phân trang, bộ lọc)
 */
export const getStaffs = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return apiGet(`${ENDPOINTS.OWNER.STAFFS}${queryString ? `?${queryString}` : ''}`);
};

/**
 * Lấy danh sách quyền khả dụng trong hệ thống để làm UI Checkbox
 */
export const getAvailablePermissions = () => {
  return apiGet(ENDPOINTS.OWNER.STAFF_AVAILABLE_PERMISSIONS);
};

/**
 * Lấy chi tiết nhân viên
 */
export const getStaffDetail = (id) => {
  return apiGet(ENDPOINTS.OWNER.STAFF_DETAIL(id));
};

/**
 * Tạo nhân viên mới
 */
export const createStaff = (staffData) => {
  return apiPost(ENDPOINTS.OWNER.STAFFS, staffData);
};

/**
 * Cập nhật nhân viên (bao gồm đổi pass, đổi quyền)
 */
export const updateStaff = (id, staffData) => {
  return apiPut(ENDPOINTS.OWNER.STAFF_DETAIL(id), staffData);
};

/**
 * Bật/tắt trạng thái hoạt động (Toggle Status)
 */
export const toggleStaffStatus = (id) => {
  return apiPatch(ENDPOINTS.OWNER.STAFF_TOGGLE_STATUS(id));
};

/**
 * Xóa vĩnh viễn nhân viên
 */
export const deleteStaff = (id) => {
  return apiDelete(ENDPOINTS.OWNER.STAFF_DETAIL(id));
};

/**
 * Gán chi nhánh cho nhân viên
 */
export const assignBranch = (id, branchId) => {
  return apiPost(ENDPOINTS.OWNER.STAFF_ASSIGN_BRANCH(id), { branchId });
};

/**
 * Gỡ chi nhánh khỏi nhân viên
 */
export const unassignBranch = (id, branchId) => {
  return apiDelete(ENDPOINTS.OWNER.STAFF_UNASSIGN_BRANCH(id, branchId));
};
