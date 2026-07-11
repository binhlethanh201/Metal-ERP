export const hasRole = (userRoles = [], roleToCheck) =>
  userRoles.some((r) => r?.toLowerCase() === roleToCheck.toLowerCase());

export const getDefaultRouteByRole = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  if (hasRole(roles, 'Admin')) return '/admin';
  if (hasRole(roles, 'SalesStaff')) return '/pos';
  if (hasRole(roles, 'InventoryStaff')) return '/inventory/dashboard';
  if (hasRole(roles, 'Owner')) return '/inventory/owner-dashboard';
  return '/';
};
