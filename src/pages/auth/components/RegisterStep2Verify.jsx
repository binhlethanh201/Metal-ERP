import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Store,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { registerVerifyRequest, registerStartRequest } from '../../../services/authService';

const OtpStep = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRef = useRef(null);

  // Tự focus vào input ẩn khi mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Đếm ngược sau khi resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await registerStartRequest({ email });
      setResendCountdown(60);
      setOtp('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err?.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Mã OTP phải đủ 6 số.');
      return;
    }
    onVerified(otp);
  };

  const otpDigits = otp.split('').concat(Array(6).fill('')).slice(0, 6);

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      {/* Header nhỏ */}
      <div className="rounded-md border border-outline-variant/50 bg-surface-container p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-[#999999]">Mã OTP đã gửi đến</p>
            <p className="text-sm font-bold text-on-surface dark:text-[#e5e5e5]">{email}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-on-surface-variant/70 dark:text-[#999999]">
          Mã có hiệu lực trong{' '}
          <span className="font-semibold text-on-surface-variant dark:text-[#b3b3b3]">10 phút</span>. Kiểm tra hộp thư
          đến (hoặc thư mục Spam).
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error">
          {error}
        </div>
      )}

      {/* OTP Boxes */}
      <div className="space-y-3">
        <label className="block text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-[#999999]">
          Nhập mã xác thực
        </label>
        <div className="relative mx-auto flex max-w-[300px] justify-between gap-2">
          {otpDigits.map((digit, idx) => (
            <div
              key={idx}
              className={`flex h-14 w-11 items-center justify-center rounded-lg border-2 text-2xl font-bold transition-all ${
                digit
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#999999]'
              } ${otp.length === idx ? 'border-primary ring-2 ring-primary/20' : ''} `}
            >
              {digit || <span className="text-outline-variant/40">·</span>}
            </div>
          ))}
          {/* Input ẩn bắt sự kiện gõ phím */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={loading}
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
            aria-label="Nhập mã OTP 6 số"
          />
        </div>

        {/* Resend */}
        <div className="text-center text-sm font-semibold">
          {resendCountdown > 0 ? (
            <span className="text-on-surface-variant dark:text-[#999999]">
              Gửi lại sau <span className="tabular-nums text-primary">{resendCountdown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw size={13} />
              Gửi lại mã OTP
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm hover:bg-on-primary-fixed-variant disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Đang kiểm tra...
            </>
          ) : (
            'XÁC NHẬN MÃ OTP'
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface dark:text-[#999999] dark:hover:text-[#d4d4d4]"
        >
          <ArrowLeft size={16} /> Quay lại đổi Email
        </button>
      </div>
    </form>
  );
};

// ─── SUB-STEP 2: Điền thông tin & hoàn tất đăng ký ─────────────────────────
const ProfileStep = ({ email, otpCode, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    branchName: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
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
      await registerVerifyRequest({
        email,
        otpCode,
        password: formData.password,
        fullName: formData.fullName,
        branchName: formData.branchName,
      });
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      // Nếu OTP đã hết hạn trong lúc điền form → cho phép quay lại bước OTP
      setError(err?.message || 'Có lỗi xảy ra. Mã OTP có thể đã hết hạn, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Badge OTP đã xác nhận */}
      <div className="border-[color:var(--md-sys-color-tertiary,#4CAF50)]/30 bg-[color:var(--md-sys-color-tertiary,#4CAF50)]/5 flex items-center gap-2 rounded-md border px-3 py-2 dark:border-green-800 dark:bg-green-900/10">
        <CheckCircle2
          size={16}
          className="flex-shrink-0 text-[color:var(--md-sys-color-tertiary,#4CAF50)]"
        />
        <span className="text-xs font-semibold text-on-surface-variant dark:text-[#999999]">
          Mã OTP đã xác nhận — <span className="font-bold text-on-surface dark:text-[#e5e5e5]">{email}</span>
        </span>
        <button
          type="button"
          onClick={onBack}
          className="ml-auto text-xs font-semibold text-primary hover:underline"
        >
          Đổi
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error">
          {error}
        </div>
      )}

      {/* Thông tin cá nhân & cửa hàng */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">Họ và Tên</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]" size={18} />
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              autoFocus
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
              placeholder="Tên chủ tài khoản"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">
            Tên Cửa Hàng
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]" size={18} />
            <input
              required
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
              placeholder="Tên chi nhánh / Công ty"
            />
          </div>
        </div>
      </div>

      {/* Mật khẩu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]" size={18} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-10 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
              placeholder="Tối thiểu 6 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary dark:text-[#808080]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">Xác nhận MK</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]" size={18} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-md border border-outline-variant py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm hover:bg-on-primary-fixed-variant disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Đang thiết lập tài khoản...
            </>
          ) : (
            'HOÀN TẤT ĐĂNG KÝ'
          )}
        </button>
      </div>
    </form>
  );
};

// ─── COMPONENT CHA: điều phối 2 sub-step ────────────────────────────────────
const RegisterStep2Verify = ({ email, onBack }) => {
  // subStep: 'otp' | 'profile'
  const [subStep, setSubStep] = useState('otp');
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const handleOtpVerified = (otp) => {
    setVerifiedOtp(otp);
    setSubStep('profile');
  };

  const handleBackToOtp = () => {
    setSubStep('otp');
    setVerifiedOtp('');
  };

  return (
    <>
      {subStep === 'otp' ? (
        <OtpStep email={email} onVerified={handleOtpVerified} onBack={onBack} />
      ) : (
        <ProfileStep email={email} otpCode={verifiedOtp} onBack={handleBackToOtp} />
      )}
    </>
  );
};

export default RegisterStep2Verify;
