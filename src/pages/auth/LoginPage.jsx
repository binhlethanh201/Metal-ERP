import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { loginRequest } from '../../services/authService';
import Logo from '../../shared/components/Logo';
import LoginForm from './components/LoginForm';
import loginBg from '../../assets/images/auth-bg.png';
import { getDefaultRouteByUser } from '../../shared/utils/roleRedirect';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (formData) => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await loginRequest({
        email: formData.email,
        password: formData.password,
      });

      const userInfo = response?.user;
      if (!userInfo) {
        throw new Error('Hệ thống không trả về thông tin tài khoản hợp lệ.');
      }
      login(userInfo, response.token);
      navigate(getDefaultRouteByUser(userInfo));
    } catch (err) {
      if (err?.status === 429 || err?.message?.includes('429')) {
        setError('Vui lòng chờ 1 phút rồi thử lại để đảm bảo an toàn cho tài khoản của bạn.');
      } else if (err?.status === 401 || err?.status === 400) {
        setError(err?.message || 'Email hoặc mật khẩu chưa chính xác. Bạn kiểm tra lại nhé!');
      } else {
        setError('Đang có chút sự cố kết nối. Bạn vui lòng thử lại sau giây lát.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-container-lowest dark:bg-[#0a0a0a]">
      {/* CỘT TRÁI - KHU VỰC FORM */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mb-6">
          <Logo className="mb-8" />
          <h1 className="text-3xl font-black tracking-tight text-on-surface dark:text-[#e5e5e5]">Chào mừng trở lại.</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-[#999999]">
            Vui lòng nhập Email và Mật khẩu để truy cập hệ thống.
          </p>
        </div>

        {/* COMPONENT FORM ĐĂNG NHẬP */}
        <LoginForm
          onSubmit={handleLoginSubmit}
          isLoading={isLoading}
          error={error}
          clearError={() => setError('')}
        />

        <p className="mt-8 text-center text-sm font-medium text-on-surface-variant dark:text-[#999999]">
          Liên hệ Admin để cấp tài khoản.
        </p>
      </div>

      {/* CỘT PHẢI - BANNER HÌNH ẢNH */}
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2">
        <img
          src={loginBg}
          alt="M.E.P Retail Management Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/60 mix-blend-multiply" />
        <div className="relative z-10 max-w-md px-8 text-center text-white drop-shadow-lg">
          <h2 className="mb-6 text-4xl font-black leading-tight tracking-tighter">
            M.E.P Retail Management System
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 bg-white/40" />
          <p className="text-base font-medium leading-relaxed text-white/95">
            Hệ thống Quản lý Bán hàng ngành Kim khí Điện Nước.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
