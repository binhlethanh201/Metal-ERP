/**
 * Component Side Panel hiển thị chi tiết đơn hàng.
 */
import React from 'react';
import { X, Printer, User, ClipboardList } from 'lucide-react';

const OrderDetailPanel = ({ order, onClose, showNotice }) => {
  const isOpen = !!order;

  // Nếu đóng, giữ nguyên container rỗng có độ rộng w-0 để bảo toàn hiệu ứng trượt mượt mà
  return (
    <div
      className={`font-be-vietnam-pro flex h-full shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-[#333333] dark:bg-[#0f0f0f] ${
        isOpen ? 'w-[400px] opacity-100' : 'w-0 border-l-0 opacity-0'
      }`}
    >
      {isOpen && (
        <div className="flex h-full w-[400px] flex-col bg-white dark:bg-[#0f0f0f]">
          {/* HEADER PANEL - PHẲNG, ĐỒNG TRỤC Y VỚI ĐỈNH BẢNG */}
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-[#F8FAFC] p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-black tracking-wide text-slate-900 dark:text-[#e5e5e5]">
                  {order.code}
                </h3>
                <span
                  className={`rounded-[2px] border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    order.paymentStatus === 'paid'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {order.paymentStatus === 'paid' ? 'Đã trả' : 'Nợ cước'}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] font-medium text-slate-400 dark:text-[#808080]">
                {order.date}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            >
              <X size={16} />
            </button>
          </header>

          {/* THÂN CUỘN CHỨA THÔNG TIN - TEXT ĐỒNG BỘ BE VIETNAM PRO */}
          <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-4 text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]">
            {/* 1. KHỐI THÔNG TIN KHÁCH HÀNG */}
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-[#F8FAFC]/60 p-3 dark:border-[#333333] dark:bg-[#1a1a1a]/30">
              <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#004785]">
                <User size={12} /> Thông tin đối tác giao dịch
              </h4>
              <div className="space-y-1.5 font-medium text-slate-600 dark:text-[#999999]">
                <div className="flex">
                  <span className="w-16 font-normal text-slate-400 dark:text-[#808080]">Tên khách:</span>
                  <span className="font-bold text-slate-900 dark:text-[#e5e5e5]">{order.customer}</span>
                </div>
                <div className="flex">
                  <span className="w-16 font-normal text-slate-400 dark:text-[#808080]">SĐT liên hệ:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-[#e5e5e5]">{order.phone}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-16 shrink-0 font-normal text-slate-400 dark:text-[#808080]">Địa chỉ:</span>
                  <span className="leading-normal text-slate-800 dark:text-[#e5e5e5]">{order.address}</span>
                </div>
              </div>
            </div>

            {/* 2. DANH SÁCH MẶT HÀNG KIM KHÍ */}
            <div className="space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#004785]">
                <ClipboardList size={12} /> Chi tiết danh mục ký nhận
              </h4>
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#333333]">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead className="border-b border-slate-200 bg-[#F8FAFC] font-bold uppercase tracking-wide text-slate-400 dark:border-[#333333] dark:bg-[#1a1a1a]/50 dark:text-[#808080]">
                    <tr>
                      <th className="p-2.5 font-semibold">Mặt hàng</th>
                      <th className="p-2.5 text-center font-semibold">SL</th>
                      <th className="p-2.5 text-right font-semibold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600 dark:divide-[#333333] dark:text-[#999999]">
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-[#272727]/60">
                      <td className="p-2.5 font-bold text-slate-800 dark:text-[#e5e5e5]">Thép tấm SS400 5mm</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900 dark:text-[#e5e5e5]">10</td>
                      <td className="p-2.5 text-right font-mono text-slate-900 dark:text-[#e5e5e5]">25.000.000</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-[#272727]/60">
                      <td className="p-2.5 font-bold text-slate-800">Ống thép mạ kẽm Ø34</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900">50</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">7.500.000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. TỔNG KẾT BẢNG CÂN ĐỐI TÀI CHÍNH */}
            <div className="space-y-2 border-t border-slate-200 pt-3.5 font-mono text-[11px] dark:border-[#333333]">
              <div className="flex justify-between font-sans font-medium text-slate-400 dark:text-[#808080]">
                <span>Tạm tính hệ thống:</span>
                <span className="font-bold text-slate-800 dark:text-[#e5e5e5]">{order.total} đ</span>
              </div>
              <div className="flex justify-between font-sans font-medium text-slate-400 dark:text-[#808080]">
                <span>Giảm giá %:</span>
                <span className="font-bold text-slate-800">3.756.500 đ</span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5 dark:border-[#333333]">
                <span className="font-sans text-xs font-black uppercase tracking-wide text-slate-900 dark:text-[#e5e5e5]">
                  Tổng tiền thực nhận:
                </span>
                <span className="text-base font-black tracking-tight text-[#004785]">
                  {order.total} đ
                </span>
              </div>
            </div>

            {/* 4. TIẾN TRÌNH LỊCH SỬ LOG VẾT ĐƠN */}
            <div className="border-t border-slate-200 pt-3.5 dark:border-[#333333]">
              <h4 className="mb-3.5 text-[11px] font-black uppercase tracking-wider text-[#004785]">
                Nhật ký xử lý đơn hàng
              </h4>
              <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-[#333333]">
                <div className="relative flex items-start pl-5">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#004785]" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-[#e5e5e5]">
                      Khởi tạo hóa đơn bán lẻ thành công
                    </p>
                    <span className="font-mono text-[10px] font-medium text-slate-400 dark:text-[#808080]">
                      10:45 • Thu ngân điểm POS
                    </span>
                  </div>
                </div>
                <div className="relative flex items-start pl-5">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">
                      Xác nhận đã nhận đủ tiền mặt
                    </p>
                    <span className="font-mono text-[10px] font-medium text-slate-400 dark:text-[#808080]">
                      10:46 • Hệ thống cân đối sổ quỹ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHÂN ĐIỀU KHIỂN - NÚT PHẲNG CỨNG CÁP THEO PHOM TRANG LOGIN */}
          <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-[#F8FAFC] p-3 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
            <button
              type="button"
              onClick={() => showNotice('Đã kích hoạt lệnh hủy đơn hàng')}
              className="flex-1 rounded-[4px] border border-red-200 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
            >
              Hủy đơn
            </button>
            <button
              type="button"
              onClick={() => showNotice('Đang truyền tín hiệu đến máy in bill...')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:bg-[#0f0f0f] dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
            >
              <Printer size={13} /> <span>In hóa đơn</span>
            </button>
            <button
              type="button"
              onClick={() => showNotice('Cập nhật trạng thái: Đang vận chuyển')}
              className="flex-1 bg-[#004785] py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#003366]"
            >
              Giao hàng
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPanel;
