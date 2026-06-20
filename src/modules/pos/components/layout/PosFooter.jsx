/** * Footer POS - Status bar: mã đơn, nhân viên (Dynamic), khách hàng, điểm, trạng thái đồng bộ kho.
 */
import React from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';

const StatusBadge = ({ label, value, bordered }) => (
  <div
    className={`flex items-center gap-x-2 text-[10px] font-bold uppercase tracking-tighter opacity-80 ${bordered ? 'border-l border-white/20 pl-6' : ''}`}
  >
    <span className="text-blue-400">{label}</span>
    <span>{value}</span>
  </div>
);

const PosFooter = ({
  orderCode = 'KK-20231024-001',
  customer = 'Khách lẻ',
  points = '125 pts',
  synced = true,
}) => {
  const { user } = useAuth();

  // Tự động kéo tên thật của User từ phiên đăng nhập hiện tại
  const currentStaff = user?.fullName || 'Hệ thống POS';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-12 items-center justify-between bg-slate-900 px-6 text-white">
      <div className="flex items-center gap-x-6">
        <StatusBadge label="ĐƠN:" value={orderCode} />
        <StatusBadge label="NHÂN VIÊN:" value={currentStaff} bordered />
        <StatusBadge label="KHÁCH HÀNG:" value={customer} bordered />
      </div>
      <div className="flex items-center gap-x-6">
        <StatusBadge label="ĐIỂM:" value={points} />
        <div className="flex items-center gap-x-2 border-l border-white/20 pl-6 text-[10px] font-bold uppercase tracking-tighter">
          <div
            className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${synced ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
          <span className="opacity-80">{synced ? 'ĐÃ ĐỒNG BỘ KHO' : 'ĐANG ĐỒNG BỘ...'}</span>
        </div>
      </div>
    </footer>
  );
};

export default PosFooter;
