/**
 * Admin Service - Tất cả API calls cho module Quản trị hệ thống
 * Gọi đến apiClient và endpoints tập trung
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
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
export const getDashboardStats = () => apiGet(ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const getRevenueChart = (year) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_REVENUE}${buildQueryString({ year })}`);
export const getRecentEvents = (limit = 20) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_EVENTS}${buildQueryString({ limit })}`);
export const exportDashboard = () =>
  apiGet(ENDPOINTS.ADMIN.DASHBOARD_EXPORT, { responseType: 'blob' });

// ============ Staff Accounts ============
export const getStaffList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.STAFF_LIST}${buildQueryString(params)}`);
export const getStaffDetail = (id) => apiGet(ENDPOINTS.ADMIN.STAFF_DETAIL(id));
export const createStaff = (data) => apiPost(ENDPOINTS.ADMIN.STAFF_CREATE, data);
export const updateStaff = (id, data) => apiPut(ENDPOINTS.ADMIN.STAFF_UPDATE(id), data);
export const changeStaffStatus = (id, status) =>
  apiPut(ENDPOINTS.ADMIN.STAFF_STATUS(id), { status });
export const banStaff = (id, reason) => apiPut(ENDPOINTS.ADMIN.STAFF_BAN(id), { reason });

// ============ Community Users ============
export const getCommunityList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.COMMUNITY_LIST}${buildQueryString(params)}`);
export const getCommunityDetail = (id) => apiGet(ENDPOINTS.ADMIN.COMMUNITY_DETAIL(id));
export const createCommunity = (data) => apiPost(ENDPOINTS.ADMIN.COMMUNITY_CREATE, data);
export const updateCommunity = (id, data) => apiPut(ENDPOINTS.ADMIN.COMMUNITY_UPDATE(id), data);
export const changeCommunityStatus = (id, status) =>
  apiPut(ENDPOINTS.ADMIN.COMMUNITY_STATUS(id), { status });
export const banCommunity = (id, reason) => apiPut(ENDPOINTS.ADMIN.COMMUNITY_BAN(id), { reason });

// ============ Store Approvals ============
export const getApprovalList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.APPROVAL_LIST}${buildQueryString(params)}`);
export const getApprovalDetail = (id) => apiGet(ENDPOINTS.ADMIN.APPROVAL_DETAIL(id));
export const approveStore = (id, notes) => apiPut(ENDPOINTS.ADMIN.APPROVAL_APPROVE(id), { notes });
export const rejectStore = (id, reason) => apiPut(ENDPOINTS.ADMIN.APPROVAL_REJECT(id), { reason });

// ============ System Notifications ============
export const getNotificationList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.NOTIF_LIST}${buildQueryString(params)}`);
export const createNotification = (data) => apiPost(ENDPOINTS.ADMIN.NOTIF_CREATE, data);
export const updateNotification = (id, data) => apiPut(ENDPOINTS.ADMIN.NOTIF_UPDATE(id), data);
export const sendNotification = (id) => apiPut(ENDPOINTS.ADMIN.NOTIF_SEND(id));
export const cancelNotification = (id) => apiPut(ENDPOINTS.ADMIN.NOTIF_CANCEL(id));
export const deleteNotification = (id) => apiDelete(ENDPOINTS.ADMIN.NOTIF_DELETE(id));

// ============ System Logs ============
export const getLogList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.LOG_LIST}${buildQueryString(params)}`);
export const getLogDetail = (id) => apiGet(ENDPOINTS.ADMIN.LOG_DETAIL(id));
export const exportLogs = (format = 'csv') =>
  apiGet(`${ENDPOINTS.ADMIN.LOG_EXPORT}${buildQueryString({ format })}`, {
    responseType: 'blob',
  });

// ============ Community Categories ============
export const getCategoryList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.CATEGORY_LIST}${buildQueryString(params)}`);
export const createCategory = (data) => apiPost(ENDPOINTS.ADMIN.CATEGORY_CREATE, data);
export const updateCategory = (id, data) => apiPut(ENDPOINTS.ADMIN.CATEGORY_UPDATE(id), data);
export const reorderCategory = (id, newOrder) =>
  apiPut(ENDPOINTS.ADMIN.CATEGORY_REORDER(id), { newOrder });
export const deleteCategory = (id) => apiDelete(ENDPOINTS.ADMIN.CATEGORY_DELETE(id));

// ============ Posts Moderation ============
export const getPostList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.POST_LIST}${buildQueryString(params)}`);
export const lockPost = (id) => apiPut(ENDPOINTS.ADMIN.POST_LOCK(id));
export const unlockPost = (id) => apiPut(ENDPOINTS.ADMIN.POST_UNLOCK(id));
export const pinPost = (id) => apiPut(ENDPOINTS.ADMIN.POST_PIN(id));
export const unpinPost = (id) => apiPut(ENDPOINTS.ADMIN.POST_UNPIN(id));
export const hidePost = (id) => apiPut(ENDPOINTS.ADMIN.POST_HIDE(id));

// ============ Violation Reports ============
export const getReportList = (params = {}) =>
  apiGet(`${ENDPOINTS.ADMIN.REPORT_LIST}${buildQueryString(params)}`);
export const getReportDetail = (id) => apiGet(ENDPOINTS.ADMIN.REPORT_DETAIL(id));
export const resolveReport = (id, action, adminNote) =>
  apiPut(ENDPOINTS.ADMIN.REPORT_RESOLVE(id), { action, adminNote });
