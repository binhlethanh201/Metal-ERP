/**
 * GoodsIssueFilterSidebar - Bộ lọc danh sách phiếu xuất kho.
 * Style bám sát ProductFilterSidebar: section header đậm, radio card,
 * QuickRangePopover + DatePickerPopup bay trái, custom dropdown, triToggle.
 */
import { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

/* ── QuickRangePopover ── */
const quickRangeOptions = [
  {
    title: 'Tháng này',
    options: ['Hôm nay', 'Hôm qua', 'Tuần này', 'Tuần trước', 'Tháng này', 'Tháng trước'],
  },
  {
    title: 'Năm nay',
    options: ['Quý này', 'Quý trước', 'Năm nay', 'Năm trước'],
  },
];

const QuickRangePopover = ({ onSelect, onReset }) => (
  <div className="absolute left-[calc(100%+10px)] top-6 z-30 w-[500px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
    <div className="grid grid-cols-2 gap-4">
      {quickRangeOptions.map((col) => (
        <div key={col.title}>
          <p className="mb-2 text-sm font-bold text-slate-800">{col.title}</p>
          <div className="flex flex-col gap-2">
            {col.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600"
                onClick={() => onSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white"
        onClick={onReset}
      >
        Toàn thời gian
      </button>
    </div>
  </div>
);

/* ── DatePickerPopup ── */
const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];
const DAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const DatePickerPopup = ({ dateFrom, dateTo, onApply, onCancel }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // tháng panel trái
  const [selecting, setSelecting] = useState('from'); // 'from' | 'to'
  const [selFrom, setSelFrom] = useState(dateFrom ? new Date(dateFrom) : null);
  const [selTo, setSelTo] = useState(dateTo ? new Date(dateTo) : null);

  const rightMonth = viewMonth + 1;
  const rightYear = rightMonth > 11 ? viewYear + 1 : viewYear;
  const leftMonthNorm = viewMonth;
  const rightMonthNorm = rightMonth > 11 ? rightMonth - 12 : rightMonth;

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // convert CN=0 -> 6, T2=1 -> 0 ...
  };

  const buildCalendar = (year, month) => {
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const cells = [];
    // ô trống đầu tháng
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, key: `day-${d}`, dateObj: new Date(year, month, d) });
    }
    return cells;
  };

  const isInRange = (dateObj) => {
    if (!selFrom) return false;
    if (!selTo) return false;
    return dateObj >= selFrom && dateObj <= selTo;
  };

  const isStart = (dateObj) => selFrom && dateObj.toDateString() === selFrom.toDateString();
  const isEnd = (dateObj) => selTo && dateObj.toDateString() === selTo.toDateString();

  const handleDateClick = (dateObj) => {
    if (!dateObj) return;
    if (selecting === 'from') {
      setSelFrom(dateObj);
      setSelTo(null);
      setSelecting('to');
    } else {
      if (dateObj < selFrom) {
        setSelFrom(dateObj);
        setSelTo(null);
        setSelecting('to');
      } else {
        setSelTo(dateObj);
        setSelecting('from');
      }
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 10) {
      setViewYear(viewYear + 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleApply = () => {
    if (selFrom) {
      const end = selTo || selFrom;
      onApply({
        dateFrom: selFrom.toISOString().slice(0, 10),
        dateTo: end.toISOString().slice(0, 10),
        label: `${selFrom.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`,
      });
    }
  };

  const handleToday = () => {
    setSelFrom(today);
    setSelTo(today);
    setSelecting('from');
    handleApply();
  };

  const renderCalendar = (year, month) => {
    const cells = buildCalendar(year, month);
    return (
      <div>
        <p className="mb-3 text-center text-sm font-bold text-slate-700">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="mb-1 grid grid-cols-7 text-center text-xs text-slate-400">
          {DAY_HEADERS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((cell) => {
            if (cell.day === null) return <span key={cell.key} />;
            const d = cell.dateObj;
            const inRange = isInRange(d);
            const start = isStart(d);
            const end = isEnd(d);
            const isToday = d.toDateString() === today.toDateString();

            return (
              <button
                key={cell.key}
                type="button"
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${start || end ? 'bg-blue-600 font-bold text-white' : ''} ${inRange && !start && !end ? 'bg-blue-100 text-blue-800' : ''} ${!start && !end && !inRange ? 'text-slate-700 hover:bg-blue-50' : ''} ${isToday && !start && !end ? 'ring-2 ring-blue-400' : ''} `}
                onClick={() => handleDateClick(d)}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const fromStr = selFrom ? selFrom.toLocaleDateString('vi-VN') : '__/__/____';
  const toStr = selTo ? selTo.toLocaleDateString('vi-VN') : '__/__/____';

  return (
    <div className="absolute left-[calc(100%+10px)] top-14 z-30 w-[620px] rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="px-4 pb-3 pt-4">
        <p className="text-sm text-slate-500">
          {selecting === 'from' ? 'Chọn Từ ngày' : 'Chọn Đến ngày'}:{' '}
          <span className="font-semibold text-slate-800">{fromStr}</span>
          {' - '}
          <span className="font-semibold text-slate-800">{toStr}</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-6">
          {/* Left Panel */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500 hover:bg-slate-50"
                onClick={handlePrevMonth}
              >
                <Icon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-sm font-bold text-slate-700">
                {MONTH_NAMES[leftMonthNorm]} {viewYear}
              </p>
              <span className="w-7" />
            </div>
            {renderCalendar(viewYear, leftMonthNorm)}
          </div>

          {/* Right Panel */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="w-7" />
              <p className="text-sm font-bold text-slate-700">
                {MONTH_NAMES[rightMonthNorm]} {rightYear}
              </p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500 hover:bg-slate-50"
                onClick={handleNextMonth}
              >
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            {renderCalendar(rightYear, rightMonthNorm)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <button
          type="button"
          className="text-sm font-semibold text-blue-600 hover:underline"
          onClick={handleToday}
        >
          Hôm nay
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={onCancel}
          >
            Bỏ qua
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={handleApply}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN ── */
const GoodsIssueFilterSidebar = ({ isCollapsed, onToggleCollapse, filters }) => {
  const {
    searchTerm,
    setSearchTerm,
    timePreset,
    setTimePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    timeSelectedLabel,
    setTimeSelectedLabel,
    timeQuickOpen,
    setTimeQuickOpen,
    timeCustomOpen,
    setTimeCustomOpen,
    timeRef,
    issueTypeFilter,
    setIssueTypeFilter,
    distinctIssueTypes,
    paymentMethodFilter,
    setPaymentMethodFilter,
    syncStatusFilter,
    setSyncStatusFilter,
    customerFilter,
    setCustomerFilter,
    distinctCustomers,
    creatorFilter,
    setCreatorFilter,
    distinctCreators,
    amountFrom,
    setAmountFrom,
    amountTo,
    setAmountTo,
    resetFilters,
  } = filters;

  const handleTimePresetSelect = (label) => {
    let preset = 'all';
    if (label === 'Hôm nay') preset = 'today';
    else if (label === 'Hôm qua') preset = 'yesterday';
    else if (label === 'Tuần này') preset = 'thisWeek';
    else if (label === 'Tuần trước') preset = 'lastWeek';
    else if (label === 'Tháng này') preset = 'thisMonth';
    else if (label === 'Tháng trước') preset = 'lastMonth';
    else if (label === 'Quý này') preset = 'thisQuarter';
    else if (label === 'Quý trước') preset = 'lastQuarter';
    else if (label === 'Năm nay') preset = 'thisYear';
    else if (label === 'Năm trước') preset = 'lastYear';
    setTimePreset(preset);
    setTimeSelectedLabel(label);
    setTimeQuickOpen(false);
  };

  const handleCustomDateApply = (result) => {
    setDateFrom(result.dateFrom);
    setDateTo(result.dateTo);
    setTimeSelectedLabel(result.label);
    setTimePreset('custom');
    setTimeCustomOpen(false);
  };

  return (
    <>
      {/* Toggle mở rộng khi collapse */}
      <button
        type="button"
        className={`fixed left-[260px] top-[148px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all duration-300 hover:scale-110 ${
          isCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => onToggleCollapse(false)}
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>

      {/* Panel chính */}
      <aside
        className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${
          isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'
        }`}
      >
        {/* Nút thu gọn */}
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Bộ lọc</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={resetFilters}
            title="Xóa bộ lọc"
          >
            <Icon name="cached" size={16} />
          </button>
        </div>

        {/* 1. Tìm kiếm */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-tight text-slate-700">
            Tìm kiếm
          </h3>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            placeholder="Số phiếu, đối tượng, tham chiếu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 2. Thời gian */}
        <div className="relative mb-6 space-y-2" ref={timeRef}>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Thời gian</p>
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
          {[
            {
              val: 'allTime',
              label: timeSelectedLabel || 'Toàn thời gian',
              onChange: () => {
                setTimePreset('all');
                setTimeCustomOpen(false);
                setTimeQuickOpen((p) => !p);
              },
            },
            {
              val: 'custom',
              label:
                timePreset === 'custom' && timeSelectedLabel !== 'Toàn thời gian'
                  ? timeSelectedLabel
                  : 'Tùy chỉnh',
              onChange: () => {
                setTimePreset('custom');
                setTimeQuickOpen(false);
                setTimeCustomOpen((p) => !p);
              },
            },
          ].map((opt) => (
            <label
              key={opt.val}
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${
                (opt.val === 'allTime' && timePreset !== 'custom') ||
                (opt.val === 'custom' && timePreset === 'custom')
                  ? 'border border-blue-900'
                  : 'border border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="timeFilter"
                checked={opt.val === 'allTime' ? timePreset !== 'custom' : timePreset === 'custom'}
                onChange={opt.onChange}
                className="h-4 w-4 text-blue-900 focus:ring-blue-900"
              />
              <span className="flex w-full items-center justify-between text-sm text-slate-600">
                {opt.label}
                <Icon
                  name={opt.val === 'custom' ? 'calendar_today' : 'chevron_right'}
                  className="text-sm text-slate-400"
                />
              </span>
            </label>
          ))}
          {timeQuickOpen && (
            <QuickRangePopover
              onSelect={handleTimePresetSelect}
              onReset={() => {
                setTimeSelectedLabel('Toàn thời gian');
                setTimePreset('all');
                setTimeQuickOpen(false);
              }}
            />
          )}
          {timeCustomOpen && (
            <DatePickerPopup
              dateFrom={dateFrom}
              dateTo={dateTo}
              onCancel={() => setTimeCustomOpen(false)}
              onApply={handleCustomDateApply}
            />
          )}
        </div>

        {/* 3. Loại phiếu xuất */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Loại phiếu xuất
          </p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={issueTypeFilter}
            onChange={(e) => setIssueTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            {distinctIssueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Hình thức thanh toán */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Hình thức thanh toán
          </p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
          </select>
        </div>

        {/* 5. Trạng thái đồng bộ */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Trạng thái đồng bộ
          </p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={syncStatusFilter}
            onChange={(e) => setSyncStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="synced">Đã đồng bộ</option>
            <option value="not_synced">Chưa đồng bộ</option>
          </select>
        </div>

        {/* 6. Đối tượng */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Đối tượng</p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">Tất cả đối tượng</option>
            {distinctCustomers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Người lập */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Người lập</p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
          >
            <option value="">Tất cả người lập</option>
            {distinctCreators.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 8. Khoảng tiền */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Khoảng tiền</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full rounded-lg border-slate-200 px-2.5 py-2 text-sm focus:border-primary focus:ring-primary"
              placeholder="Từ"
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value)}
            />
            <span className="text-sm text-slate-400">-</span>
            <input
              type="number"
              className="w-full rounded-lg border-slate-200 px-2.5 py-2 text-sm focus:border-primary focus:ring-primary"
              placeholder="Đến"
              value={amountTo}
              onChange={(e) => setAmountTo(e.target.value)}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default GoodsIssueFilterSidebar;
