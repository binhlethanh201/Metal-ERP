/**
 * Inventory Service - Tất cả API calls cho module Tổng kho
 * Gọi đến apiClient và endpoints tập trung
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

// ============ Dashboard ============
export const getInventoryDashboard = () => {
  return apiGet(ENDPOINTS.INVENTORY.DASHBOARD);
};

// ============ Products ============
export const getProducts = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_PRODUCTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const getProduct = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_PRODUCT(id));
};

export const createProduct = (productData) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_PRODUCT, productData);
};

export const updateProduct = (id, productData) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_PRODUCT(id), productData);
};

export const deleteProduct = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_PRODUCT(id));
};

// ============ Stock ============
export const getStock = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_STOCK}?${queryParams}`;
  return apiGet(endpoint);
};

export const getStockByProduct = (productId) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_STOCK_BY_PRODUCT(productId));
};

export const updateStock = (productId, stockData) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_STOCK(productId), stockData);
};

// ============ Stock Import ============
export const getImports = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_IMPORTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const createImport = (importData) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_IMPORT, importData);
};

export const getImport = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_IMPORT(id));
};

// ============ Stock Export ============
export const getExports = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_EXPORTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const createExport = (exportData) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_EXPORT, exportData);
};

export const getExport = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_EXPORT(id));
};

// ============ Alerts & Warnings ============
export const getLowStockAlerts = () => {
  return apiGet(ENDPOINTS.INVENTORY.GET_LOW_STOCK_ALERTS);
};

// ============ Reports ============
export const getStockReport = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_STOCK_REPORT}?${queryParams}`;
  return apiGet(endpoint);
};

export const getMovementReport = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.INVENTORY.GET_MOVEMENT_REPORT}?${queryParams}`;
  return apiGet(endpoint);
};

export const getImportSuggestions = () => {
  return apiGet(ENDPOINTS.INVENTORY.GET_IMPORT_SUGGESTIONS);
};

export default {
  getInventoryDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getStock,
  getStockByProduct,
  updateStock,
  getImports,
  createImport,
  getImport,
  getExports,
  createExport,
  getExport,
  getLowStockAlerts,
  getStockReport,
  getMovementReport,
  getImportSuggestions,
};
