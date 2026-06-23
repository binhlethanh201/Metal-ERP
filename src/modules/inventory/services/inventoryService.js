/**
 * Inventory Service - API calls cho module Tổng kho. Gọi qua apiClient tập trung.
 * Gồm: Dashboard, Products, Stock, Import/Export, Alerts, Reports.
 */
/**
 * Inventory Service - Tất cả API calls cho module Tổng kho
 * Gọi đến apiClient và endpoints tập trung
 */

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, value);
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ============ Dashboard ============
export const getInventoryDashboard = () => {
  return apiGet(ENDPOINTS.INVENTORY.DASHBOARD);
};

// ============ Products ============
export const getProducts = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_PRODUCTS}${buildQueryString(filters)}`);
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

export const toggleProductStatus = (id, isActive) => {
  return apiPatch(`${ENDPOINTS.INVENTORY.TOGGLE_PRODUCT_STATUS(id)}?isActive=${isActive}`);
};

// ============ Stock ============
export const getStock = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_STOCK}${buildQueryString(filters)}`);
};

export const getStockByProduct = (productId) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_STOCK_BY_PRODUCT(productId));
};

export const updateStock = (productId, stockData) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_STOCK(productId), stockData);
};

// ============ Stock Import ============
export const getImports = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_IMPORTS}${buildQueryString(filters)}`);
};

export const createImport = (importData) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_IMPORT, importData);
};

export const getImport = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_IMPORT(id));
};

// ============ Stock Export ============
export const getExports = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_EXPORTS}${buildQueryString(filters)}`);
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
  return apiGet(`${ENDPOINTS.INVENTORY.GET_STOCK_REPORT}${buildQueryString(filters)}`);
};

export const getMovementReport = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_MOVEMENT_REPORT}${buildQueryString(filters)}`);
};

export const getImportSuggestions = () => {
  return apiGet(ENDPOINTS.INVENTORY.GET_IMPORT_SUGGESTIONS);
};

const inventoryService = {
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

export default inventoryService;
