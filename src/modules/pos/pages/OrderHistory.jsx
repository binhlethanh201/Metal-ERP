/**
 * Trang lịch sử đơn hàng - Cấu trúc Flexbox cho phép bảng co giãn linh hoạt (Flexible Layout)
 */
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import OrderStats from '../components/orders/OrderStats';
import OrderFilterBar from '../components/orders/OrderFilterBar';
import OrderTable from '../components/orders/OrderTable';
import OrderDetailPanel from '../components/orders/OrderDetailPanel';

const MOCK_ORDERS_DATA = [
  {
    id: 1,
    code: 'DH0001234',
    date: '20/05/2024 10:45',
    customer: 'Công ty TNHH Kim Khí ABC',
    paymentStatus: 'paid',
    shippingStatus: 'pending',
    total: '37.565.000',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
  },
  {
    id: 2,
    code: 'DH0001235',
    date: '20/05/2024 09:30',
    customer: 'Đại lý Nguyễn Văn A',
    paymentStatus: 'unpaid',
    shippingStatus: 'pending',
    total: '12.890.000',
    phone: '0918765432',
    address: '456 Đường XYZ, Hà Nội',
  },
  {
    id: 3,
    code: 'DH0001236',
    date: '19/05/2024 16:15',
    customer: 'Xưởng Cơ Khí Việt Đức',
    paymentStatus: 'paid',
    shippingStatus: 'shipped',
    total: '8.450.000',
    phone: '0983332211',
    address: '78 Lô C, KCN Sóng Thần, Bình Dương',
  },
];

const OrderHistory = () => {
  const { showNotice } = useOutletContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === MOCK_ORDERS_DATA.length ? [] : MOCK_ORDERS_DATA.map((o) => o.id)
    );
  };

  const handleRowClick = (order) => {
    setSelectedOrder((prev) => (prev?.id === order.id ? null : order));
  };

  const filteredOrders = MOCK_ORDERS_DATA.filter((order) => {
    return (
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    // 🌟 QUAN TRỌNG: Thêm h-full w-full overflow-hidden để cố định khung hình phối cảnh POS
    <div className="relative flex h-full w-full overflow-hidden">
      {/* CỘT TRÁI: BẢNG DỮ LIỆU CÓ THỂ CO GIÃN (flex-1 min-w-0 để tránh vỡ layout khi ép chiều rộng) */}
      <div className="flex min-w-0 flex-1 flex-col space-y-4 overflow-y-auto pr-4 transition-all duration-300">
        {/* TIÊU ĐỀ TÁC VỤ */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Quản lý sổ đơn hàng POS
            </h1>
            <p className="font-mono text-[10px] font-bold uppercase tracking-tight text-slate-400">
              NODE: LIVE_MONITORING
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => showNotice('Đang trích xuất dữ liệu...')}
              className="flex items-center gap-1 rounded-[4px] border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <span>Xuất file</span>
            </button>
            <button
              onClick={() => showNotice('Đã cập nhật danh sách đơn hàng')}
              className="flex items-center gap-1 rounded-[4px] border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <span>Nạp lại</span>
            </button>

            <button
              onClick={() => navigate('/pos')}
              className="flex items-center gap-1 rounded-[4px] bg-[#004785] px-3.5 py-1.5 text-xs font-black text-white transition-all hover:bg-slate-800"
            >
              <Plus size={12} /> <span>Tạo đơn hàng</span>
            </button>
          </div>
        </div>

        {/* THỐNG KÊ NHANH (shrink-0 để bảo vệ không bị bóp méo chiều cao) */}
        <div className="shrink-0">
          <OrderStats />
        </div>

        {/* THANH BỘ LỌC (shrink-0) */}
        <div className="shrink-0">
          <OrderFilterBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSearch={setSearchTerm}
          />
        </div>

        {/* BẢNG SỐ LIỆU TỰ ĐỘNG CO GIÃN THEO KHUNG */}
        <div className="min-h-0 flex-1 overflow-x-auto">
          <OrderTable
            orders={filteredOrders}
            selectedIds={selectedIds}
            selectedOrderIds={selectedOrder ? [selectedOrder.id] : []}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={handleRowClick}
          />
        </div>

        {/* PHÂN TRANG (shrink-0) */}
        <footer className="flex shrink-0 items-center justify-between rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-400">
          <span>Hiển thị 1 - {filteredOrders.length} trên 45 dòng</span>
          <div className="flex gap-0.5">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white hover:text-slate-900"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white hover:text-slate-900"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </footer>
      </div>

      {/* CỘT PHẢI: PANEL CHI TIẾT ĐƠN HÀNG - CHUYỂN THÀNH KHỐI ĐỒNG HÀNH TRONG LUỒNG FLEX */}
      <OrderDetailPanel
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        showNotice={showNotice}
      />
    </div>
  );
};

export default OrderHistory;
