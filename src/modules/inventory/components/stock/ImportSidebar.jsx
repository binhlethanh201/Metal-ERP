import { useMemo } from 'react';
import { CalendarClock, Package, AlertCircle, CheckCircle2 } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

export const ImportSidebar = ({
  inwardType,
  setInwardType,
  note,
  setNote,
  suppliers,
  supplierQuery,
  setSupplierQuery,
  selectedSupplier,
  setSelectedSupplier,
  totals,
  status,
  isSubmitting,
  onFinish,
  itemsCount,
}) => {
  const supplierSuggestions = useMemo(() => {
    const keyword = supplierQuery.trim().toLowerCase();
    if (!keyword) return suppliers.slice(0, 5);
    return suppliers.filter((sup) => `${sup.name} ${sup.phone}`.toLowerCase().includes(keyword));
  }, [suppliers, supplierQuery]);

  return (
    <aside className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package size={18} className="text-[#0f4c81]" />
          <h2 className="text-lg font-semibold text-slate-900">Thông tin phiếu nhập</h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Người tạo
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Hệ thống ERP</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarClock size={14} /> Thời gian
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {new Date().toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">Loại hình nhập kho</span>
            <select
              value={inwardType}
              onChange={(e) => setInwardType(Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            >
              <option value={1}>Nhập hàng từ Nhà cung cấp</option>
              <option value={2}>Khách hàng hoàn trả</option>
              <option value={3}>Cân bằng / Điều chỉnh kho</option>
            </select>
          </label>

          {inwardType === 1 && (
            <div className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Nhà cung cấp đối tác</span>
              <input
                value={supplierQuery}
                onChange={(e) => {
                  setSupplierQuery(e.target.value);
                  if (selectedSupplier) setSelectedSupplier(null);
                }}
                placeholder="Gõ tìm kiếm nhà cung cấp..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
              />
              {!selectedSupplier && supplierSuggestions.length > 0 && (
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                  {supplierSuggestions.map((sup) => (
                    <button
                      key={sup.id}
                      type="button"
                      onClick={() => {
                        setSelectedSupplier(sup);
                        setSupplierQuery(sup.name);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-white"
                    >
                      <span className="font-medium text-slate-800">{sup.name}</span>
                      <span className="text-xs text-slate-500">{sup.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-1.5 block">Lý do nhập / Ghi chú</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              placeholder="Nhập nội dung lý do thực tế..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
          </label>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Số lượng mặt hàng</span>
              <span className="font-bold text-slate-900">{itemsCount} dòng</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-slate-600">
              <span className="font-medium text-slate-700">Tổng giá trị phiếu</span>
              <span className="text-base font-bold text-emerald-600">
                {formatCurrency(totals.totalAmount)}
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-3 py-2.5 text-sm ${
              status.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-sky-200 bg-sky-50 text-sky-700'
            }`}
          >
            <div className="flex items-start gap-2">
              {status.type === 'error' ? (
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              ) : status.type === 'success' ? (
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              ) : (
                <Package size={16} className="mt-0.5 flex-shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFinish}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'HỆ THỐNG ĐANG XỬ LÝ...' : 'HOÀN TẤT NHẬP KHO'}
          </button>
        </div>
      </div>
    </aside>
  );
};
