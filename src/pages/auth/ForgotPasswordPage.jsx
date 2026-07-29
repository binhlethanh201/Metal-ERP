import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../shared/components/Logo';
import ForgotPasswordStep1Email from './components/ForgotPasswordStep1Email';
import ForgotPasswordStep2Verify from './components/ForgotPasswordStep2Verify';
import loginBg from '../../assets/images/auth-bg.png';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleStep1Success = (email) => {
    setEmail(email);
    setStep(2);
  };

  const handleGoBack = () => {
    setStep(1);
    setEmail('');
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-container-lowest dark:bg-[#0a0a0a]">
      {/* CỘT TRÁI - KHU VỰC FORM */}
      <div className="flex w-full flex-col justify-center px-8 py-10 lg:w-1/2 lg:px-24">
        <div className="mb-6">
          <Logo className="mb-8" />
          <h1 className="text-3xl font-black tracking-tight text-on-surface dark:text-[#e5e5e5]">
            {step === 1 ? 'Quên mật khẩu.' : 'Đặt lại mật khẩu.'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-[#999999]">
            {step === 1 ? (
              'Nhập email doanh nghiệp để nhận mã xác thực.'
            ) : (
              <>
                Mã xác thực đã được gửi đến{' '}
                <span className="font-bold text-primary">{email}</span>
              </>
            )}
          </p>
        </div>

        {/* RENDER DYNAMIC COMPONENT DỰA VÀO STEP */}
        {step === 1 ? (
          <ForgotPasswordStep1Email onNextStep={handleStep1Success} />
        ) : (
          <ForgotPasswordStep2Verify email={email} onBack={handleGoBack} />
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-sm font-medium text-on-surface-variant dark:text-[#999999]">
            Nhớ mật khẩu?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        )}
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
            M.E.P Intelligent Retail Management System
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 bg-white/40" />
          <p className="text-base font-medium leading-relaxed text-white/95">
            Hệ thống Quản lý Bán hàng Thông minh ngành Kim khí & Thiết bị xây dựng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
