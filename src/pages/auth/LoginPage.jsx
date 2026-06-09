import React, { useState } from 'react';
import { useNavigate, Link } from '../../shared/router';
import { Phone, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { loginRequest } from '../../services/authService';
import Logo from '../../shared/components/Logo';

import loginBg from '../../assets/images/auth-bg.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ sdt: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ sdt: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');
    setFieldErrors({ sdt: '', password: '' });

    const validationErrors = {};
    if (!formData.sdt.trim()) {
      validationErrors.sdt = 'Vui lòng nhập email';
    }
    if (!formData.password.trim()) {
      validationErrors.password = 'Mật khẩu không được để trống';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginRequest({
        phone: formData.sdt,
        password: formData.password,
      });

      const userInfo = response?.user;
      if (!userInfo) {
        throw new Error('Hệ thống không trả về thông tin tài khoản hợp lệ.');
      }

      login(userInfo, response.token);
      navigate(userInfo.role === 'admin' ? '/admin' : '/inventory');
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA]">
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mb-6">
          <Logo className="mb-8" />
          <h1 className="text-3xl font-black tracking-tighter text-textMain">Chào mừng trở lại.</h1>
          <p className="mt-2 text-sm text-placeholder">
            Vui lòng nhập thông tin để truy cập hệ thống.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-bold text-red-600 transition-all">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className="text-xs font-bold uppercase tracking-widest text-slate-500"
              htmlFor="sdt"
            >
              Số điện thoại
            </label>
            <div className="group relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                size={18}
              />
              <input
                id="sdt"
                name="sdt"
                type="tel"
                required
                value={formData.sdt}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Nhập SĐT của bạn"
              />
            </div>
            {fieldErrors.sdt && (
              <p className="mt-2 text-sm font-semibold text-red-600" role="alert">
                {fieldErrors.sdt}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <div className="group relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                size={18}
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-10 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-placeholder hover:text-primary disabled:hover:text-placeholder"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-2 text-sm font-semibold text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-customer bg-primary py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black active:scale-[0.98] disabled:pointer-events-none disabled:bg-gray-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang xác thực...
              </>
            ) : (
              <>
                Đăng nhập <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-placeholder">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2">
        <img
          src={loginBg}
          alt="M.E.P Retail Management Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/80 to-primary/60 mix-blend-multiply" />
        <div className="relative z-10 max-w-md px-8 text-center text-white drop-shadow-lg">
          <h2 className="mb-6 text-4xl font-black leading-tight tracking-tighter">
            M.E.P Intelligent Retail Management System
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 bg-white/40" />
          <p className="text-base font-medium leading-relaxed text-white/95">
            Hệ thống Quản lý Bán hàng Thông minh ngành Kim khí Điện Nước.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
