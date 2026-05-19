import React from 'react';
import { CreditCard, ArrowUpRight, Clock, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { MOCK_SUBSCRIPTIONS, MOCK_TRANSACTION_FEES } from '../data/mockData';

const Billing = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase text-textAdmin">
            Quản lý Doanh thu & Gói cước
          </h1>
          <p className="mt-1 text-sm text-placeholder">
            Theo dõi thuê bao phần mềm và doanh thu hoa hồng từ sàn B2B
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-admin bg-admin px-6 py-2.5 text-sm font-bold tracking-btn text-white transition-all hover:bg-black">
          <Download size={18} /> XUẤT BÁO CÁO TÀI CHÍNH
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-admin border border-borderLight bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-placeholder">
              Tổng doanh thu (Tháng 5)
            </span>
            <CreditCard size={20} className="text-admin" />
          </div>
          <div className="text-3xl font-black text-textAdmin">
            850.5M <span className="text-sm font-medium text-placeholder">VND</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-[#2D6A4F]">
            <ArrowUpRight size={14} /> +12.5% so với tháng trước
          </div>
        </div>

        <div className="rounded-admin border border-borderLight bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-placeholder">
              Phí giao dịch B2B
            </span>
            <ArrowUpRight size={20} className="text-[#2D6A4F]" />
          </div>
          <div className="text-3xl font-black text-textAdmin">
            124.0M <span className="text-sm font-medium text-placeholder">VND</span>
          </div>
          <div className="mt-2 text-xs font-bold text-placeholder">Từ 4,200 giao dịch chốt đơn</div>
        </div>

        <div className="rounded-admin border border-l-[3px] border-borderLight border-l-[#CC0000] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-placeholder">
              Thuê bao sắp hết hạn
            </span>
            <Clock size={20} className="text-[#CC0000]" />
          </div>
          <div className="text-3xl font-black text-[#CC0000]">12</div>
          <div className="mt-2 text-xs font-bold text-[#CC0000]">
            Cần gửi thông báo nhắc gia hạn
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-admin border border-borderLight bg-white">
        <div className="border-b border-borderLight bg-[#FAFAFA] px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-textAdmin">
            Theo dõi Gói cước (Subscriptions)
          </h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-borderLight bg-[#FAFAFA]">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Cửa hàng
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Gói dịch vụ
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Giá trị gói
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Ngày hết hạn
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SUBSCRIPTIONS.map((sub) => (
              <tr key={sub.id} className="border-b border-borderLight hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 font-bold text-textAdmin">{sub.tenantName}</td>
                <td className="px-6 py-4 text-xs font-semibold">{sub.plan}</td>
                <td className="px-6 py-4 font-bold text-textAdmin">{sub.amount}</td>
                <td className="px-6 py-4 text-xs font-medium text-placeholder">{sub.expiryDate}</td>
                <td className="px-6 py-4">
                  {sub.status === 'active' && (
                    <span className="inline-flex rounded-admin bg-[#2D6A4F]/10 px-2 py-1 text-[10px] font-bold text-[#2D6A4F]">
                      ĐANG HOẠT ĐỘNG
                    </span>
                  )}
                  {sub.status === 'warning' && (
                    <span className="inline-flex rounded-admin bg-[#FBC02D]/20 px-2 py-1 text-[10px] font-bold text-[#8f4e00]">
                      SẮP HẾT HẠN
                    </span>
                  )}
                  {sub.status === 'expired' && (
                    <span className="inline-flex rounded-admin bg-[#CC0000]/10 px-2 py-1 text-[10px] font-bold text-[#CC0000]">
                      HẾT HẠN
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-black uppercase text-admin hover:underline">
                    NHẮC GIA HẠN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-admin border border-borderLight bg-white">
        <div className="border-b border-borderLight bg-[#FAFAFA] px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-textAdmin">
            Phí hoa hồng giao dịch B2B (1%)
          </h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-borderLight bg-[#FAFAFA]">
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Mã GD
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Ngày chốt đơn
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Hai bên giao dịch
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Giá trị đơn
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Hoa hồng thu
              </th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-placeholder">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTION_FEES.map((fee) => (
              <tr key={fee.id} className="border-b border-borderLight hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 text-xs font-bold text-placeholder">{fee.id}</td>
                <td className="px-6 py-4 text-xs font-medium">{fee.date}</td>
                <td className="px-6 py-4 font-semibold text-textAdmin">{fee.parties}</td>
                <td className="px-6 py-4 font-bold text-textAdmin">{fee.value}</td>
                <td className="px-6 py-4 font-black text-[#2D6A4F]">{fee.fee}</td>
                <td className="px-6 py-4">
                  {fee.status === 'collected' ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-[#2D6A4F]">
                      <CheckCircle2 size={12} /> ĐÃ THU PHÍ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-[#FBC02D]">
                      <AlertCircle size={12} /> ĐANG XỬ LÝ
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Billing;
