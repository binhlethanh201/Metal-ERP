import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  Lock,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { registerStartRequest, registerVerifyRequest } from '../../services/authService';
import Logo from '../../shared/components/Logo';

import loginBg from '../../assets/images/auth-bg.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [countdown, setCountdown] = useState(60);

  const [formData, setFormData] = useState({
    PhoneNumber: '',
    BranchName: '',
    Password: '',
    ConfirmPassword: '',
    OtpCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, OtpCode: value });
    setError('');
  };

  const handleStartRegister = async (e, isResend = false) => {
    if (e) e.preventDefault();
    if (!isResend && formData.Password !== formData.ConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        PhoneNumber: formData.PhoneNumber,
        Password: formData.Password,
        BranchName: formData.BranchName,
      };

      const response = await registerStartRequest(payload);

      setStep(2);
      setCountdown(60);
      setFormData((prev) => ({ ...prev, OtpCode: '' }));

      if (response?.otp) {
        setDevOtp(response.otp);
      }
    } catch (err) {
      setError(err?.message || 'Không thể bắt đầu quá trình đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        PhoneNumber: formData.PhoneNumber,
        Password: formData.Password,
        BranchName: formData.BranchName,
        OtpCode: formData.OtpCode,
      };

      const response = await registerVerifyRequest(payload);

      if (response?.token) {
        const userInfo = {
          userId: response.userId,
          branchId: response.branchId,
          phone: formData.PhoneNumber,
          role: 'store_owner',
        };

        login(userInfo, response.token);
        navigate('/inventory');
      } else {
        navigate('/login', { state: { message: 'Đăng ký thành công, vui lòng đăng nhập!' } });
      }
    } catch (err) {
      setError(err?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (devOtp) {
      setFormData({ ...formData, OtpCode: devOtp });
    }
  };

  const otpArray = formData.OtpCode.split('').concat(Array(6).fill('')).slice(0, 6);

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA]">
      <div className="flex w-full flex-col justify-center px-8 py-10 lg:w-1/2 lg:px-24">
        <div className="mb-6">
          <Logo className="mb-8" />
          <h1 className="text-3xl font-black tracking-tighter text-textMain">
            {step === 1 ? 'Tạo tài khoản mới.' : 'Xác thực tài khoản.'}
          </h1>
          <p className="mt-2 text-sm text-placeholder">
            {step === 1 ? (
              'Vui lòng nhập thông tin để đăng ký hệ thống.'
            ) : (
              <>
                Mã OTP đã được gửi đến số{' '}
                <span className="font-bold text-primary">{formData.PhoneNumber}</span>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-bold text-red-600 transition-all">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStartRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="PhoneNumber"
              >
                Số điện thoại
              </label>
              <div className="group relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  id="PhoneNumber"
                  name="PhoneNumber"
                  type="tel"
                  required
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="Nhập SĐT đăng ký"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="BranchName"
              >
                Tên chi nhánh cửa hàng
              </label>
              <div className="group relative">
                <Store
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  id="BranchName"
                  name="BranchName"
                  type="text"
                  required
                  value={formData.BranchName}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="Nhập tên chi nhánh của bạn"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="Password"
              >
                Mật khẩu
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  id="Password"
                  name="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.Password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-10 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-placeholder hover:text-primary disabled:hover:text-placeholder"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-bold uppercase tracking-widest text-slate-500"
                htmlFor="ConfirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  id="ConfirmPassword"
                  name="ConfirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.ConfirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-customer border border-borderLight bg-white py-3 pl-10 pr-10 text-sm font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-customer bg-primary py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black active:scale-[0.98] disabled:pointer-events-none disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Tiếp tục <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyRegister} className="space-y-6">
            {devOtp && (
              <div
                onClick={handleAutoFillOtp}
                className="group cursor-pointer rounded-xl border border-primary/30 bg-primary/5 p-3 text-center transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm"
              >
                <div className="flex h-5 items-center justify-center">
                  <span className="text-xs text-placeholder transition-opacity group-hover:hidden">
                    Mã OTP thử nghiệm (Dev)
                  </span>
                  <span className="hidden items-center gap-1 text-xs font-bold text-primary group-hover:flex">
                    <CheckCircle2 size={14} /> Click để tự động điền nhanh
                  </span>
                </div>
                <p className="mt-1 font-mono text-2xl font-black tracking-[0.25em] text-primary">
                  {devOtp}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                Nhập mã xác thực 6 số
              </label>

              <div className="relative mx-auto flex max-w-[280px] justify-between gap-2">
                {otpArray.map((digit, index) => (
                  <div
                    key={index}
                    className={`flex h-12 w-10 items-center justify-center rounded-lg border-2 text-xl font-bold transition-colors sm:h-14 sm:w-11 ${
                      digit
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-borderLight bg-white text-placeholder'
                    } ${
                      formData.OtpCode.length === index ? 'border-primary ring-1 ring-primary' : ''
                    }`}
                  >
                    {digit || '_'}
                  </div>
                ))}

                <input
                  type="tel"
                  name="OtpCode"
                  maxLength={6}
                  autoFocus
                  value={formData.OtpCode}
                  onChange={handleOtpChange}
                  disabled={loading}
                  className="absolute inset-0 h-full w-full cursor-text opacity-0"
                />
              </div>
            </div>

            <div className="text-center text-sm font-semibold">
              {countdown > 0 ? (
                <span className="text-placeholder">
                  Gửi lại mã sau <span className="font-bold text-primary">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleStartRegister(e, true)}
                  disabled={loading}
                  className="mx-auto flex items-center justify-center gap-1 font-bold text-primary hover:underline focus:outline-none"
                >
                  <RefreshCw size={14} /> Gửi lại mã OTP
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || formData.OtpCode.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-customer bg-primary py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black active:scale-[0.98] disabled:pointer-events-none disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác thực & Đăng ký'
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep(1);
                  setDevOtp('');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-customer py-3 text-sm font-bold text-placeholder transition-all hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeft size={16} /> Quay lại chỉnh sửa thông tin
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-sm font-medium text-placeholder">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        )}
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

export default RegisterPage;
