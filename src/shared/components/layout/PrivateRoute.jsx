import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasAnyPermission } from '../../utils/permissions';

const PrivateRoute = ({ allowedRoles = [], allowedPermissions = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập thì đá ra trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ưu tiên kiểm tra theo permission (động, do Owner/Admin cấu hình)
  if (allowedPermissions.length > 0) {
    if (!hasAnyPermission(user, allowedPermissions)) {
      return <Navigate to="/403" replace />;
    }
    return <Outlet />;
  }

  // Fallback: kiểm tra theo role (giữ nguyên hành vi cũ)
  if (allowedRoles.length > 0) {
    // API backend trả về user.roles là một mảng
    const userRoles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];

    // Kiểm tra xem User có sở hữu BẤT KỲ Role nào nằm trong danh sách cho phép không
    const hasRole = userRoles.some((role) =>
      allowedRoles.some(
        (allowedRole) =>
          allowedRole.replace(/\s+/g, '').toLowerCase() === role.replace(/\s+/g, '').toLowerCase()
      )
    );

    // Có token nhưng Không đủ quyền -> Đá ra trang 403 Access Denied
    if (!hasRole) {
      return <Navigate to="/403" replace />;
    }
  }

  // Đã đăng nhập và đủ quyền -> Cho phép truy cập (Render Outlet)
  return <Outlet />;
};

export default PrivateRoute;
