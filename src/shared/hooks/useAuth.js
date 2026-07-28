import { useState } from 'react';

// Đã chuyển đổi sang localStorage để lưu trữ phiên đăng nhập bền vững
const getSafeUser = () => {
  try {
    const item = localStorage.getItem('user');
    if (!item) return null;
    const parsedUser = JSON.parse(item);

    // API mới trả về "roles" (array) thay vì "role" (string). Cần check cả 2.
    if (!parsedUser || (!parsedUser.role && !parsedUser.roles) || !parsedUser.email) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      return null;
    }

    return parsedUser;
  } catch (error) {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(getSafeUser);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading] = useState(false);

  const login = (userData, authToken) => {
    // Clear POS active shift của user cũ (nếu có) TRƯỚC khi set user mới
    // để tránh shift cũ "carry-over" sang user mới (vd: admin tạo nhân viên rồi login lại)
    localStorage.removeItem('pos_active_shift');
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clear POS-related state (shift from previous user) để tránh shift cũ
    // "carry-over" sang user mới
    localStorage.removeItem('pos_active_shift');
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };
};

export default useAuth;
