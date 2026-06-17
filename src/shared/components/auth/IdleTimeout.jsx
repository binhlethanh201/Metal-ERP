import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IdleTimeout = ({ timeoutMinutes = 30 }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Bắt sự kiện mỗi khi đổi URL
  const timerRef = useRef(null);

  // Tự viết hàm logout nội bộ để không bị phụ thuộc vào State cũ của useAuth
  const performLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    alert(
      'Phiên đăng nhập đã hết hạn do không có thao tác trong thời gian quy định. Vui lòng đăng nhập lại.'
    );
    navigate('/login', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // BÍ QUYẾT: Đọc trực tiếp từ kho chứa thay vì chờ React State
    const hasToken = localStorage.getItem('authToken');

    if (hasToken) {
      timerRef.current = setTimeout(
        () => {
          performLogout();
        },
        timeoutMinutes * 60 * 1000
      );
    }
  }, [performLogout, timeoutMinutes]);

  useEffect(() => {
    const hasToken = localStorage.getItem('authToken');

    // Nếu chưa có token thì đi ngủ
    if (!hasToken) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleUserActivity = () => resetTimer();

    events.forEach((event) => document.addEventListener(event, handleUserActivity));

    // Kích hoạt đồng hồ ngay khi URL thay đổi (Vừa login xong)
    resetTimer();

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleUserActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname, resetTimer]); // Mỗi khi URL đổi từ /login sang /inventory, useEffect này sẽ chạy lại!

  return null;
};

export default IdleTimeout;
