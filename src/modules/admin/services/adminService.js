import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ============ Dashboard ============
export const getDashboardStats = () => apiGet(ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const getRevenueChart = (year) => apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_REVENUE}?year=${year}`);
export const getRecentEvents = (limit) => apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_EVENTS}?limit=${limit || 20}`);
export const exportDashboard = () => apiGet(ENDPOINTS.ADMIN.DASHBOARD_EXPORT, { responseType: 'blob' });

// ============ Owner Accounts ============
export const getOwnerList = (params = {}) => apiGet(ENDPOINTS.ADMIN.OWNER_LIST, { params });
export const getOwnerDetail = (id) => apiGet(ENDPOINTS.ADMIN.OWNER_DETAIL(id));
export const createOwner  = (data) => apiPost(ENDPOINTS.ADMIN.OWNER_CREATE, data); // payload { role: "Owner" }
export const updateOwner = (id, data) => apiPut(ENDPOINTS.ADMIN.OWNER_UPDATE(id), data);
export const changeOwnerStatus = (id, status) => apiPut(ENDPOINTS.ADMIN.OWNER_STATUS(id), { status });
export const banOwner = (id, reason) => apiPut(ENDPOINTS.ADMIN.OWNER_BAN(id), { reason });

// ============ Admin RBAC ============
export const getRbacPermissions = () => apiGet(ENDPOINTS.ADMIN.RBAC_PERMISSIONS);
export const getRbacRoles = () => apiGet(ENDPOINTS.ADMIN.RBAC_ROLES);
export const getRolePermissions = (roleId) => apiGet(ENDPOINTS.ADMIN.RBAC_ROLE_PERMISSIONS(roleId));
export const updateRolePermissions = (roleId, permissionIds) => apiPut(ENDPOINTS.ADMIN.RBAC_ROLE_PERMISSIONS(roleId), { permissionIds });

// ============ Store Approvals ============
export const getApprovalList = (params = {}) => apiGet(ENDPOINTS.ADMIN.APPROVAL_LIST, { params });
export const getApprovalDetail = (id) => apiGet(ENDPOINTS.ADMIN.APPROVAL_DETAIL(id));
export const approveStore = (id, notes) => apiPut(ENDPOINTS.ADMIN.APPROVAL_APPROVE(id), { notes });
export const rejectStore = (id, reason) => apiPut(ENDPOINTS.ADMIN.APPROVAL_REJECT(id), { reason });

// ============ System Notifications ============
export const getNotificationList = (params = {}) => apiGet(ENDPOINTS.ADMIN.NOTIF_LIST, { params });
export const createNotification = (data) => apiPost(ENDPOINTS.ADMIN.NOTIF_CREATE, data);
export const updateNotification = (id, data) => apiPut(ENDPOINTS.ADMIN.NOTIF_UPDATE(id), data);
export const sendNotification = (id)  => apiPut(ENDPOINTS.ADMIN.NOTIF_SEND(id));
export const cancelNotification = (id) => apiPut(ENDPOINTS.ADMIN.NOTIF_CANCEL(id));
export const deleteNotification = (id) => apiDelete(ENDPOINTS.ADMIN.NOTIF_DELETE(id));

// ============ System Logs ============
export const getLogList  = (params = {}) => apiGet(ENDPOINTS.ADMIN.LOG_LIST, { params });
export const getLogDetail = (id) => apiGet(ENDPOINTS.ADMIN.LOG_DETAIL(id));
export const exportLogs = (format = 'csv') => apiGet(`${ENDPOINTS.ADMIN.LOG_EXPORT}?format=${format}`, { responseType: 'blob' });
