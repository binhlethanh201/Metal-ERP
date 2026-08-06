const normalizePermission = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '');

export const hasRole = (userRoles = [], roleToCheck) =>
  userRoles.some(
    (r) => r?.replace(/\s+/g, '').toLowerCase() === roleToCheck.replace(/\s+/g, '').toLowerCase()
  );

const normalizePermissionList = (user) => {
  if (!user) return [];

  const directPermissions = [];
  const candidateSources = [
    user.permissions,
    user.permissionCodes,
    user.permissionList,
    user.customPermissions,
    user.customPermissionCodes,
  ];

  candidateSources.forEach((source) => {
    if (!source) return;

    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (typeof item === 'string') {
          directPermissions.push(normalizePermission(item));
        } else if (item && typeof item === 'object') {
          const code = item.permissionCode || item.code || item.name || item.permission;
          if (code) directPermissions.push(normalizePermission(code));
        }
      });
    } else if (typeof source === 'string') {
      directPermissions.push(normalizePermission(source));
    } else if (typeof source === 'object') {
      const code = source.permissionCode || source.code || source.name || source.permission;
      if (code) directPermissions.push(normalizePermission(code));
    }
  });

  return directPermissions.filter(Boolean);
};

export const hasPermission = (user, permission) => {
  if (!permission) return false;
  const normalizedPermission = normalizePermission(permission);
  if (!normalizedPermission) return false;

  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  const isOwner = roles.some((role) => normalizePermission(role) === 'OWNER');
  const isAdmin = roles.some((role) => normalizePermission(role) === 'ADMIN');

  if (isOwner) return true;
  // Admin được mặc định cấp quyền quản trị hệ thống khi API không trả mảng permissions
  if (isAdmin && normalizedPermission === 'SYSTEM_MANAGE') return true;

  const permissions = normalizePermissionList(user);
  return permissions.includes(normalizedPermission);
};

export const hasAnyPermission = (user, permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

export const hasRoleOrPermission = (user, permission) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  const isOwner = roles.some((role) => normalizePermission(role) === 'OWNER');
  return isOwner || hasPermission(user, permission);
};
