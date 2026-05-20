import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Factory,
  Phone,
  Lock,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../shared/hooks/useAuth';
import { registerStartRequest, registerVerifyRequest } from '../../services/authService';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-xl">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
              <Factory size={28} />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">
              {step === 1 ? 'Tạo tài khoản mới' : 'Xác thực số điện thoại'}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {step === 1 ? (
                <>
                  Tham gia <span className="font-semibold text-primary">AI RETAIL ERP</span>
                </>
              ) : (
                <>
                  Mã OTP đã được gửi đến số{' '}
                  <span className="font-semibold text-primary">{formData.PhoneNumber}</span>
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-error-container p-3 text-center text-sm font-medium text-on-error-container">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStartRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface" htmlFor="PhoneNumber">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <Phone size={18} />
                  </div>
                  <input
                    id="PhoneNumber"
                    name="PhoneNumber"
                    type="tel"
                    required
                    placeholder=""
                    value={formData.PhoneNumber}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface" htmlFor="BranchName">
                  Tên chi nhánh cửa hàng
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <Store size={18} />
                  </div>
                  <input
                    id="BranchName"
                    name="BranchName"
                    type="text"
                    required
                    placeholder=""
                    value={formData.BranchName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface" htmlFor="Password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <Lock size={18} />
                  </div>
                  <input
                    id="Password"
                    name="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder=""
                    value={formData.Password}
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface" htmlFor="ConfirmPassword">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <Lock size={18} />
                  </div>
                  <input
                    id="ConfirmPassword"
                    name="ConfirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder=""
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-10 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold tracking-btn text-on-primary transition-all hover:bg-on-primary-fixed hover:shadow-md active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyRegister} className="space-y-6">
              {devOtp && (
                <div
                  onClick={handleAutoFillOtp}
                  className="group mb-6 cursor-pointer rounded-xl border border-primary/30 bg-primary/5 p-3 text-center transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm"
                >
                  <div className="flex h-5 items-center justify-center">
                    <span className="text-xs text-on-surface-variant transition-opacity group-hover:hidden">
                      Mã OTP
                    </span>
                    <span className="hidden items-center gap-1 text-xs font-medium text-primary group-hover:flex">
                      <CheckCircle2 size={14} /> Click để tự động điền
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.25em] text-primary">
                    {devOtp}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-center text-sm font-medium text-on-surface">
                  Nhập mã 6 số
                </label>

                <div className="relative mx-auto flex max-w-[280px] justify-between gap-2">
                  {otpArray.map((digit, index) => (
                    <div
                      key={index}
                      className={`flex h-12 w-10 items-center justify-center rounded-lg border-2 text-xl font-bold transition-colors sm:h-14 sm:w-11 ${
                        digit
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant bg-surface-container-lowest text-outline'
                      } ${
                        formData.OtpCode.length === index
                          ? 'border-primary shadow-[0_0_0_2px_rgba(var(--color-primary),0.2)]'
                          : ''
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
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>
              </div>

              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <span className="text-on-surface-variant">
                    Gửi lại mã sau <span className="font-bold text-primary">{countdown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleStartRegister(e, true)}
                    disabled={loading}
                    className="mx-auto flex items-center justify-center gap-1 font-medium text-primary hover:underline focus:outline-none"
                  >
                    <RefreshCw size={14} /> Gửi lại mã OTP
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || formData.OtpCode.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold tracking-btn text-on-primary transition-all hover:bg-on-primary-fixed hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {loading ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC & ĐĂNG KÝ'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep(1);
                    setDevOtp('');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-variant/50 disabled:opacity-50"
                >
                  <ArrowLeft size={16} /> Quay lại chỉnh sửa thông tin
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm text-on-surface-variant">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
