import { useState } from 'react';

// Giai đoạn MVP sử dụng sessionStorage để chỉ lưu dữ liệu trong phiên làm việc hiện tại của Tab trình duyệt
// Giai đoạn sau sẽ sử dụng localStorage cho dự án

const getSafeUser = () => {
  try {
    const item = sessionStorage.getItem('user');
    if (!item) return null;
    const parsedUser = JSON.parse(item);

    if (!parsedUser || !parsedUser.role || !parsedUser.email) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      return null;
    }

    return parsedUser;
  } catch (error) {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(getSafeUser);
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
  const [loading] = useState(false);

  const login = (userData, authToken) => {
    sessionStorage.setItem('authToken', authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
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
