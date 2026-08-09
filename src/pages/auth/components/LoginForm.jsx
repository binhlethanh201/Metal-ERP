import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginForm = ({ onSubmit, isLoading, error, clearError }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error transition-all">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-[#999999]"
          htmlFor="email"
        >
          Email đăng nhập
        </label>
        <div className="group relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary dark:text-[#808080]"
            size={18}
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-sm font-semibold text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
            placeholder="owner@mepcoffee.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-[#999999]"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          {/* <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
            Quên mật khẩu?
          </Link> */}
        </div>

        <div className="group relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary dark:text-[#808080]"
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
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-10 text-sm font-semibold text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary disabled:hover:text-outline dark:text-[#808080]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Đang xác thực...
          </>
        ) : (
          <>
            Đăng nhập <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
