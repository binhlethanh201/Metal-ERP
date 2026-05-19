import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-textAdmin">Doanh thu & Tổng quan</h1>
          <p className="mt-1 text-sm text-placeholder">
            Số liệu hoạt động thời gian thực của hệ thống
          </p>
        </div>
        <button className="rounded-admin bg-admin px-6 py-2.5 text-sm font-bold tracking-btn text-white transition-all hover:bg-black active:scale-95">
          XUẤT BÁO CÁO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-admin border border-borderLight bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-placeholder">
            CỬA HÀNG ACTIVE
          </h3>
          <div className="text-3xl font-black text-textAdmin">1,402</div>
          <div className="mt-2 text-xs font-semibold text-[#2D6A4F]">+12 shop đăng ký mới</div>
        </div>

        <div className="rounded-admin border border-borderLight bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-placeholder">
            GÓI CƯỚC (THÁNG)
          </h3>
          <div className="text-3xl font-black text-textAdmin">850.5M</div>
          <div className="mt-2 text-xs font-semibold text-[#2D6A4F]">+5.2% so với tháng trước</div>
        </div>

        <div className="rounded-admin border border-borderLight bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-placeholder">
            PHÍ GIAO DỊCH B2B
          </h3>
          <div className="text-3xl font-black text-textAdmin">124.0M</div>
          <div className="mt-2 text-xs font-semibold text-[#2D6A4F]">Từ 4,200 giao dịch</div>
        </div>

        <div className="rounded-admin border border-l-[3px] border-borderLight border-l-[#CC0000] bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-placeholder">
            CẢNH BÁO HỆ THỐNG
          </h3>
          <div className="text-3xl font-black text-[#CC0000]">3</div>
          <div className="mt-2 text-xs font-semibold text-[#CC0000]">Shop nợ phí dịch vụ</div>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col rounded-admin border border-borderLight bg-white p-6 shadow-sm">
        <h3 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-placeholder">
          TĂNG TRƯỞNG DOANH THU (2026)
        </h3>
        <div className="flex flex-1 items-center justify-center border-2 border-dashed border-borderLight bg-[#FAFAFA]">
          <span className="text-sm font-semibold text-placeholder">
            [Khu vực render Biểu đồ Cột]
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
