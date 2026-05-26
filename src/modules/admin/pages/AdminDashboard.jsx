import React from 'react';
import Icon from '../../../shared/components/Icon';

const AdminDashboard = () => {
  return (
    <div className="space-y-4">
      {/* TIÊU ĐỀ KHỐI LỚN */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5">
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            Hệ thống phân tích chỉ số doanh thu &amp; Vận hành
          </h1>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-tight text-slate-400">
            CORE TERMINAL NODE: 2026.05.26_STABLE
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-[4px] bg-[#0F172A] px-3.5 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
          <Icon name="download" size={12} /> XUẤT FILE DATA SHEET (CSV)
        </button>
      </div>

      {/* LƯỚI CARD 4 CỘT - ĐÃ TĂNG CỠ CHỮ CHỐNG MỎI MẮT */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div>
            <div className="font-sans text-xs font-bold uppercase tracking-wide text-slate-400">
              01. Tenants hoạt động
            </div>
            <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
              1,402
            </div>
          </div>
          <div className="mt-3 w-fit rounded-[2px] border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
            +12 phân hệ đăng ký mới
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div>
            <div className="font-sans text-xs font-bold uppercase tracking-wide text-slate-400">
              02. Doanh thu thuê bao
            </div>
            <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
              850.5M <span className="text-xs font-bold text-slate-400">VND</span>
            </div>
          </div>
          <div className="mt-3 w-fit rounded-[2px] border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
            Mục tiêu đạt: 92% Tiến độ
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div>
            <div className="font-sans text-xs font-bold uppercase tracking-wide text-slate-400">
              03. Hoa hồng sàn B2B (1%)
            </div>
            <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
              124.0M <span className="text-xs font-bold text-slate-400">VND</span>
            </div>
          </div>
          <div className="mt-3 w-fit rounded-[2px] border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">
            Khớp tiền 4,200 vận đơn sỉ
          </div>
        </div>

        {/* Card 4 - Tông đỏ gạch sẫm đanh thép không chói mắt */}
        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-l-[4px] border-slate-300 border-l-[#9A1616] bg-white p-4 shadow-sm">
          <div>
            <div className="font-sans text-xs font-bold uppercase tracking-wide text-[#9A1616]">
              04. Cảnh báo nợ cước
            </div>
            <div className="mt-1 font-mono text-2xl font-black tracking-tight text-[#9A1616]">
              03 <span className="text-xs font-bold text-slate-400">Shop</span>
            </div>
          </div>
          <div className="mt-3 w-fit rounded-[2px] border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-[#9A1616]">
            Hạn đình chỉ hệ thống: 3 ngày
          </div>
        </div>
      </div>

      {/* LƯỚI ĐỒ THỊ VÀ TERMINAL LOG NHẬT KÝ ĐẬM CHẤT THỰC DỤNG */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Khối Đồ thị */}
        <section className="flex min-h-[360px] flex-col rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm xl:col-span-2">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-slate-700">
              [CHART_LOG_01] BIỂU ĐỒ DOANH THU THUÊ BAO NĂM 2026
            </h3>
            <span className="font-mono text-xs font-bold text-[#004785]">AI_PREDICT_SERVER</span>
          </div>

          <div className="flex flex-1 items-center justify-center rounded-[2px] border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-1.5 text-center">
              <span className="block text-slate-300">
                <Icon name="bar_chart_3" size={24} />
              </span>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
                [ Khu vực kết xuất luồng thư viện biểu đồ cột Chart.js ]
              </p>
            </div>
          </div>
        </section>

        {/* Khối Nhật ký Hệ thống Terminal - Tối ưu màu nền Slate đậm dễ chịu cho mắt */}
        <section className="flex min-h-[360px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-slate-700">
              [SYS_LOG_TERMINAL] REAL-TIME EVENTS
            </h3>
          </div>

          {/* Nền xanh xám đen sẫm Slate dịu nhẹ cho mắt khi đọc văn bản code */}
          <div className="flex-1 space-y-2.5 overflow-y-auto rounded-[2px] bg-[#1E293B] p-3 font-mono text-[11px] leading-normal text-slate-200 shadow-inner">
            <p className="text-emerald-400">
              [18:12:05] [INFO] Connection established from Tenant ID: T_78942
            </p>
            <p className="text-slate-300">
              [18:14:22] [SYNC] AI OCR Model synchronized successfully with Master Node.
            </p>
            <p className="text-amber-400">
              [18:15:01] [WARN] Slow database response query detected on Billing table.
            </p>
            <p className="text-slate-300">
              [18:15:30] [INFO] Generated auto-invoice broadcast for 12 expired subscription
              tenants.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 font-mono text-xs font-bold text-slate-400">
            <span>Status: Active</span>
            <span className="text-emerald-600">Response: 14ms</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
