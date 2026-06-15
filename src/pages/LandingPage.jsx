import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Warehouse,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Network,
  AlertCircle,
} from 'lucide-react';
import Logo from '../shared/components/Logo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSmoothNavigate = (targetPath) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(targetPath);
    }, 1000);
  };

  const VALUES = [
    {
      title: 'Tự động hóa Tổng kho',
      description:
        'Kiểm soát chặt chẽ tỷ lệ hao hụt vật tư, định vị vị trí phụ kiện phụ tùng chính xác và tự động phát cảnh báo cạn kho.',
      icon: Warehouse,
    },
    {
      title: 'POS Bán Hàng Điểm Đơn',
      description:
        'Giao diện quét mã vạch và tính tiền tối ưu hóa tốc độ luồng dữ liệu, vận hành ổn định ngay cả khi mất kết nối mạng.',
      icon: Zap,
    },
    {
      title: 'Dự báo Nhu cầu bằng AI',
      description:
        'Tích hợp mô hình dữ liệu thông minh phân tích chu kỳ bán hàng để dự đoán xu hướng biến động giá và sức mua vật tư.',
      icon: BarChart3,
    },
    {
      title: 'Mạng lưới Chuỗi Cung ứng',
      description:
        'Kết nối trực tiếp, minh bạch giữa các đại lý bán lẻ và xưởng sản xuất, nhà phân phối kim khí vật liệu lớn trên thị trường.',
      icon: Network,
    },
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#FAFAFA]">
      <div
        className="flex h-full w-[200vw] transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: '1000ms',
          transform: isTransitioning ? 'translateX(-100vw)' : 'translateX(0)',
        }}
      >
        {/* ========== TRANG 1: NỘI DUNG CHÍNH ========== */}
        <div className="flex h-full w-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden">
          {/* HEADER */}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-6 shadow-sm backdrop-blur-md md:px-12">
            <div
              className="cursor-pointer transition-transform active:scale-95"
              onClick={() => handleSmoothNavigate('/')}
            >
              <Logo />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSmoothNavigate('/login')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                ĐĂNG NHẬP
              </button>
              <button
                type="button"
                onClick={() => handleSmoothNavigate('/register')}
                className="rounded-lg bg-[#004785] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-900/10 transition-all hover:bg-[#0F172A] active:scale-95"
              >
                Dùng thử miễn phí
              </button>
            </div>
          </header>

          {/* HERO SECTION */}
          <section className="relative shrink-0 overflow-hidden border-b border-slate-200 bg-white px-6 py-16 md:px-12 lg:py-24">
            <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="space-y-6 text-left lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#004785] shadow-sm">
                  <Sparkles size={14} className="fill-amber-500 text-amber-500" />
                  Phiên bản nền tảng quản trị thông minh 2026
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl md:leading-[1.12]">
                  Quản trị chuỗi cung ứng{' '}
                  <span className="bg-gradient-to-r from-[#004785] to-[#1E293B] bg-clip-text text-transparent">
                    Vật liệu & Kim khí điện nước
                  </span>
                </h1>

                <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-500 md:text-base">
                  Giải quyết triệt để bài toán hao hụt vật tư tại kho và kiểm soát chặt chẽ dòng
                  tiền điểm bán. <strong className="font-bold text-slate-800">MetalERP</strong> tự
                  động hóa toàn diện quy trình kinh doanh từ điểm bán POS mượt mà đến hệ thống tối
                  ưu hóa danh mục tồn kho dựa trên dữ liệu trực quan.
                </p>

                <div className="flex w-full flex-col gap-3 pt-2 text-xs font-bold sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleSmoothNavigate('/register')}
                    className="group flex items-center justify-center gap-1.5 rounded-lg bg-[#004785] px-8 py-3.5 font-bold uppercase tracking-wider text-white shadow-md shadow-blue-900/10 transition-all hover:bg-black active:scale-95"
                  >
                    <span>ĐĂNG KÝ SỬ DỤNG MIỄN PHÍ</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSmoothNavigate('/login')}
                    className="flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-95"
                  >
                    ĐĂNG NHẬP NGAY
                  </button>
                </div>
              </div>

              {/* HERO VISUAL */}
              <div className="hidden w-full lg:col-span-6 lg:block">
                <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-8 shadow-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
                  <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl transition-transform duration-1000 group-hover:translate-x-4" />
                  <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-[#004785]/5 blur-3xl" />

                  <div className="relative z-10 flex h-full w-full flex-col justify-between rounded-lg border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                      <span className="h-2 w-16 rounded bg-slate-200" />
                    </div>
                    <div className="flex flex-1 items-end gap-3 px-4 py-6">
                      <div className="h-[40%] w-full rounded bg-slate-100 transition-all duration-300 group-hover:h-[55%] group-hover:bg-[#004785]/20" />
                      <div className="h-[75%] w-full rounded bg-[#004785]/10 transition-all duration-300 group-hover:h-[85%] group-hover:bg-[#004785]/30" />
                      <div className="h-[50%] w-full rounded bg-[#004785] transition-all duration-300 group-hover:h-[65%]" />
                      <div className="h-[90%] w-full rounded bg-slate-100 transition-all duration-300 group-hover:h-[95%] group-hover:bg-[#004785]/20" />
                    </div>
                    <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* THẾ MẠNH NỀN TẢNG */}
          <section className="shrink-0 border-b border-slate-200 bg-white px-6 py-12 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                <div className="space-y-1.5 lg:col-span-4">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#004785]">
                    Thế mạnh nền tảng
                  </span>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                    Khác biệt của MetalERP
                  </h2>
                  <p className="text-xs font-medium leading-relaxed text-slate-400">
                    Tại sao các chủ doanh nghiệp lớn lại tin dùng MetalERP?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                    <span className="block text-[#9A1616]">
                      <AlertCircle size={16} />
                    </span>
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-900">
                      Vượt trội hơn phần mềm cũ
                    </h4>
                    <p className="text-xs font-medium leading-relaxed text-slate-500">
                      Khác biệt hoàn toàn với các công cụ quản lý sổ sách đơn thuần chỉ tập trung
                      ghi chép dữ liệu nội bộ tĩnh.
                    </p>
                  </div>
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                    <span className="block text-emerald-600">
                      <CheckCircle size={16} />
                    </span>
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-900">
                      Nhập kho tự động
                    </h4>
                    <p className="text-xs font-medium leading-relaxed text-slate-500">
                      Tích hợp công nghệ AI OCR tự động quét, nhận diện và bóc tách dữ liệu chứng từ
                      nhập kho vật tư từ ảnh chụp điện thoại.
                    </p>
                  </div>
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                    <span className="block text-[#004785]">
                      <ShieldCheck size={16} />
                    </span>
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-900">
                      Mạng lưới chuỗi liên kết
                    </h4>
                    <p className="text-xs font-medium leading-relaxed text-slate-500">
                      Tạo không gian chia sẻ thông số kỹ thuật, tương tác trực tiếp giữa xưởng đại
                      lý sỉ và cửa hàng bán lẻ điểm đơn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GIẢI PHÁP NGHIỆP VỤ */}
          <section className="shrink-0 bg-[#FAFAFA] px-6 py-16 md:px-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-left md:text-center">
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                  Giải pháp cho mọi nghiệp vụ kinh doanh chuyên sâu
                </h2>
                <div className="mt-2 h-1 w-10 bg-[#004785] md:mx-auto" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  [SYSTEM_INTEGRATION_INDEX] Đầy đủ cấu hình module lõi giúp doanh nghiệp vận hành
                  ổn định tinh gọn
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {VALUES.map((feature, idx) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-[#004785] hover:shadow-md"
                    >
                      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[#004785] transition-colors duration-150 group-hover:bg-[#004785] group-hover:text-white">
                        <IconComponent size={16} />
                      </div>
                      <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-800">
                        {idx + 1}. {feature.title}
                      </h3>
                      <p className="text-xs font-medium leading-relaxed text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="shrink-0 border-t border-slate-200 bg-white py-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 md:flex-row md:justify-between md:px-12">
              <div className="shrink-0 opacity-90">
                <Logo />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                &copy; 2026 M.E.P METAL_ERP SYSTEM. TO&Agrave;N QUYỀN BẢO HỘ PHẦN MỀM CHUỖI CUNG
                ỨNG.
              </span>
            </div>
          </footer>
        </div>

        {/* ========== TRANG 2: MÀN HÌNH CHUYỂN CẢNH ========== */}
        <div
          className="relative flex h-full w-screen shrink-0 flex-col items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #004785 50%, #0F172A 100%)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#3b82f6,transparent_50%)] opacity-20 mix-blend-screen" />

          <div className="relative z-10 flex flex-col items-center gap-3 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <span className="text-lg font-bold uppercase tracking-widest text-blue-200">
              ĐANG TẢI...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
