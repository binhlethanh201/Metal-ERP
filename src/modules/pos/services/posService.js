/**
 * POS Service - Tất cả API calls cho module Bán hàng
 * Gọi đến apiClient và endpoints tập trung
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

// ============ Products ============
export const getPosProducts = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.POS.GET_POS_PRODUCTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const searchProducts = (keyword) => {
  const queryParams = new URLSearchParams({ keyword });
  const endpoint = `${ENDPOINTS.POS.SEARCH_PRODUCTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const getProductByBarcode = (barcode) => {
  return apiGet(ENDPOINTS.POS.GET_PRODUCT_BY_BARCODE(barcode));
};

// ============ Cart ============
export const getCart = () => {
  return apiGet(ENDPOINTS.POS.GET_CART);
};

export const addToCart = (cartItem) => {
  return apiPost(ENDPOINTS.POS.ADD_TO_CART, cartItem);
};

export const updateCartItem = (itemId, itemData) => {
  return apiPut(ENDPOINTS.POS.UPDATE_CART_ITEM(itemId), itemData);
};

export const removeFromCart = (itemId) => {
  return apiDelete(ENDPOINTS.POS.REMOVE_FROM_CART(itemId));
};

export const clearCart = () => {
  return apiPost(ENDPOINTS.POS.CLEAR_CART, {});
};

// ============ Orders & Checkout ============
export const createOrder = (orderData) => {
  return apiPost(ENDPOINTS.POS.CREATE_ORDER, orderData);
};

export const getOrder = (id) => {
  return apiGet(ENDPOINTS.POS.GET_ORDER(id));
};

export const getOrderHistory = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.POS.GET_ORDER_HISTORY}?${queryParams}`;
  return apiGet(endpoint);
};

export const getRecentOrders = (limit = 10) => {
  const queryParams = new URLSearchParams({ limit });
  const endpoint = `${ENDPOINTS.POS.GET_RECENT_ORDERS}?${queryParams}`;
  return apiGet(endpoint);
};

// ============ Payment ============
export const processPayment = (paymentData) => {
  return apiPost(ENDPOINTS.POS.PROCESS_PAYMENT, paymentData);
};

export const getPaymentMethods = () => {
  return apiGet(ENDPOINTS.POS.GET_PAYMENT_METHODS);
};

// ============ Receipt ============
export const generateReceipt = (orderId) => {
  return apiGet(ENDPOINTS.POS.GENERATE_RECEIPT(orderId));
};

export const printReceipt = (orderId) => {
  return apiPost(ENDPOINTS.POS.PRINT_RECEIPT(orderId), {});
};

// ============ Shift Management ============
export const startShift = (shiftData) => {
  return apiPost(ENDPOINTS.POS.START_SHIFT, shiftData);
};

export const endShift = (shiftData) => {
  return apiPost(ENDPOINTS.POS.END_SHIFT, shiftData);
};

export const getShiftSummary = (shiftId) => {
  return apiGet(ENDPOINTS.POS.GET_SHIFT_SUMMARY(shiftId));
};

export default {
  getPosProducts,
  searchProducts,
  getProductByBarcode,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrder,
  getOrderHistory,
  getRecentOrders,
  processPayment,
  getPaymentMethods,
  generateReceipt,
  printReceipt,
  startShift,
  endShift,
  getShiftSummary,
};
