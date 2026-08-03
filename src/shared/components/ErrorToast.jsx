import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorToast = ({ message, redirectTo = '/', duration = 2500 }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      navigate(redirectTo, { replace: true });
    }, duration);
    return () => clearTimeout(timer);
  }, [navigate, redirectTo, duration]);

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-5 z-[9999] -translate-x-1/2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-2xl">
      {message}
    </div>
  );
};

export default ErrorToast;
