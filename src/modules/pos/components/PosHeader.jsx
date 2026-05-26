/** * Header POS nâng cấp - Search bar + nút Quét mã / Lịch sử / Thêm nhanh.
 * Đã đồng bộ hoàn toàn hệ thống Icon Lucide, nút thông báo, Avatar profile và bo góc rounded-xl theo InventoryTopbar.
 */
import React from 'react';
import Icon from '../../../shared/components/Icon';

const PosHeader = ({ search, onSearchChange, onBarcodeScan, onHistory, onQuickAdd }) => (
  <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 lg:left-[260px]">
    {/* KHỐI SEARCH BAR ĐỒNG BỘ CỠ CHỮ VÀ PHONG CÁCH */}
    <div className="flex max-w-xl flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
      <Icon name="search" className="mr-2 text-slate-400" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
        placeholder="Tìm sản phẩm (Tên, mã SKU, barcode...)"
        type="text"
      />
    </div>

    {/* KHỐI ACTION BUTTONS & USER PROFILE ĐỒNG BỘ KÍCH CỠ */}
    <div className="flex items-center gap-4">
      {/* Nhóm các nút tương tác POS được đưa về quy chuẩn bo góc rounded-xl */}
      <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
        <button
          type="button"
          onClick={onBarcodeScan}
          className="flex items-center gap-x-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
        >
          <Icon name="barcode" className="text-sm" />
          <span>Quét mã</span>
        </button>
        <button
          type="button"
          onClick={onHistory}
          className="flex items-center gap-x-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
        >
          <Icon name="history" className="text-sm" />
          <span>Lịch sử</span>
        </button>
        <button
          type="button"
          onClick={onQuickAdd}
          className="flex items-center gap-x-2 rounded-xl bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          <Icon name="add" className="text-sm" />
          <span>Thêm nhanh</span>
        </button>
      </div>

      {/* KHỐI TIỆN ÍCH CHÂN DUNG USER & NOTIFICATION - BẢN SAO HOÀN HẢO TỪ INVENTORY TOPBAR */}
      <div className="flex items-center gap-3">
        <button type="button" className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
          <Icon name="notifications" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </button>
        <div className="flex items-center gap-3 pl-2">
          <img
            alt="User Profile Avatar"
            className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFo3D0VhkjDp6wYi7A3G3rtT-HeBeV9_Irw1MncCf1By9FiWAzrrW0Y1o_eR0BIqouI4JLwKyzpxHiyhHrOxhP1gc2OrbrKeKagYERgHPSLqIeqXh7iopYQYZFpQ3HRo32q_gQG4t9lU6JywKA9r6XbGmBU0YhjbyNzuCTVz8W4Q6FKwogP_fwDpM6p_EySDffHLbP5e-WRjoesCtXL6OJytbDZySk5VBmPYWb9eQM2XahiNm9R3AHtYeKbU3QQiT82T6wAgP0MXo"
          />
        </div>
      </div>
    </div>
  </header>
);

export default PosHeader;
