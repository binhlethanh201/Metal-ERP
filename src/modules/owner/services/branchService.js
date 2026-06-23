import { apiGet, apiPost, apiPut } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

/**
 * Lấy danh sách chi nhánh (GET)
 */
export const getBranches = () => {
  return apiGet(ENDPOINTS.OWNER.BRANCHES);
};

/**
 * Lấy chi tiết chi nhánh (GET)
 */
export const getBranchDetail = (id) => {
  return apiGet(ENDPOINTS.OWNER.BRANCH_DETAIL(id));
};

/**
 * Tạo chi nhánh mới (POST)
 */
export const createBranch = (branchData) => {
  return apiPost(ENDPOINTS.OWNER.BRANCHES, branchData);
};

/**
 * Cập nhật thông tin chi nhánh (PUT)
 */
export const updateBranch = (id, branchData) => {
  return apiPut(ENDPOINTS.OWNER.BRANCH_DETAIL(id), branchData);
};

/**
 * Lấy lịch sử phiếu kho của chi nhánh (GET)
 */
export const getBranchHistory = (id, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return apiGet(`${ENDPOINTS.OWNER.BRANCH_HISTORY(id)}${queryString ? `?${queryString}` : ''}`);
};
