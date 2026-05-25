import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Zap, TrendingUp, Factory, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../shared/components/Logo';

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
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-outline-variant/20 bg-surface/75 px-6 backdrop-blur-lg md:px-12">
        <Link to="/" className="transition-transform hover:scale-[1.02]">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="rounded-customer px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-on-surface-variant transition-all hover:bg-surface-variant/50 hover:text-primary"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate('/register')}
            className="hidden rounded-customer bg-primary px-5 py-2.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-sm transition-all hover:bg-black active:scale-[0.98] sm:block"
          >
            Dùng thử miễn phí
          </button>
        </div>
      </header>

      <main className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-32">
        <div className="absolute left-1/2 top-10 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
        <div className="mb-8 inline-flex items-center gap-2 rounded-customer border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm backdrop-blur-sm">
          <Sparkles size={14} className="animate-pulse" />
          Phiên bản ứng dụng 2026
        </div>

        <h1 className="mb-6 max-w-4xl text-4xl font-black leading-tight tracking-tighter text-on-surface md:text-[3.5rem] md:leading-[1.15]">
          Nền tảng Quản trị Chuỗi Bán lẻ <br />
          <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Toàn diện & Thông minh
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-base font-medium leading-relaxed text-placeholder md:text-lg">
          Tối ưu hóa quy trình kinh doanh đặc thù ngành Kim khí, Điện nước từ tổng kho đến các điểm
          bán. Quản lý đại lý, đối tác B2B và dòng tiền dễ dàng trên một hệ thống duy nhất.
        </p>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-4">
          <button
            onClick={() => navigate('/register')}
            className="group flex items-center justify-center gap-2 rounded-customer bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-black active:scale-[0.98]"
          >
            Dùng thử miễn phí{' '}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center rounded-customer border border-borderLight bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-textMain transition-all duration-300 hover:border-primary hover:text-primary active:scale-[0.98]"
          >
            Đăng nhập hệ thống
          </button>
        </div>
      </main>

      <section className="border-t border-outline-variant/20 bg-surface px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tighter text-on-surface md:text-4xl">
              GIẢI PHÁP CHO MỌI NGHIỆP VỤ CHUYÊN SÂU
            </h2>
            <div className="mx-auto mt-4 h-1 w-12 bg-primary/40" />
            <p className="mt-4 text-sm font-medium text-placeholder">
              Tích hợp đầy đủ công cụ quản trị cốt lõi giúp doanh nghiệp vận hành tinh gọn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-customer border border-borderLight bg-white p-8 transition-all duration-300 hover:border-primary hover:shadow-md"
              >
                <div className="mb-6 inline-flex rounded-customer bg-primary/5 p-3.5 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-3 text-lg font-black tracking-tight text-textMain">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-placeholder">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-borderLight bg-white py-12 text-center text-xs font-bold uppercase tracking-widest text-placeholder">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 md:flex-row md:justify-between md:px-12">
          <div className="opacity-80">
            <Logo />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
            © 2026 M.E.P RETAIL SYSTEM. ALL RIGHTS RESERVED.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
