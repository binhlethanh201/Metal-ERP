import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 font-sans md:justify-start md:px-24">
      <div className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 select-none text-[40vw] font-black leading-none text-outline/20 md:right-10 md:text-[30vw]">
        404
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
          <AlertTriangle size={40} strokeWidth={1.5} />
        </div>

        <h1 className="mb-4 text-4xl font-black tracking-tight text-on-surface md:text-5xl lg:text-6xl">
          Không tìm thấy <br className="hidden sm:block" /> trang yêu cầu.
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-on-surface-variant md:text-xl">
          Đường dẫn bạn truy cập không tồn tại hoặc tính năng này đang được đội ngũ DEV phát triển.
          Vui lòng kiểm tra lại địa chỉ URL.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-outline-variant/50 bg-transparent px-8 py-4 text-sm font-bold text-on-surface transition-all duration-300 hover:border-primary hover:text-primary active:scale-95"
          >
            <ArrowLeft size={18} />
            Quay lại trang trước
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold tracking-btn text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:bg-on-primary-fixed hover:shadow-xl active:translate-y-0"
          >
            <Home size={18} />
            Về màn hình chính
          </button>
        </div>

        <div className="mt-16 flex items-center gap-3">
          <span className="flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-outline-variant"></span>
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-outline">
            Mã lỗi: ERR_ROUTE_NOT_FOUND
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
