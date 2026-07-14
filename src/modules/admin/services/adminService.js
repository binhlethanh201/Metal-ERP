import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ============ Dashboard ============
export const getDashboardStats = () => apiGet(ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const getRevenueChart = (year) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_REVENUE}?year=${year}`);
export const getRecentEvents = (limit) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_EVENTS}?limit=${limit || 20}`);
export const exportDashboard = () =>
  apiGet(ENDPOINTS.ADMIN.DASHBOARD_EXPORT, { responseType: 'blob' });

// ============ User Management ============
export const getUserList = (params = {}) => apiGet(ENDPOINTS.ADMIN.USER_LIST, { params });
export const getUserDetail = (id) => apiGet(ENDPOINTS.ADMIN.USER_DETAIL(id));
export const createUser = (data) => apiPost(ENDPOINTS.ADMIN.USER_CREATE, data);
export const updateUser = (id, data) => apiPut(ENDPOINTS.ADMIN.USER_UPDATE(id), data);
export const assignUserRoles = (id, roleIds) => apiPut(ENDPOINTS.ADMIN.USER_ROLES(id), { roleIds });
export const changeUserStatus = (id, isActive) =>
  apiPatch(ENDPOINTS.ADMIN.USER_STATUS(id), { isActive });
export const resetUserPassword = (id, newPassword) =>
  apiPost(ENDPOINTS.ADMIN.USER_RESET_PASSWORD(id), { newPassword });
export const getUserActivities = (id) => apiGet(ENDPOINTS.ADMIN.USER_ACTIVITIES(id));

// ============ Role & Permission Management ============
export const getRoleList = () => apiGet(ENDPOINTS.ADMIN.ROLE_LIST);
export const getPermissionList = () => apiGet(ENDPOINTS.ADMIN.ROLE_PERMISSIONS);
export const getPermissionMatrix = () => apiGet(ENDPOINTS.ADMIN.ROLE_MATRIX);
export const updateRolePermissions = (id, permissionIds) =>
  apiPut(ENDPOINTS.ADMIN.ROLE_UPDATE_PERMISSIONS(id), { permissionIds });

// ============ Store Approvals ============
export const getApprovalList = (params = {}) => apiGet(ENDPOINTS.ADMIN.APPROVAL_LIST, { params });
export const getApprovalDetail = (id) => apiGet(ENDPOINTS.ADMIN.APPROVAL_DETAIL(id));
export const approveStore = (id, notes) => apiPut(ENDPOINTS.ADMIN.APPROVAL_APPROVE(id), { notes });
export const rejectStore = (id, reason) => apiPut(ENDPOINTS.ADMIN.APPROVAL_REJECT(id), { reason });

// ============ System Notifications ============
export const getNotificationList = (params = {}) => apiGet(ENDPOINTS.ADMIN.NOTIF_LIST, { params });
export const createNotification = (data) => apiPost(ENDPOINTS.ADMIN.NOTIF_CREATE, data);
export const updateNotification = (id, data) => apiPut(ENDPOINTS.ADMIN.NOTIF_UPDATE(id), data);
export const sendNotification = (id) => apiPut(ENDPOINTS.ADMIN.NOTIF_SEND(id));
export const cancelNotification = (id) => apiPut(ENDPOINTS.ADMIN.NOTIF_CANCEL(id));
export const deleteNotification = (id) => apiDelete(ENDPOINTS.ADMIN.NOTIF_DELETE(id));

// ============ System Logs ============
export const getLogList = (params = {}) => apiGet(ENDPOINTS.ADMIN.LOG_LIST, { params });
export const getLogDetail = (id) => apiGet(ENDPOINTS.ADMIN.LOG_DETAIL(id));
export const exportLogs = (format = 'csv') =>
  apiGet(`${ENDPOINTS.ADMIN.LOG_EXPORT}?format=${format}`, { responseType: 'blob' });
