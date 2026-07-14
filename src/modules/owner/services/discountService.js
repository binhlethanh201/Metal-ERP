import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';

// Dành cho GET (Staff & Owner)
const GET_DISCOUNT_TIERS_URL = '/api/order-discount-tiers';

// Dành cho Mutations (Owner only)
const OWNER_DISCOUNT_TIERS_URL = '/api/owner/order-discount-tiers';

/**
 * Lấy danh sách discount tiers theo chi nhánh (GET)
 * @param {string|uuid} branchId - ID của chi nhánh
 */
export const getDiscountTiers = (branchId) => {
  const url = branchId ? `${GET_DISCOUNT_TIERS_URL}?branchId=${branchId}` : GET_DISCOUNT_TIERS_URL;
  return apiGet(url);
};

/**
 * Lấy chi tiết một discount tier (GET)
 * @param {string|uuid} id - ID của discount tier
 */
export const getDiscountTierDetail = (id) => {
  return apiGet(`${GET_DISCOUNT_TIERS_URL}/${id}`);
};

/**
 * Tạo discount tier mới (POST)
 * @param {object} tierData - Dữ liệu discount tier
 */
export const createDiscountTier = (tierData) => {
  return apiPost(OWNER_DISCOUNT_TIERS_URL, tierData);
};

/**
 * Cập nhật discount tier (PUT)
 * @param {string|uuid} id - ID của discount tier
 * @param {object} tierData - Dữ liệu cập nhật
 */
export const updateDiscountTier = (id, tierData) => {
  return apiPut(`${OWNER_DISCOUNT_TIERS_URL}/${id}`, tierData);
};

/**
 * Xóa discount tier (DELETE)
 * @param {string|uuid} id - ID của discount tier
 */
export const deleteDiscountTier = (id) => {
  return apiDelete(`${OWNER_DISCOUNT_TIERS_URL}/${id}`);
};
