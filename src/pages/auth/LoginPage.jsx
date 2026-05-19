import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { MOCK_USERS } from '../../shared/data/mockUsers';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const foundUser = MOCK_USERS.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (foundUser) {
      const fakeToken = 'mock_token_' + Date.now();
      const { password, ...userInfo } = foundUser;
      login(userInfo, fakeToken);
      switch (foundUser.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'store_owner':
          navigate('/inventory');
          break;
        case 'cashier':
          navigate('/pos');
          break;
        case 'guest':
          navigate('/forum');
          break;
        default:
          navigate('/');
      }
    } else {
      setError('Email hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-xl">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
              <Factory size={28} />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Chào mừng trở lại</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Đăng nhập vào hệ thống{' '}
              <span className="font-semibold text-primary">AI RETAIL ERP</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-error-container p-3 text-center text-sm font-medium text-on-error-container">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ten@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-10 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline transition-colors hover:text-primary focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold tracking-btn text-on-primary transition-all hover:bg-on-primary-fixed hover:shadow-md active:scale-[0.98]"
              >
                ĐĂNG NHẬP <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-on-surface-variant">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
