import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';

// ============ Dashboard ============
export const getDashboardStats = () => apiGet(ENDPOINTS.ADMIN.DASHBOARD_STATS);
export const getOverview = () => apiGet('/api/admin/dashboard/overview');
export const getRevenueChart = (year) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_REVENUE}?year=${year}`);
export const getRecentEvents = (limit) =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_EVENTS}?limit=${limit || 20}`);
export const exportDashboard = (format = 'excel') =>
  apiGet(`${ENDPOINTS.ADMIN.DASHBOARD_EXPORT}?format=${format}`, { responseType: 'blob' });

// ============ User Accounts (Unified) ============
export const getUserList = (params = {}) => apiGet(ENDPOINTS.ADMIN.ACCOUNT_LIST, { params });
export const getUserDetail = (id) => apiGet(ENDPOINTS.ADMIN.ACCOUNT_DETAIL(id));

// Admin creates Staff (since we want unified flow, we could route based on role)
export const createStaff = (data) => apiPost(ENDPOINTS.ADMIN.ACCOUNT_CREATE_STAFF, data);

// Note: CreateOwner is now ACCOUNT_CREATE_OWNER

export const updateUser = (id, data) => apiPut(ENDPOINTS.ADMIN.ACCOUNT_UPDATE(id), data);
export const assignUserRoles = (id, roleIds) =>
  apiPut(ENDPOINTS.ADMIN.ACCOUNT_ROLES(id), { roleIds });
export const assignUserBranch = (id, branchId) =>
  apiPut(ENDPOINTS.ADMIN.ACCOUNT_ASSIGN_BRANCH(id), { branchId });
export const changeUserStatus = (id, isActive) =>
  apiPatch(ENDPOINTS.ADMIN.ACCOUNT_STATUS(id), { isActive });
export const resetUserPassword = (id, newPassword) =>
  apiPost(ENDPOINTS.ADMIN.ACCOUNT_RESET_PASSWORD(id), { newPassword });
export const getUserActivities = (id, page = 1, pageSize = 20) =>
  apiGet(`${ENDPOINTS.ADMIN.USER_ACTIVITIES(id)}?page=${page}&pageSize=${pageSize}`);

export const softDeleteUser = (id) => apiDelete(ENDPOINTS.ADMIN.ACCOUNT_SOFT_DELETE(id));
export const permanentDeleteUser = (id) => apiDelete(ENDPOINTS.ADMIN.ACCOUNT_PERMANENT_DELETE(id));
export const restoreUser = (id) => apiPost(ENDPOINTS.ADMIN.ACCOUNT_RESTORE(id));
export const checkUserRelations = (id) => apiGet(ENDPOINTS.ADMIN.ACCOUNT_CHECK_RELATIONS(id));

// ============ Owner Accounts ============
export const getOwnerList = (params = {}) => apiGet(ENDPOINTS.ADMIN.OWNER_LIST, { params });
export const createOwner = (data) => apiPost(ENDPOINTS.ADMIN.ACCOUNT_CREATE_OWNER, data);
export const updateOwner = (id, data) => apiPut(ENDPOINTS.ADMIN.OWNER_UPDATE(id), data);
export const banOwner = (id, reason) => apiPut(ENDPOINTS.ADMIN.OWNER_BAN(id), { reason });

// ============ Admin Branch Management ============
export const getAdminBranches = (params = {}) => apiGet(ENDPOINTS.ADMIN.BRANCH_LIST, { params });
export const getAdminBranchDetail = (id) => apiGet(ENDPOINTS.ADMIN.BRANCH_DETAIL(id));
export const createAdminBranch = (data) => apiPost(ENDPOINTS.ADMIN.BRANCH_CREATE, data);
export const updateAdminBranch = (id, data) => apiPut(ENDPOINTS.ADMIN.BRANCH_UPDATE(id), data);
export const deleteAdminBranch = (id) => apiDelete(ENDPOINTS.ADMIN.BRANCH_DELETE(id));
export const restoreAdminBranch = (id) => apiPatch(ENDPOINTS.ADMIN.BRANCH_RESTORE(id));
export const hardDeleteAdminBranch = (id) => apiDelete(ENDPOINTS.ADMIN.BRANCH_HARD_DELETE(id));
export const assignUserToAdminBranch = (id, data) =>
  apiPost(ENDPOINTS.ADMIN.BRANCH_ASSIGN_USER(id), data);

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
