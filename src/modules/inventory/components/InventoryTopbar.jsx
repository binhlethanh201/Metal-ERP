import React from 'react';
import MaterialIcon from './MaterialIcon';

const InventoryTopbar = () => {
  const handleOpenPOS = () => {
    window.history.pushState({}, '', '/pos');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <header className="fixed left-[260px] right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex max-w-xl flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
        <MaterialIcon name="search" className="mr-2 text-slate-400" />
        <input
          className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
          placeholder="Tìm kiếm sản phẩm, đơn hàng..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <button className="rounded-xl bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-all active:scale-95">
            Nhập kho
          </button>
          <button className="rounded-xl border border-[#F59E0B] px-4 py-2 text-sm font-bold text-[#F59E0B] transition-all active:scale-95">
            Xuất kho
          </button>
          <button
            type="button"
            onClick={handleOpenPOS}
            className="flex items-center gap-1 rounded-xl border border-[#004785] px-4 py-2 text-sm font-bold text-[#004785] transition-all hover:bg-blue-50 active:scale-95"
          >
            <MaterialIcon name="point_of_sale" className="text-sm" />
            <span>Máy bán hàng</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <MaterialIcon name="notifications" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
          </button>
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <MaterialIcon name="filter_list" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-200 to-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default InventoryTopbar;
