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
export const createCategory = (name) =>
  apiPost(`${BASE}/categories`, { name: (name || '').trim() });
export const renameCategory = (oldName, newName) =>
  apiPut(`${BASE}/categories/rename`, {
    oldName: (oldName || '').trim(),
    newName: (newName || '').trim(),
  });
export const deleteCategory = (name) => apiDelete(`${BASE}/categories/${encodeURIComponent(name)}`);

// Brands APIs
export const getBrands = () => apiGet(`${BASE}/brands`);
export const createBrand = (name) => apiPost(`${BASE}/brands`, { name: (name || '').trim() });
export const renameBrand = (oldName, newName) =>
  apiPut(`${BASE}/brands/rename`, {
    oldName: (oldName || '').trim(),
    newName: (newName || '').trim(),
  });
export const deleteBrand = (name) => apiDelete(`${BASE}/brands/${encodeURIComponent(name)}`);

// Locations APIs
export const getProductLocations = () => apiGet('/api/products/locations');
export const createProductLocation = (name) =>
  apiPost('/api/products/locations', { name: (name || '').trim() });
export const renameProductLocation = (oldName, newName) =>
  apiPut('/api/products/locations', {
    oldName: (oldName || '').trim(),
    newName: (newName || '').trim(),
  });
export const deleteProductLocation = (name) =>
  apiDelete(`/api/products/locations/${encodeURIComponent(name)}`);

// Attribute Types APIs
export const getAttributeTypes = () => apiGet('/api/products/attribute-types');
export const createAttributeType = (typeName, typeCode) =>
  apiPost('/api/products/attribute-types', {
    typeName: (typeName || '').trim(),
    ...(typeCode?.trim() ? { typeCode: typeCode.trim() } : {}),
  });
export const updateAttributeType = (id, data) =>
  apiPut(`/api/products/attribute-types/${id}`, {
    typeName: (data.typeName || '').trim(),
    ...(data.typeCode?.trim() ? { typeCode: data.typeCode.trim() } : {}),
  });
export const deleteAttributeType = (id) => apiDelete(`/api/products/attribute-types/${id}`);

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
  // Locations
  getProductLocations,
  createProductLocation,
  renameProductLocation,
  deleteProductLocation,
  // Attribute Types
  getAttributeTypes,
  createAttributeType,
  updateAttributeType,
  deleteAttributeType,
};

export default productService;
