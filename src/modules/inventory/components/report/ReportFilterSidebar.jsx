/**
 * ReportFilterSidebar - Bộ lọc cho Báo cáo Tổng hợp Tồn kho.
 * Style bám sát ProductFilterSidebar.
 */
import Icon from '../../../../shared/components/Icon';
import { reportPeriods, reportWarehouses } from '../../data/reportMockData';

const ReportFilterSidebar = ({ isCollapsed, onToggleCollapse, filters }) => {
  const {
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
  } = filters;

  const handlePeriod = (v) => {
    setPeriod(v);
    setTimeout(onApply, 0);
  };
  const handleDateFrom = (v) => {
    setDateFrom(v);
    setTimeout(onApply, 0);
  };
  const handleDateTo = (v) => {
    setDateTo(v);
    setTimeout(onApply, 0);
  };
  const handleWarehouse = (v) => {
    onToggleWarehouse(v);
    setTimeout(onApply, 0);
  };
  const handleMerge = (v) => {
    setMergeWarehouses(v);
    setTimeout(onApply, 0);
  };
  const handleMovement = (v) => {
    setOnlyWithMovement(v);
    setTimeout(onApply, 0);
  };

  return (
    <>
      {isCollapsed && (
        <button
          type="button"
          className="absolute -left-2 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:shadow-lg"
          onClick={() => onToggleCollapse(false)}
        >
          <Icon name="chevron_right" className="text-slate-500" size={18} />
        </button>
      )}

      <aside
        className={`relative shrink-0 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'}`}
      >
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>

        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Bộ lọc</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              setPeriod('thisMonth');
              setMergeWarehouses(true);
              setOnlyWithMovement(false);
              setTimeout(onApply, 0);
            }}
            title="Đặt lại"
          >
            <Icon name="cached" size={16} />
          </button>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Kỳ báo cáo</p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={period}
            onChange={(e) => handlePeriod(e.target.value)}
          >
            {reportPeriods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 space-y-3">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Thời gian</p>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              value={dateFrom}
              onChange={(e) => handleDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              value={dateTo}
              onChange={(e) => handleDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Kho</p>
          <div className="flex flex-wrap gap-1.5">
            {reportWarehouses.map((wh) => {
              const active = selectedWarehouses.includes(wh);
              return (
                <button
                  key={wh}
                  type="button"
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400'}`}
                  onClick={() => handleWarehouse(wh)}
                >
                  {wh}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={mergeWarehouses}
              onChange={(e) => handleMerge(e.target.checked)}
            />
            <span className="text-sm text-slate-700">Cộng gộp các kho</span>
          </label>
        </div>
        <div className="mb-6">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={onlyWithMovement}
              onChange={(e) => handleMovement(e.target.checked)}
            />
            <span className="text-sm text-slate-700">Chỉ hàng có phát sinh</span>
          </label>
        </div>
      </aside>
    </>
  );
};

export default ReportFilterSidebar;
