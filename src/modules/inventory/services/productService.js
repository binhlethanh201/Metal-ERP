/**
 * Product Service - API calls cho module Hàng hóa.
 * Tách riêng từ inventoryService để dễ theo dõi.
 */
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';

const BASE = '/api/products';

export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, value);
  });
  const qs = params.toString();
  return apiGet(`${BASE}${qs ? `?${qs}` : ''}`);
};

export const getProduct = (id) => apiGet(`${BASE}/${id}`);

export const createProduct = (data) => apiPost(BASE, data);

export const updateProduct = (id, data) => apiPut(`${BASE}/${id}`, data);

export const deleteProduct = (id) => apiDelete(`${BASE}/${id}`);

export const toggleProductStatus = (id, isActive) =>
  apiPatch(`${BASE}/${id}/toggle-status?isActive=${isActive}`);

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};

export default productService;
