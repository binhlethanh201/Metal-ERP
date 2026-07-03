/**
 * Inventory Service - API calls cho module Tổng kho
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

// ============ Inward Inventory  ============
export const getInwardInventories = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_INWARD_INVENTORIES}${buildQueryString(filters)}`);
};

export const getInwardInventory = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_INWARD_INVENTORY(id));
};

export const createInwardInventory = (payload) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_INWARD_INVENTORY, payload);
};

export const updateInwardInventory = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_INWARD_INVENTORY(id), data);
};

export const confirmInwardInventory = (id) => {
  return apiPost(`${ENDPOINTS.INVENTORY.GET_INWARD_INVENTORY(id)}/confirm`, {});
};

export const cancelInwardInventory = (id, cancelReason = '') => {
  return apiPost(`${ENDPOINTS.INVENTORY.GET_INWARD_INVENTORY(id)}/cancel`, { cancelReason });
};

export const deleteInwardInventory = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_INWARD_INVENTORY(id));
};

// ============ Outward Inventory ============
export const getOutwardInventories = (filters = {}) => {
  return apiGet(`${ENDPOINTS.INVENTORY.GET_OUTWARD_INVENTORIES}${buildQueryString(filters)}`);
};

export const getOutwardInventory = (id) => {
  return apiGet(ENDPOINTS.INVENTORY.GET_OUTWARD_INVENTORY(id));
};

// API Tạo phiếu xuất kho (Trạng thái PENDING)
export const createOutwardInventory = (payload) => {
  return apiPost(ENDPOINTS.INVENTORY.CREATE_OUTWARD_INVENTORY || '/OutwardInventory', payload);
};

export const updateOutwardInventory = (id, data) => {
  return apiPut(ENDPOINTS.INVENTORY.UPDATE_OUTWARD_INVENTORY(id), data);
};

// API Xác nhận phiếu xuất (Trừ kho & Validate real-time)
export const confirmOutwardInventory = (id) => {
  return apiPost(`${ENDPOINTS.INVENTORY.GET_OUTWARD_INVENTORY(id)}/confirm`, {});
};

// API Hủy phiếu xuất chuẩn theo tài liệu mới (Hoàn lại kho nếu đã COMPLETED)
export const cancelOutwardInventory = (id, cancelReason = '') => {
  return apiPost(`${ENDPOINTS.INVENTORY.GET_OUTWARD_INVENTORY(id)}/cancel`, { cancelReason });
};

// (Deprecated) Legacy Delete giữ lại theo tài liệu
export const deleteOutwardInventory = (id) => {
  return apiDelete(ENDPOINTS.INVENTORY.DELETE_OUTWARD_INVENTORY(id));
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
  // Inward Inventory API
  getInwardInventories,
  getInwardInventory,
  createInwardInventory,
  updateInwardInventory,
  confirmInwardInventory,
  cancelInwardInventory,
  deleteInwardInventory,
  // Outward Inventory API
  getOutwardInventories,
  getOutwardInventory,
  createOutwardInventory,
  updateOutwardInventory,
  confirmOutwardInventory,
  cancelOutwardInventory,
  deleteOutwardInventory,
  // Others
  getLowStockAlerts,
  getStockReport,
  getMovementReport,
  getImportSuggestions,
};

export default inventoryService;
