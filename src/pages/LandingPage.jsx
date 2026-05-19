import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, ShieldCheck, Zap, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const FEATURES = [
    {
      title: 'Quản lý Tổng Kho',
      description: 'Kiểm soát xuất nhập tồn, tự động cảnh báo hết hàng theo thời gian thực.',
      icon: Factory,
    },
    {
      title: 'POS Bán Hàng Nhanh',
      description: 'Giao diện tính tiền tối ưu tốc độ, hoạt động mượt mà ngay cả khi mất mạng.',
      icon: Zap,
    },
    {
      title: 'Mạng lưới B2B',
      description: 'Kết nối trực tiếp nhà cung cấp và đại lý qua diễn đàn doanh nghiệp nội bộ.',
      icon: TrendingUp,
    },
    {
      title: 'Bảo mật Phân quyền',
      description: 'Hệ thống phân quyền chi tiết từ quản lý kho đến nhân viên thu ngân.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-outline-variant/20 bg-surface/70 px-6 backdrop-blur-lg md:px-12">
        <div className="flex items-center gap-2.5 text-primary transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Factory size={22} />
          </div>
          <span className="text-xl font-black tracking-tight text-on-surface">AI RETAIL ERP</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-variant/50 hover:text-primary"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate('/register')}
            className="hidden rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-on-primary-fixed hover:shadow-md active:translate-y-0 sm:block"
          >
            Dùng thử miễn phí
          </button>
        </div>
      </header>

      <main className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-32">
        <div className="absolute left-1/2 top-10 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"></div>

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
          <Sparkles size={16} className="animate-pulse" />
          Phiên bản MVP
        </div>

        <h1 className="mb-6 max-w-4xl text-4xl font-black leading-tight text-on-surface md:text-[3.5rem] md:leading-[1.15]">
          Nền tảng Quản trị Chuỗi Bán lẻ <br />
          <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Toàn diện & Thông minh
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-on-surface-variant md:text-xl md:leading-relaxed">
          Tối ưu hóa quy trình từ tổng kho đến điểm bán. Quản lý bán hàng, đối tác B2B và tồn kho dễ
          dàng chỉ trên một phần mềm duy nhất.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
          <button
            onClick={() => navigate('/register')}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:bg-on-primary-fixed hover:shadow-xl active:translate-y-0"
          >
            Bắt đầu sử dụng{' '}
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center rounded-2xl border-2 border-outline-variant/40 bg-surface/50 px-8 py-4 text-base font-semibold text-on-surface backdrop-blur-sm transition-all duration-300 hover:border-primary hover:text-primary active:scale-[0.98]"
          >
            Đăng nhập hệ thống
          </button>
        </div>
      </main>

      <section className="bg-surface px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tight text-on-surface md:text-4xl">
              Giải pháp cho mọi nghiệp vụ
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant">
              Tất cả công cụ bạn cần để vận hành doanh nghiệp hiệu quả.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-3xl border border-outline-variant/20 bg-background p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
                  <feature.icon size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-on-surface">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-variant/20 bg-background py-10 text-center text-sm font-medium text-outline">
        <div className="flex items-center justify-center gap-2 opacity-80">
          <Factory size={16} />
          <span>© 2026 AI RETAIL ERP. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
