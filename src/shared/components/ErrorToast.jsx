import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorToast = ({ message, duration = 2500 }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Quay về trang trước đó thay vì nhảy về landing, để user không tưởng bị đăng xuất.
      // Nếu truy cập trực tiếp vào trang lỗi (không có lịch sử) thì mới về "/".
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [navigate, duration]);

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-5 z-[9999] -translate-x-1/2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-2xl">
      {message}
    </div>
  );
};

export default ErrorToast;
