import { hasRole, hasAnyPermission } from './permissions';
import { POS_PERMISSIONS, INVENTORY_PERMISSIONS, ROUTE_PERMISSIONS } from './routeAccess';

export { hasRole };

/**
 * Route mac dinh sau khi dang nhap.
 * Uu tien theo permission (dong, do Owner/Admin cau hinh).
 * Role Owner/Admin chi dung de nhan dien tai khoan "quan tri" khi API khong tra permissions.
 *
 * Nguyen tac dieu huong:
 * - Neu chi co quyen thao tac tren 1 trang cu the (vd: STOCK_INWARD_CREATE),
 *   chuyen huong thang den trang do thay vi vao dashboard.
 */
export const getDefaultRouteByUser = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];

  if (hasRole(roles, 'Admin')) return '/admin';
  if (hasRole(roles, 'Owner')) return '/inventory/owner-dashboard';

  if (hasAnyPermission(user, ['SYSTEM_MANAGE'])) return '/admin';
  if (hasAnyPermission(user, ['OWNER_MANAGE'])) return '/inventory/owner-dashboard';

  // POS module
  if (hasAnyPermission(user, POS_PERMISSIONS)) {
    if (hasAnyPermission(user, ROUTE_PERMISSIONS.pos)) return '/pos';
  }

  // Inventory module - dashboard luon la default cho moi inventory staff
  if (hasAnyPermission(user, INVENTORY_PERMISSIONS)) {
    return '/inventory/dashboard';
  }

  return '/';
};

/** @deprecated Dung getDefaultRouteByUser thay the. Giu lai de tuong thich. */
export const getDefaultRouteByRole = getDefaultRouteByUser;