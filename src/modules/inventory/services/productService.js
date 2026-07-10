/**
 * Product Service - API calls cho module Hàng hóa.
 */
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';

const BASE = '/api/products';

// Products APIs
export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, value);
  });
  const qs = params.toString();
  return apiGet(`${BASE}${qs ? `?${qs}` : ''}`);
};

export const getProduct = (id) => {
  return apiGet(`${BASE}/${id}`);
};

export const createProduct = (data) => {
  return apiPost(BASE, data);
};

export const updateProduct = (id, data) => {
  return apiPut(`${BASE}/${id}`, data);
};

export const deleteProduct = (id) => apiDelete(`${BASE}/${id}`);

export const toggleProductStatus = (id, isActive) =>
  apiPatch(`${BASE}/${id}/toggle-status?isActive=${isActive}`);

export const toggleProductStatusBulk = (ids, isActive) =>
  apiPatch(`${BASE}/toggle-status-bulk`, { ids, isActive });

// Categories APIs
export const getCategories = () => apiGet(`${BASE}/categories`);
export const renameCategory = (oldName, newName) =>
  apiPut(`${BASE}/categories/rename`, {
    oldName: (oldName || '').trim(),
    newName: (newName || '').trim(),
  });
export const deleteCategory = (name) => apiDelete(`${BASE}/categories/${encodeURIComponent(name)}`);

// Brands APIs
export const getBrands = () => apiGet(`${BASE}/brands`);
export const renameBrand = (oldName, newName) =>
  apiPut(`${BASE}/brands/rename`, {
    oldName: (oldName || '').trim(),
    newName: (newName || '').trim(),
  });
export const deleteBrand = (name) => apiDelete(`${BASE}/brands/${encodeURIComponent(name)}`);

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleProductStatusBulk,
  getCategories,
  renameCategory,
  deleteCategory,
  getBrands,
  renameBrand,
  deleteBrand,
};

export default productService;
