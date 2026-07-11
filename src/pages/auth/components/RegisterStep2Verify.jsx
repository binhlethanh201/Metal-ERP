import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Store,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { registerVerifyRequest, registerStartRequest } from '../../../services/authService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getDefaultRouteByRole } from '../../../shared/utils/roleRedirect';

const RegisterStep2Verify = ({ email, devOtp, onBack }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    otpCode: '',
    fullName: '',
    branchName: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOtpChange = (e) =>
    setFormData({ ...formData, otpCode: e.target.value.replace(/\D/g, '') });

  // Xử lý gửi lại OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await registerStartRequest({ email });
      setCountdown(60);
      if (res?.otp) setCurrentDevOtp(res.otp);
      alert('Đã gửi lại mã OTP mới!');
    } catch (err) {
      setError(err?.message || 'Lỗi gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        email,
        otpCode: formData.otpCode,
        password: formData.password,
        fullName: formData.fullName,
        branchName: formData.branchName,
      };

      const response = await registerVerifyRequest(payload);

      if (response?.data?.token) {
        const { token, ...userInfo } = response.data;
        login(userInfo, token);
        navigate(getDefaultRouteByRole(userInfo));
      } else {
        navigate('/login', { state: { message: 'Đăng ký thành công, vui lòng đăng nhập!' } });
      }
    } catch (err) {
      setError(err?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const otpArray = formData.otpCode.split('').concat(Array(6).fill('')).slice(0, 6);

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error">
          {error}
        </div>
      )}

      {currentDevOtp && (
        <div
          onClick={() => setFormData({ ...formData, otpCode: currentDevOtp })}
          className="group cursor-pointer rounded-md border border-primary/30 bg-primary-fixed/20 p-3 text-center transition-all hover:border-primary"
        >
          <span className="text-xs text-on-surface-variant transition-opacity group-hover:hidden">
            Mã OTP Dev (Click để điền)
          </span>
          <span className="hidden items-center justify-center gap-1 text-xs font-bold text-primary group-hover:flex">
            <CheckCircle2 size={14} /> Tự động điền
          </span>
          <p className="mt-1 font-mono text-2xl font-black tracking-widest text-primary">
            {currentDevOtp}
          </p>
        </div>
      )}

      {/* OTP INPUT */}
      <div className="space-y-2 pb-2">
        <label className="block text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Mã xác thực (6 số)
        </label>
        <div className="relative mx-auto flex max-w-[280px] justify-between gap-2">
          {otpArray.map((digit, idx) => (
            <div
              key={idx}
              className={`flex h-12 w-10 items-center justify-center rounded-md border-2 text-xl font-bold transition-colors sm:h-14 sm:w-11 ${digit ? 'border-primary bg-primary-fixed/10 text-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'} ${formData.otpCode.length === idx ? 'border-primary ring-1 ring-primary' : ''}`}
            >
              {digit || '_'}
            </div>
          ))}
          <input
            type="tel"
            maxLength={6}
            autoFocus
            value={formData.otpCode}
            onChange={handleOtpChange}
            disabled={loading}
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
          />
        </div>
        <div className="text-center text-sm font-semibold">
          {countdown > 0 ? (
            <span className="text-on-surface-variant">
              Gửi lại mã sau <span className="text-primary">{countdown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-primary hover:underline"
            >
              <RefreshCw size={14} className="mr-1 inline" />
              Gửi lại OTP
            </button>
          )}
        </div>
      </div>

      {/* THÔNG TIN DOANH NGHIỆP */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant">Họ và Tên</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary"
              placeholder="Tên chủ tài khoản"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant">
            Tên Cửa Hàng
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              required
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary"
              placeholder="Tên chi nhánh/Công ty"
            />
          </div>
        </div>
      </div>

      {/* MẬT KHẨU */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-10 text-sm font-medium outline-none focus:border-primary"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant">Xác nhận MK</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || formData.otpCode.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm hover:bg-on-primary-fixed-variant disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Đang thiết lập...
            </>
          ) : (
            'HOÀN TẤT ĐĂNG KÝ'
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={16} /> Quay lại đổi Email
        </button>
      </div>
    </form>
  );
};

export default RegisterStep2Verify;
