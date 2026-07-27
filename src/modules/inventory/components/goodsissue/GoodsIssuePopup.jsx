/**
 * GoodsIssuePopup - Modal Thêm mới Phiếu Xuất Kho (Popup Overlay).
 *
 * Cấu trúc:
 * - Overlay nền mờ + Modal chính giữa (max-w-6xl)
 * - Header: Tiêu đề + nút X
 * - Top Section: Đối tượng (searchable + thêm nhanh), Diễn giải, Tham chiếu, Số phiếu, Thời gian, Người lập
 * - Middle Section: Toggle Quét mã vạch + Bảng nhập liệu động
 * - Footer: Đính kèm + Tổng tiền + Hủy/Lưu
 * - Confirm Dialog khi isDirty + đóng
 * - QuickAddCustomer Popup con
 */
import { useState, useEffect, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import { useGoodsIssuePopup } from '../../hooks/useGoodsIssuePopup';
import { formatMoney } from '../../utils/goodsIssueUtils';

// ==================== SUB-COMPONENTS ====================

/** Dropdown chọn hàng hóa dạng Grid */
const ProductSearchDropdown = ({
  isOpen,
  searchText,
  onSearchChange,
  results,
  activeIndex,
  dropdownRef,
  inputRef,
  onSelect,
  onKeyDown,
}) => {
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 z-[200] mt-1 w-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-[#333333] dark:bg-[#1a1a1a]"
    >
      {/* Grid Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
        <span className="w-[110px] shrink-0">Mã HH</span>
        <span className="flex-1">Tên hàng hóa</span>
        <span className="w-[90px] shrink-0 text-right">Tồn kho</span>
      </div>

      {/* Search input trong dropdown */}
      <div className="border-b border-slate-100 px-2 py-1.5 dark:border-[#333333]">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
          placeholder="Gõ để tìm kiếm..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="max-h-[280px] overflow-y-auto">
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400 dark:text-[#808080]">
            Không tìm thấy hàng hóa phù hợp
          </div>
        ) : (
          results.map((product, idx) => (
            <button
              key={product.id}
              type="button"
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                idx === activeIndex
                  ? 'bg-blue-50 text-blue-900 dark:bg-[#272727] dark:text-blue-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-[#b3b3b3] dark:hover:bg-[#333333]'
              } ${idx < results.length - 1 ? 'border-b border-slate-50 dark:border-[#333333]' : ''}`}
              onClick={() => onSelect(product)}
            >
              <span className="w-[110px] shrink-0 font-mono text-xs font-semibold text-slate-800 dark:text-[#e5e5e5]">
                {product.code}
              </span>
              <span className="flex-1 text-sm dark:text-[#d4d4d4]">{product.name}</span>
              <span className="w-[90px] shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-[#999999]">
                {product.stock != null ? product.stock.toLocaleString('vi-VN') : '-'}
              </span>
            </button>
          ))
        )}
      </div>

      {/* F9/F3 Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#333333] dark:bg-[#1a1a1a]">
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-[#333333]"
        >
          <span className="text-base leading-none">+</span> Thêm mới (F9)
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
        >
          <span className="text-sm">Q</span> Tìm nhanh (F3)
        </button>
      </div>
    </div>
  );
};

/** Dialog xác nhận thoát khi chưa lưu */
const ConfirmCloseDialog = ({ isOpen, onCancel, onDiscard, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-[#1a1a1a]">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Icon name="warning" className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Dữ liệu chưa được lưu</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">Bạn có chắc chắn muốn thoát?</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-[#333333]">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-[#404040]"
            onClick={onCancel}
          >
            Huy
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-red-900/30 dark:hover:text-red-400"
            onClick={onDiscard}
          >
            Khong luu
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003566] active:scale-95"
            onClick={onSave}
          >
            Luu
          </button>
        </div>
      </div>
    </div>
  );
};

/** Popup con: Them nhanh Khach hang */
const QuickAddCustomerPopup = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ code: '', name: '', phone: '', address: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#333333]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Thêm mới Đối tượng</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Mã KH
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Tên KH <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              SĐT
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Địa chỉ
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-[#333333]">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-[#404040]"
            onClick={onClose}
          >
            Huy
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
            disabled={!form.name.trim()}
            onClick={() => onSave(form)}
          >
            Luu
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN POPUP COMPONENT ====================

const GoodsIssuePopup = ({ isOpen, onClose, editData = null }) => {
  const popup = useGoodsIssuePopup(onClose, editData);
  const isEditMode = !!editData;

  // Click outside -> kiem tra isDirty
  const overlayRef = useRef(null);
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      popup.requestClose('overlay');
    }
  };

  // Escape key
  const { requestClose } = popup;
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') requestClose('escape');
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, requestClose]);

  // Khoa scroll body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isAutoOpen = (lineId) => popup.autoOpenLineId === lineId;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-8">
      {/* Overlay */}
      <div ref={overlayRef} className="fixed inset-0 bg-black/60" onClick={handleOverlayClick} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[1400px] rounded-xl bg-white shadow-2xl dark:bg-[#1a1a1a]">
        {/* ========== HEADER ========== */}
        <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#e5e5e5]">
            {isEditMode ? 'Sửa phiếu xuất kho' : 'Thêm mới phiếu xuất kho'}
          </h1>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            onClick={() => popup.requestClose('headerX')}
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* ========== TOP SECTION: Thông tin chung ========== */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Loại xuất kho */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Loại xuất kho
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  value={popup.header.issueType}
                  onChange={(e) => popup.handleHeaderChange('issueType', e.target.value)}
                >
                  {popup.issueTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Đối tượng + Thêm nhanh */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Đối tượng <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                      value={popup.header.customerId}
                      onChange={(e) => {
                        const cust = popup.customerList.find((c) => c.id === e.target.value);
                        popup.handleHeaderChange('customerId', e.target.value);
                        popup.handleHeaderChange('customerName', cust?.name || '');
                      }}
                    >
                      <option value="">-- Chọn đối tượng --</option>
                      {popup.customerList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 transition-colors hover:bg-blue-50 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-blue-400 dark:hover:bg-[#333333]"
                    onClick={() => popup.setShowQuickAddCustomer(true)}
                    title="Thêm nhanh đối tượng"
                  >
                    <span className="text-xl font-bold leading-none">+</span>
                  </button>
                </div>
              </div>

              {/* Diễn giải */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Diễn giải
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  placeholder="Lý do xuất kho..."
                  value={popup.header.description}
                  onChange={(e) => popup.handleHeaderChange('description', e.target.value)}
                />
              </div>

              {/* Tham chiếu */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Tham chiếu
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  placeholder="Mã chứng từ liên quan..."
                  value={popup.header.reference}
                  onChange={(e) => popup.handleHeaderChange('reference', e.target.value)}
                />
              </div>

              {/* Số phiếu (Readonly, auto-gen) */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Số phiếu
                </label>
                <input
                  type="text"
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-500 outline-none dark:border-[#333333] dark:bg-[#272727] dark:text-[#999999]"
                  value={popup.header.issueNumber}
                  readOnly
                />
              </div>

              {/* Thời gian */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Thời gian <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                  value={popup.header.date}
                  onChange={(e) => popup.handleHeaderChange('date', e.target.value)}
                />
              </div>

              {/* Người lập phiếu (Readonly) */}
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Người lập phiếu
                </label>
                <input
                  type="text"
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none dark:border-[#333333] dark:bg-[#272727] dark:text-[#999999]"
                  value={popup.header.createdBy}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ========== MIDDLE SECTION: BANG HANG HOA ========== */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
            {/* Toggle Barcode + Title */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-[#333333]">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                Chi tiết hàng hóa
              </h3>
              <label className="flex cursor-pointer select-none items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#999999]">Quét mã vạch</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={popup.barcodemode}
                  onClick={() => popup.setBarcodemode(!popup.barcodemode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    popup.barcodemode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-[#333333]'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      popup.barcodemode ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* BARCODE MODE INPUT */}
            {popup.barcodemode && (
              <div className="border-b border-dashed border-blue-200 bg-blue-50/40 px-5 py-3 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="flex items-center gap-3">
                  <Icon name="barcode_scanner" className="text-blue-600" size={22} />
                  <input
                    ref={popup.barcodeInputRef}
                    type="text"
                    className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-700 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                    placeholder="Quét mã vạch hoac Nhập Mã hàng hóa..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        popup.handleBarcodeScanned(e.target.value);
                      }
                    }}
                  />
                  <span className="text-xs text-slate-500 dark:text-[#999999]">Nhấn Enter sau khi quét</span>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] table-fixed">
                {/* Table Header */}
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <tr>
                    <th className="w-[44px] px-2 py-2.5 text-center text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      #
                    </th>
                    <th className="w-[150px] px-2 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Mã HH <span className="text-red-400">*</span>
                    </th>
                    <th className="w-[170px] px-2 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Tên HH
                    </th>
                    <th className="w-[95px] px-2 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Số lô
                    </th>
                    <th className="w-[100px] px-2 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Hạn SD
                    </th>
                    <th className="w-[135px] px-2 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Kho xuất
                    </th>
                    <th className="w-[85px] px-2 py-2.5 text-center text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      DVT
                    </th>
                    <th className="w-[100px] px-2 py-2.5 text-right text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      SL <span className="text-red-400">*</span>
                    </th>
                    <th className="w-[120px] px-2 py-2.5 text-right text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Đơn giá
                    </th>
                    <th className="w-[130px] px-2 py-2.5 text-right text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                      Thành tiền
                    </th>
                    <th className="w-[44px] px-2 py-1.5 text-center text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]"></th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {popup.lines.map((line, idx) => {
                    const isDirtyLine = line.isDirty;
                    const isLastEmpty = !isDirtyLine && idx === popup.lines.length - 1;

                    return (
                      <tr
                        key={line.id}
                        className={`transition-colors ${
                          isDirtyLine ? 'hover:bg-blue-50/30 dark:hover:bg-[#333333]' : 'bg-slate-50/30 dark:bg-[#1a1a1a]/30'
                        }`}
                      >
                        {/* STT */}
                        <td className="px-2 py-1.5 text-center text-xs text-slate-400 dark:text-[#808080]">
                          {isDirtyLine ? popup.dirtyLines.indexOf(line) + 1 : ''}
                        </td>

                        {/* Mã hàng hóa + Autocomplete */}
                        <td className="relative px-2 py-1.5">
                          <input
                            type="text"
                            className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${
                              isAutoOpen(line.id)
                                ? 'border-blue-500 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-900'
                                : 'border-transparent bg-transparent focus:border-blue-300 dark:text-[#e5e5e5]'
                            }`}
                            placeholder={isLastEmpty ? 'Nhập mã hoặc F3...' : ''}
                            value={isAutoOpen(line.id) ? popup.autoSearch : line.productCode}
                            onChange={(e) => {
                              if (isLastEmpty) {
                                popup.openAutocomplete(line.id, e.target.value);
                              } else {
                                popup.handleLineFieldChange(line.id, 'productCode', e.target.value);
                              }
                            }}
                            onFocus={() => {
                              if (!isAutoOpen(line.id)) {
                                popup.openAutocomplete(line.id, line.productCode);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (isAutoOpen(line.id)) {
                                popup.handleAutoKeyDown(e);
                              }
                            }}
                          />
                          {/* Autocomplete Dropdown */}
                          {isAutoOpen(line.id) && (
                            <ProductSearchDropdown
                              isOpen={true}
                              searchText={popup.autoSearch}
                              onSearchChange={popup.handleAutoSearchChange}
                              results={popup.autoResults}
                              activeIndex={popup.autoActiveIdx}
                              dropdownRef={popup.autoDropdownRef}
                              inputRef={popup.autoInputRef}
                              onSelect={(product) => popup.handleProductSelect(line.id, product)}
                              onKeyDown={popup.handleAutoKeyDown}
                            />
                          )}
                        </td>

                        {/* Tên hàng hóa (Readonly) */}
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full cursor-default border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-600 outline-none dark:text-[#b3b3b3]"
                            value={line.productName}
                            readOnly
                          />
                        </td>

                        {/* Số lô (Conditional) */}
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${
                              isDirtyLine && line.hasLotControl
                                ? 'border-slate-200 bg-white focus:border-blue-400 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'
                                : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400 dark:bg-[#1a1a1a] dark:text-[#808080]'
                            }`}
                            value={line.lotNumber}
                            onChange={(e) =>
                              popup.handleLineFieldChange(line.id, 'lotNumber', e.target.value)
                            }
                            disabled={!isDirtyLine || !line.hasLotControl}
                            placeholder={isDirtyLine && !line.hasLotControl ? '--' : ''}
                          />
                        </td>

                        {/* Hạn sử dụng (Conditional) */}
                        <td className="px-2 py-1.5">
                          <input
                            type="date"
                            className={`w-full rounded border px-2 py-1.5 text-sm outline-none ${
                              isDirtyLine && line.hasExpiryControl
                                ? 'border-slate-200 bg-white focus:border-blue-400 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'
                                : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400 dark:bg-[#1a1a1a] dark:text-[#808080]'
                            }`}
                            value={line.expiryDate}
                            onChange={(e) =>
                              popup.handleLineFieldChange(line.id, 'expiryDate', e.target.value)
                            }
                            disabled={!isDirtyLine || !line.hasExpiryControl}
                          />
                        </td>

                        {/* Kho xuất */}
                        <td className="px-2 py-1.5">
                          {isDirtyLine ? (
                            <select
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                              value={line.warehouseId}
                              onChange={(e) => {
                                const wh = popup.warehouseList.find((w) => w.id === e.target.value);
                                popup.handleLineFieldChange(line.id, 'warehouseId', e.target.value);
                                popup.handleLineFieldChange(
                                  line.id,
                                  'warehouseName',
                                  wh?.name || ''
                                );
                              }}
                            >
                              {popup.warehouseList.map((wh) => (
                                <option key={wh.id} value={wh.id}>
                                  {wh.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-1.5 text-sm text-slate-400 dark:text-[#808080]">--</span>
                          )}
                        </td>

                        {/* ĐVT (Readonly) */}
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={`text-sm ${isDirtyLine ? 'font-medium text-slate-700 dark:text-[#b3b3b3]' : 'text-slate-400 dark:text-[#808080]'}`}
                          >
                            {line.unit || '--'}
                          </span>
                        </td>

                        {/* Số lượng */}
                        <td className="px-2 py-1.5">
                          <input
                            ref={(el) => {
                              popup.lineInputRefs.current[`qty_${line.id}`] = el;
                            }}
                            type="number"
                            className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${
                              isDirtyLine
                                ? 'border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'
                                : 'cursor-not-allowed border-transparent bg-transparent text-slate-400 dark:text-[#808080]'
                            }`}
                            value={isDirtyLine ? line.quantity : ''}
                            min={0}
                            onChange={(e) => popup.handleQuantityChange(line.id, e.target.value)}
                            disabled={!isDirtyLine}
                          />
                        </td>

                        {/* Đơn giá */}
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            className={`w-full rounded border px-2 py-1.5 text-right text-sm outline-none ${
                              isDirtyLine
                                ? 'border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]'
                                : 'cursor-not-allowed border-transparent bg-transparent text-slate-400 dark:text-[#808080]'
                            }`}
                            value={isDirtyLine ? line.unitPrice || '' : ''}
                            min={0}
                            onChange={(e) => popup.handlePriceChange(line.id, e.target.value)}
                            disabled={!isDirtyLine}
                          />
                        </td>

                        {/* Thành tiền (Readonly, auto calc) */}
                        <td className="px-2 py-1.5 text-right">
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              isDirtyLine ? 'text-slate-800 dark:text-[#e5e5e5]' : 'text-slate-400 dark:text-[#808080]'
                            }`}
                          >
                            {isDirtyLine ? formatMoney(line.totalAmount) : ''}
                          </span>
                        </td>

                        {/* Xóa dòng */}
                        <td className="px-2 py-1.5 text-center">
                          {isDirtyLine && popup.dirtyLines.length > 1 && (
                            <button
                              type="button"
                              className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-[#808080] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              onClick={() => popup.handleRemoveLine(line.id)}
                              title="Xóa dòng"
                            >
                              <Icon name="delete" size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========== FOOTER (Sticky) ========== */}
        <div className="sticky bottom-0 z-20 rounded-b-xl border-t-2 border-slate-200 bg-white px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          {/* Tổng tiền */}
          <div className="mb-3 flex items-center justify-end">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
              Tổng cộng:
            </span>
            <span className="ml-2 text-xl font-bold tabular-nums text-slate-900 dark:text-[#e5e5e5]">
              {formatMoney(popup.totalAmount)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-[#404040] dark:text-[#999999] dark:hover:border-blue-500 dark:hover:text-blue-400"
              onClick={popup.handleAttachFile}
            >
              <Icon name="upload_file" className="text-base" />
              Đính kèm file
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-[#404040]"
                onClick={() => popup.requestClose('cancelBtn')}
              >
                Huy
              </button>
              <button
                type="button"
                className="rounded-lg bg-[#004785] px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003566] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={popup.handleSubmit}
                disabled={!popup.isValid || popup.saving}
              >
                {popup.saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang lưu...
                  </span>
                ) : (
                  'Luu'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CONFIRM CLOSE DIALOG ========== */}
      <ConfirmCloseDialog
        isOpen={popup.showConfirmClose}
        onCancel={popup.handleConfirmCancel}
        onDiscard={popup.handleConfirmDiscard}
        onSave={popup.handleConfirmSave}
      />

      {/* ========== QUICK ADD CUSTOMER ========== */}
      <QuickAddCustomerPopup
        isOpen={popup.showQuickAddCustomer}
        onClose={() => popup.setShowQuickAddCustomer(false)}
        onSave={popup.handleQuickAddCustomer}
      />
    </div>
  );
};

export default GoodsIssuePopup;
