/**
 * Thanh điều khiển bộ lọc nâng cao - Sửa góc bo nút phẳng đanh thép.
 */
import React from 'react';
import { Eye, Edit, Trash2, Calendar, ArrowRight, Search } from 'lucide-react';

const OrderFilterBar = ({ activeTab, onTabChange, onSearch }) => {
  const TABS = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'unpaid', label: 'Chưa thanh toán' },
    { id: 'unshipped', label: 'Chưa giao hàng' },
    { id: 'completed', label: 'Hoàn thành' },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex rounded-[2px] border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              className="flex items-center gap-1 rounded-[2px] px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Eye size={13} /> <span>Xem</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[2px] px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <Edit size={13} /> <span>Sửa</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[2px] px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} /> <span>Xóa</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5 rounded-[4px] border border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-700">
            <Calendar size={13} className="text-slate-400" />
            <input
              type="text"
              className="w-16 border-none bg-transparent p-0 text-center font-bold focus:ring-0"
              defaultValue="01/05/2024"
            />
            <ArrowRight size={10} className="text-slate-400" />
            <input
              type="text"
              className="w-16 border-none bg-transparent p-0 text-center font-bold focus:ring-0"
              defaultValue="20/05/2024"
            />
          </div>

          <button
            type="button"
            className="rounded-[4px] bg-[#004785] px-3 py-1 text-xs font-bold text-white shadow-sm transition-all hover:bg-black"
          >
            Lấy dữ liệu
          </button>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên đối tác khách hàng..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-[4px] border border-slate-300 bg-slate-50 py-1 pl-8 pr-3 text-xs font-semibold outline-none focus:border-[#004785]"
          />
        </div>
      </div>

      <nav className="flex border-b border-slate-200 pt-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`border-b-2 px-4 py-1.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'border-[#004785] text-[#004785]'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrderFilterBar;
