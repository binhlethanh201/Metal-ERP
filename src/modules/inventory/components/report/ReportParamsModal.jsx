/**
 * ReportParamsModal - Popup chọn tham số báo cáo tồn kho.
 * Form: Kỳ báo cáo, Từ ngày - Đến ngày, Kho (multi-select), Checkbox tùy chọn.
 */
import Icon from '../../../../shared/components/Icon';
import { reportPeriods, reportWarehouses } from '../../data/reportMockData';

const ReportParamsModal = ({
  isOpen,
  onClose,
  period,
  setPeriod,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  selectedWarehouses,
  onToggleWarehouse,
  mergeWarehouses,
  setMergeWarehouses,
  onlyWithMovement,
  setOnlyWithMovement,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Tham số báo cáo</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Kỳ báo cáo */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Kỳ báo cáo
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {reportPeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Từ ngày - Đến ngày */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Từ ngày
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Đến ngày
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Kho - Multi select */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Kho
            </label>
            <div className="flex flex-wrap gap-2">
              {reportWarehouses.map((wh) => {
                const active = selectedWarehouses.includes(wh);
                return (
                  <button
                    key={wh}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
                    onClick={() => onToggleWarehouse(wh)}
                  >
                    {wh}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkbox options */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={mergeWarehouses}
                onChange={(e) => setMergeWarehouses(e.target.checked)}
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">Cộng gộp các kho</p>
                <p className="text-xs text-slate-500">
                  Gộp chung số liệu của cùng một mặt hàng ở các kho khác nhau
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={onlyWithMovement}
                onChange={(e) => setOnlyWithMovement(e.target.checked)}
              />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Chỉ hiển thị hàng hóa có phát sinh trong kỳ
                </p>
                <p className="text-xs text-slate-500">
                  Ẩn các mặt hàng không có giao dịch Nhập/Xuất
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#004785] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003566] active:scale-95"
            onClick={onApply}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportParamsModal;
