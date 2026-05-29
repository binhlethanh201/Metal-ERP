/**
 * Goods Issue Service - API calls cho module Xuất Kho.
 * Gồm: lấy danh sách phiếu, tạo phiếu, CRUD dòng hàng, tham chiếu, upload file.
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

// ============ Danh sách phiếu xuất ============
export const getGoodsIssues = (filters = {}) =>
  apiGet(`${ENDPOINTS.GOODS_ISSUE.GET_LIST}${buildQueryString(filters)}`);

export const getGoodsIssue = (id) => apiGet(ENDPOINTS.GOODS_ISSUE.GET_DETAIL(id));

export const createGoodsIssue = (data) => apiPost(ENDPOINTS.GOODS_ISSUE.CREATE, data);

export const updateGoodsIssue = (id, data) => apiPut(ENDPOINTS.GOODS_ISSUE.UPDATE(id), data);

export const deleteGoodsIssue = (id) => apiDelete(ENDPOINTS.GOODS_ISSUE.DELETE(id));

// ============ Sản phẩm (tra cứu nhanh) ============
export const searchProductsForExport = (keyword) =>
  apiGet(`${ENDPOINTS.GOODS_ISSUE.SEARCH_PRODUCTS}?keyword=${encodeURIComponent(keyword)}`);

// ============ Khách hàng ============
export const getCustomers = (filters = {}) =>
  apiGet(`${ENDPOINTS.GOODS_ISSUE.GET_CUSTOMERS}${buildQueryString(filters)}`);

export const createCustomerQuick = (data) => apiPost(ENDPOINTS.GOODS_ISSUE.CREATE_CUSTOMER, data);

// ============ Kho ============
export const getWarehouses = () => apiGet(ENDPOINTS.GOODS_ISSUE.GET_WAREHOUSES);

// ============ File đính kèm ============
export const uploadAttachment = (issueId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiPost(ENDPOINTS.GOODS_ISSUE.UPLOAD_ATTACHMENT(issueId), formData, {
    headers: {}, // bỏ Content-Type để browser tự set multipart
  });
};

const goodsIssueService = {
  getGoodsIssues,
  getGoodsIssue,
  createGoodsIssue,
  updateGoodsIssue,
  deleteGoodsIssue,
  searchProductsForExport,
  getCustomers,
  createCustomerQuick,
  getWarehouses,
  uploadAttachment,
};

export default goodsIssueService;
