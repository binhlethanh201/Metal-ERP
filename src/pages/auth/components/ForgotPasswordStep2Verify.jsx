import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  forgotPasswordVerifyRequest,
  forgotPasswordStartRequest,
} from '../../../services/authService';

// ─── SUB-STEP 1: Nhập OTP ────────────────────────────────────────────────────
const OtpStep = ({ email, onOtpConfirmed, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
    setSuccess('');
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await forgotPasswordStartRequest({ email });
      setSuccess('Mã OTP mới đã được gửi đến email của bạn.');
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
    onOtpConfirmed(otp);
  };

  const otpDigits = otp.split('').concat(Array(6).fill('')).slice(0, 6);

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      {/* Header thông tin email */}
      <div className="rounded-md border border-outline-variant/50 bg-surface-container p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant dark:text-[#999999]">
              Mã OTP đã gửi đến
            </p>
            <p className="text-sm font-bold text-on-surface dark:text-[#e5e5e5]">
              {email}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-on-surface-variant/70 dark:text-[#999999]">
          Mã có hiệu lực trong{' '}
          <span className="font-semibold text-on-surface-variant dark:text-[#b3b3b3]">
            10 phút
          </span>
          . Kiểm tra hộp thư đến (hoặc thư mục Spam).
        </p>
      </div>

      {success && (
        <div className="rounded-md border border-tertiary/30 bg-tertiary/5 p-3 text-center text-sm font-bold text-tertiary dark:border-green-700 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={18} className="mr-1.5 inline-block -mt-0.5" />
          {success}
        </div>
      )}
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
              Gửi lại sau{' '}
              <span className="tabular-nums text-primary">{resendCountdown}s</span>
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
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
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

// ─── SUB-STEP 2: Nhập mật khẩu mới ───────────────────────────────────────────
const PasswordStep = ({ email, otpCode, onBack }) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await forgotPasswordVerifyRequest({
        email,
        otpCode,
        newPassword,
      });
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' },
        });
      }, 5000);
    } catch (err) {
      setError(err?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Badge OTP đã xác nhận */}
      <div className="flex items-center gap-2 rounded-md border border-tertiary/30 bg-tertiary/5 px-3 py-2 dark:border-green-800 dark:bg-green-900/10">
        <CheckCircle2 size={16} className="flex-shrink-0 text-tertiary dark:text-green-500" />
        <span className="text-xs font-semibold text-on-surface-variant dark:text-[#999999]">
          Mã OTP đã xác nhận —{' '}
          <span className="font-bold text-on-surface dark:text-[#e5e5e5]">{email}</span>
        </span>
        <button
          type="button"
          onClick={onBack}
          className="ml-auto text-xs font-semibold text-primary hover:underline"
        >
          Đổi
        </button>
      </div>

      {success && (
        <div className="rounded-md border border-tertiary/30 bg-tertiary/5 p-3 text-center text-sm font-bold text-tertiary dark:border-green-700 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={18} className="mr-1.5 inline-block -mt-0.5" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error">
          {error}
        </div>
      )}

      {/* Mật khẩu mới */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]"
            size={18}
          />
          <input
            required
            autoFocus
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError('');
            }}
            disabled={loading}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-10 text-sm font-semibold text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
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
        <label className="text-xs font-bold uppercase text-on-surface-variant dark:text-[#999999]">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-[#808080]"
            size={18}
          />
          <input
            required
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            disabled={loading}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-sm font-semibold text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Đang xử lý...
            </>
          ) : (
            'ĐẶT LẠI MẬT KHẨU'
          )}
        </button>
      </div>
    </form>
  );
};

// ─── COMPONENT CHA: điều phối 2 sub-step ──────────────────────────────────────
const ForgotPasswordStep2Verify = ({ email, onBack }) => {
  const [subStep, setSubStep] = useState('otp');
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const handleOtpConfirmed = (otp) => {
    setVerifiedOtp(otp);
    setSubStep('password');
  };

  const handleBackToOtp = () => {
    setSubStep('otp');
    setVerifiedOtp('');
  };

  return (
    <>
      {subStep === 'otp' ? (
        <OtpStep email={email} onOtpConfirmed={handleOtpConfirmed} onBack={onBack} />
      ) : (
        <PasswordStep email={email} otpCode={verifiedOtp} onBack={handleBackToOtp} />
      )}
    </>
  );
};

export default ForgotPasswordStep2Verify;
