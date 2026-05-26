import React from 'react';
import Icon from '../../../shared/components/Icon';
import { MOCK_SUBSCRIPTIONS, MOCK_TRANSACTION_FEES } from '../data/mockData';

const Billing = () => {
  return (
    <div className="space-y-4">
      {/* BANNER HEADER TIÊU ĐỀ */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5">
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            Quản lý Doanh thu &amp; Phân phối Gói cước
          </h1>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-tight text-slate-500">
            Giao dịch tài chính &amp; Kiểm soát thuê bao chuỗi cung ứng
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-[4px] bg-[#0F172A] px-3.5 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95">
          <Icon name="download" size={12} /> EXPORT FINANCIAL SHEET (CSV)
        </button>
      </div>

      {/* LƯỚI CARD 3 CỘT THÔNG SỐ TÀI CHÍNH LỚN */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold uppercase tracking-wide text-slate-400">
              Tổng doanh thu (Tháng này)
            </span>
            <span className="text-slate-400">
              <Icon name="credit_card" size={14} />
            </span>
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
            850.5M <span className="font-sans text-xs font-bold text-slate-400">VND</span>
          </div>
          <div className="mt-2 flex w-fit items-center gap-0.5 rounded-[2px] border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
            <Icon name="arrow_up_right" size={10} /> +12.5% so với kỳ trước
          </div>
        </div>

        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold uppercase tracking-wide text-slate-400">
              Phí commission sàn B2B (1%)
            </span>
            <span className="text-emerald-600">
              <Icon name="arrow_up_right" size={14} />
            </span>
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
            124.0M <span className="font-sans text-xs font-bold text-slate-400">VND</span>
          </div>
          <div className="mt-2 w-fit rounded-[2px] border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-500">
            Kết xuất từ luồng đối tác giao dịch chốt đơn
          </div>
        </div>

        <div className="flex min-h-[110px] flex-col justify-between rounded-[4px] border border-l-[4px] border-slate-300 border-l-[#9A1616] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold uppercase tracking-wide text-[#9A1616]">
              Thuê bao cảnh báo gia hạn
            </span>
            <span className="text-[#9A1616]">
              <Icon name="clock" size={14} />
            </span>
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-[#9A1616]">12</div>
          <div className="mt-2 w-fit rounded-[2px] border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-bold text-[#9A1616]">
            Hệ thống chuẩn bị kích hoạt lệnh nhắc tự động
          </div>
        </div>
      </div>

      {/* BẢNG THUÊ BAO GÓI CƯỚC - PHẲNG, VIỀN ĐANH, ĐỌC RÕ SỐ LIỆU */}
      <section className="overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <h2 className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">
            [DATA_GRID_01] KHẢO SÁT CHI TIẾT THUÊ BAO (SUBSCRIPTIONS)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50/50 font-mono font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Cửa hàng (Tenant)</th>
                <th className="px-4 py-2.5">Gói dịch vụ</th>
                <th className="px-4 py-2.5">Giá trị định mức</th>
                <th className="px-4 py-2.5">Hạn kỳ thanh toán</th>
                <th className="px-4 py-2.5">Trạng thái vận hành</th>
                <th className="px-4 py-2.5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
              {MOCK_SUBSCRIPTIONS.map((sub) => (
                <tr key={sub.id} className="transition-colors hover:bg-slate-50/65">
                  <td className="px-4 py-3 font-bold text-slate-900">{sub.tenantName}</td>
                  <td className="px-4 py-3 font-mono">{sub.plan}</td>
                  <td className="px-4 py-3 font-mono text-slate-900">{sub.amount}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{sub.expiryDate}</td>
                  <td className="px-4 py-3">
                    {sub.status === 'active' && (
                      <span className="inline-flex rounded-[2px] border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        HOẠT ĐỘNG
                      </span>
                    )}
                    {sub.status === 'warning' && (
                      <span className="inline-flex rounded-[2px] border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        SẮP HẾT HẠN
                      </span>
                    )}
                    {sub.status === 'expired' && (
                      <span className="inline-flex rounded-[2px] border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-[#9A1616]">
                        ĐÃ HẾT HẠN
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-black uppercase text-[#004785] hover:text-slate-900 hover:underline"
                    >
                      GỬI NHẮC GIA HẠN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* BẢNG HOA HỒNG SÀN B2B */}
      <section className="overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <h2 className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">
            [DATA_GRID_02] KHẤU TRỪ HOA HỒNG GIAO DỊCH SÀN B2B (ĐỊNH MỨC 1%)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50/50 font-mono font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Mã log GD</th>
                <th className="px-4 py-2.5">Thời gian chốt</th>
                <th className="px-4 py-2.5">Cửa hàng khớp lệnh (Mua / Bán)</th>
                <th className="px-4 py-2.5">Giá trị đơn hàng</th>
                <th className="px-4 py-2.5">Hoa hồng thực thu</th>
                <th className="px-4 py-2.5">Trạng thái hạch toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
              {MOCK_TRANSACTION_FEES.map((fee) => (
                <tr key={fee.id} className="transition-colors hover:bg-slate-50/65">
                  <td className="px-4 py-3 font-mono text-slate-400">{fee.id}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{fee.date}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-slate-900">{fee.parties}</td>
                  <td className="px-4 py-3 font-mono text-slate-900">{fee.value}</td>
                  <td className="px-4 py-3 font-mono font-black text-emerald-700">{fee.fee}</td>
                  <td className="px-4 py-3">
                    {fee.status === 'collected' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <Icon name="check_circle_2" size={13} /> ĐÃ HOÀN TẤT TRỪ PHÍ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Icon name="alert_circle" size={13} /> ĐANG ĐỒNG BỘ TIỀN
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Billing;
