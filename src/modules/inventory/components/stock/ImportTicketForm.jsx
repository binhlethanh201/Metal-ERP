import { useState, useMemo } from 'react';
import { Package, CalendarClock, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const ImportTicketForm = ({
  inwardType,
  onChangeInwardType,
  suppliers = [],
  selectedSupplier,
  onSelectSupplier,
  note,
  onChangeNote,
  totals,
  status,
  isSubmitting,
  onSubmit, // Sẽ nhận tham số isDraft: boolean
  formatCurrency,
}) => {
  const [supplierQuery, setSupplierQuery] = useState(selectedSupplier?.name || '');

  const supplierSuggestions = useMemo(() => {
    const keyword = supplierQuery.trim().toLowerCase();
    if (!keyword) return suppliers.slice(0, 5);
    return suppliers.filter((s) => `${s.name} ${s.phone}`.toLowerCase().includes(keyword));
  }, [suppliers, supplierQuery]);

  return (
    <aside className="space-y-4">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package size={18} className="text-[#0f4c81]" />
          <h2 className="text-lg font-bold text-slate-900">Thông tin phiếu nhập</h2>
        </div>

        {/* Thông tin người lập & Thời gian */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Người lập phiếu
            </div>
            <div className="mt-1 font-semibold text-slate-900">Quản lý kho</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarClock size={14} /> Thời gian
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {new Date().toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-1.5 block">Loại phiếu nhập kho</span>
          <select
            value={inwardType}
            onChange={(e) => onChangeInwardType(Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-sky-500"
          >
            <option value={1}>Nhập mua hàng từ NCC (Purchase)</option>
            <option value={2}>Khách hàng trả lại (CustomerReturn)</option>
            <option value={3}>Cân bằng kho (BalanceAdjust)</option>
          </select>
        </label>

        <label className="relative block text-sm font-medium text-slate-700">
          <span className="mb-1.5 block">Nhà cung cấp / Đối tượng</span>
          <input
            value={supplierQuery}
            onChange={(e) => {
              setSupplierQuery(e.target.value);
              onSelectSupplier(null);
            }}
            placeholder="Tìm theo tên hoặc SĐT nhà cung cấp"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          />
          {!selectedSupplier && supplierSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
              {supplierSuggestions.map((sup) => (
                <button
                  key={sup.id}
                  type="button"
                  onClick={() => {
                    onSelectSupplier(sup);
                    setSupplierQuery(sup.name);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800">{sup.name}</span>
                  <span className="text-xs text-slate-500">{sup.phone}</span>
                </button>
              ))}
            </div>
          )}
        </label>

        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-1.5 block">Ghi chú / Lý do nhập kho</span>
          <textarea
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            rows="3"
            placeholder="Ghi chú chi tiết đợt nhập hàng..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          />
        </label>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Tổng số dòng:</span>
            <span className="font-bold text-slate-900">{totals.totalLines}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Tổng sản phẩm:</span>
            <span className="font-bold text-slate-900">{totals.totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Tổng tiền:</span>
            <span className="text-emerald-600">{formatCurrency(totals.totalAmount)}</span>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm ${
            status.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-sky-200 bg-sky-50 text-sky-700'
          }`}
        >
          {status.type === 'error' ? (
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          ) : status.type === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
          ) : (
            <Package size={18} className="mt-0.5 flex-shrink-0" />
          )}
          <span className="font-medium">{status.message}</span>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onSubmit(false)} // false = Không phải nháp -> Tạo + Confirm luôn
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={18} />
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT & CỘNG KHO'}
          </button>

          <button
            type="button"
            onClick={() => onSubmit(true)} // true = Lưu nháp -> Chỉ gọi Create (PENDING)
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Clock size={16} className="text-amber-500" />
            Lưu nháp (Chờ kiểm kho duyệt sau)
          </button>
        </div>
      </div>
    </aside>
  );
};
