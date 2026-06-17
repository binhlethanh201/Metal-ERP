import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập thì đá ra trang login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu Route yêu cầu quyền (allowedRoles có phần tử)
  if (allowedRoles.length > 0) {
    // API backend trả về user.roles là một mảng
    const userRoles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : [];

    // Kiểm tra xem User có sở hữu BẤT KỲ Role nào nằm trong danh sách cho phép không
    const hasPermission = userRoles.some((role) =>
      allowedRoles.some((allowedRole) => allowedRole.toLowerCase() === role.toLowerCase())
    );

    // Có token nhưng Không đủ quyền -> Đá ra trang 403 Access Denied
    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  // Đã đăng nhập và đủ quyền -> Cho phép truy cập (Render Outlet)
  return <Outlet />;
};

export default PrivateRoute;
