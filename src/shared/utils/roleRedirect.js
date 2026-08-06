import { hasRole, hasAnyPermission } from './permissions';
import { POS_PERMISSIONS, INVENTORY_PERMISSIONS } from './routeAccess';

export { hasRole };

/**
 * Route mặc định sau khi đăng nhập.
 * Ưu tiên theo permission (động, do Owner/Admin cấu hình).
 * Role Owner/Admin chỉ dùng để nhận diện tài khoản "quản trị" khi API không trả permissions.
 */
export const getDefaultRouteByUser = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];

  if (hasRole(roles, 'Admin')) return '/admin';
  if (hasRole(roles, 'Owner')) return '/inventory/owner-dashboard';

  if (hasAnyPermission(user, ['SYSTEM_MANAGE'])) return '/admin';
  if (hasAnyPermission(user, ['OWNER_MANAGE'])) return '/inventory/owner-dashboard';
  if (hasAnyPermission(user, POS_PERMISSIONS)) return '/pos';
  if (hasAnyPermission(user, INVENTORY_PERMISSIONS)) return '/inventory/dashboard';
  return '/';
};

/** @deprecated Dùng getDefaultRouteByUser thay thế. Giữ lại để tương thích. */
export const getDefaultRouteByRole = getDefaultRouteByUser;