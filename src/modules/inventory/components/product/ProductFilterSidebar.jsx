/**
 * Sidebar bộ lọc sản phẩm - Nhóm hàng, tồn kho, dự kiến hết, thời gian tạo,
 * nhà cung cấp, vị trí, loại hàng, bán trực tiếp, kênh bán, trạng thái.
 * Chứa DatePickerPopup và QuickRangePopover nội bộ.
 */
import MaterialIcon from '../shared/MaterialIcon';
import { estimatedQuickRanges, createdQuickRanges, statusOptions } from '../../utils/productUtils';

const DatePickerPopup = ({ onCancel, onApply }) => (
  <div className="absolute left-[calc(100%+10px)] top-14 z-30 w-[620px] rounded-xl border border-slate-200 bg-white shadow-2xl">
    <div className="px-4 pb-3 pt-4">
      <p className="text-sm text-slate-500">
        Từ ngày: <span className="font-semibold text-slate-800">17/05/2026</span> - Đến ngày:{' '}
        <span className="font-semibold text-slate-800">17/05/2026</span>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[0, 1].map((side) => (
          <div key={side}>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-lg text-slate-700">Tháng 5 2026</p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <MaterialIcon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-slate-400">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={`${side}-${d}`}>{d}</span>
              ))}
              {(side === 0
                ? [27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                : [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7]
              ).map((day) => (
                <span
                  key={`${side}-${day}`}
                  className={
                    side === 0
                      ? day < 4
                        ? 'text-slate-300'
                        : 'text-slate-700'
                      : day < 8
                        ? 'text-slate-700'
                        : 'text-slate-400'
                  }
                >
                  {day}
                </span>
              ))}
              <span className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-blue-600 font-bold text-white">
                17
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <button type="button" className="text-base font-semibold text-blue-600" onClick={onCancel}>
        Hôm nay
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-base font-semibold text-slate-600"
          onClick={onCancel}
        >
          Bỏ qua
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-base font-semibold text-white"
          onClick={onApply}
        >
          Áp dụng
        </button>
      </div>
    </div>
  </div>
);

const QuickRangePopover = ({ ranges, onSelect, onReset }) => (
  <div
    className="absolute left-[calc(100%+10px)] top-6 z-30 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
    style={{ width: ranges.length <= 3 ? '500px' : '740px' }}
  >
    <div className={`grid gap-4 ${ranges.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
      {ranges.map((col) => (
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

const ProductFilterSidebar = ({ isCollapsed, onToggleCollapse, filters }) => {
  const {
    groupKeyword,
    setGroupKeyword,
    stockFilter,
    setStockFilter,
    estimatedStockOutFilter,
    estimatedSelectedLabel,
    estimatedQuickOpen,
    estimatedCustomOpen,
    estimatedRef,
    setEstimatedStockOutFilter,
    setEstimatedRange,
    setEstimatedCustomOpen,
    setEstimatedQuickOpen,
    createdTimeFilter,
    createdSelectedLabel,
    createdQuickOpen,
    createdCustomOpen,
    createdRef,
    setCreatedTimeFilter,
    setCreatedRange,
    setCreatedCustomOpen,
    setCreatedQuickOpen,
    supplierKeyword,
    setSupplierKeyword,
    locationKeyword,
    setLocationKeyword,
    itemTypeKeyword,
    setItemTypeKeyword,
    directSaleFilter,
    setDirectSaleFilter,
    salesChannelFilter,
    setSalesChannelFilter,
    productStatusFilter,
    setProductStatusFilter,
    statusDropdownOpen,
    setStatusDropdownOpen,
    statusDropdownRef,
    handleEstimatedPreset,
    handleCreatedPreset,
    setEstimatedSelectedLabel,
    setCreatedSelectedLabel,
  } = filters;

  const triToggle = (val, set) => (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
      {['all', 'yes', 'no'].map((v) => (
        <button
          key={v}
          type="button"
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${val === v ? 'bg-blue-600 font-bold text-white' : 'text-slate-600'}`}
          onClick={() => set(v)}
        >
          {v === 'all' ? 'Tất cả' : v === 'yes' ? 'Có' : 'Không'}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={`fixed left-[260px] top-[148px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all duration-300 hover:scale-110 ${isCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => onToggleCollapse(false)}
      >
        <MaterialIcon name="chevron_right" className="text-[18px]" />
      </button>

      <aside
        className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'}`}
      >
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <MaterialIcon name="chevron_left" className="text-[18px]" />
        </button>

        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhóm hàng</h3>
          <button type="button" className="text-xs font-bold text-blue-900 hover:underline">
            Tạo mới
          </button>
        </div>

        <input
          className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Chọn nhóm hàng"
          value={groupKeyword}
          onChange={(e) => setGroupKeyword(e.target.value)}
        />

        <div className="mb-6 mt-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Tồn kho</p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="inStock">Còn hàng</option>
            <option value="outStock">Hết hàng</option>
          </select>
        </div>

        {/* Estimated Stock Out */}
        <div className="relative mb-6 space-y-2" ref={estimatedRef}>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Dự kiến hết hàng
          </p>
          {[
            {
              val: 'allTime',
              label: estimatedSelectedLabel,
              onChange: () => {
                setEstimatedStockOutFilter('allTime');
                setEstimatedRange(null);
                setEstimatedCustomOpen(false);
                setEstimatedQuickOpen((p) => !p);
              },
            },
            {
              val: 'custom',
              label: 'Tùy chỉnh',
              onChange: () => {
                setEstimatedStockOutFilter('custom');
                setEstimatedQuickOpen(false);
                setEstimatedCustomOpen((p) => !p);
              },
            },
          ].map((opt) => (
            <label
              key={opt.val}
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${estimatedStockOutFilter === opt.val ? 'border border-blue-900' : 'border border-slate-200'}`}
            >
              <input
                type="radio"
                name="estimatedStockOut"
                checked={estimatedStockOutFilter === opt.val}
                onChange={opt.onChange}
                className="h-4 w-4 text-blue-900 focus:ring-blue-900"
              />
              <span className="flex w-full items-center justify-between text-sm text-slate-600">
                {opt.label}
                <MaterialIcon
                  name={opt.val === 'custom' ? 'calendar_today' : 'chevron_right'}
                  className="text-sm text-slate-400"
                />
              </span>
            </label>
          ))}
          {estimatedQuickOpen && (
            <QuickRangePopover
              ranges={estimatedQuickRanges}
              onSelect={handleEstimatedPreset}
              onReset={() => {
                setEstimatedSelectedLabel('Toàn thời gian');
                setEstimatedRange(null);
                setEstimatedStockOutFilter('allTime');
                setEstimatedQuickOpen(false);
              }}
            />
          )}
          {estimatedCustomOpen && (
            <DatePickerPopup
              onCancel={() => setEstimatedCustomOpen(false)}
              onApply={() => {
                setEstimatedSelectedLabel('17/05/2026 - 17/05/2026');
                setEstimatedRange({
                  start: new Date(2026, 4, 17),
                  end: new Date(2026, 4, 17, 23, 59, 59, 999),
                });
                setEstimatedStockOutFilter('custom');
                setEstimatedCustomOpen(false);
              }}
            />
          )}
        </div>

        {/* Created Time */}
        <div className="relative mb-6 space-y-2" ref={createdRef}>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
              Thời gian tạo
            </p>
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
          {[
            {
              val: 'allTime',
              label: createdSelectedLabel,
              onChange: () => {
                setCreatedTimeFilter('allTime');
                setCreatedRange(null);
                setCreatedCustomOpen(false);
                setCreatedQuickOpen((p) => !p);
              },
            },
            {
              val: 'custom',
              label:
                createdSelectedLabel === 'Toàn thời gian'
                  ? '17/05/2026 - 17/05/2026'
                  : createdSelectedLabel,
              onChange: () => {
                setCreatedTimeFilter('custom');
                setCreatedQuickOpen(false);
                setCreatedCustomOpen((p) => !p);
              },
            },
          ].map((opt) => (
            <label
              key={opt.val}
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${createdTimeFilter === opt.val ? 'border border-blue-900' : 'border border-slate-200'}`}
            >
              <input
                type="radio"
                name="createdTime"
                checked={createdTimeFilter === opt.val}
                onChange={opt.onChange}
                className="h-4 w-4 text-blue-900 focus:ring-blue-900"
              />
              <span className="flex w-full items-center justify-between text-sm text-slate-600">
                {opt.label}
                <MaterialIcon
                  name={opt.val === 'custom' ? 'calendar_today' : 'chevron_right'}
                  className="text-sm text-slate-400"
                />
              </span>
            </label>
          ))}
          {createdQuickOpen && (
            <QuickRangePopover
              ranges={createdQuickRanges}
              onSelect={handleCreatedPreset}
              onReset={() => {
                setCreatedSelectedLabel('Toàn thời gian');
                setCreatedRange(null);
                setCreatedTimeFilter('allTime');
                setCreatedQuickOpen(false);
              }}
            />
          )}
          {createdCustomOpen && (
            <DatePickerPopup
              onCancel={() => setCreatedCustomOpen(false)}
              onApply={() => {
                setCreatedSelectedLabel('17/05/2026 - 17/05/2026');
                setCreatedRange({
                  start: new Date(2026, 4, 17),
                  end: new Date(2026, 4, 17, 23, 59, 59, 999),
                });
                setCreatedTimeFilter('custom');
                setCreatedCustomOpen(false);
              }}
            />
          )}
        </div>

        {/* Supplier */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhà cung cấp</p>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
            placeholder="Chọn nhà cung cấp"
            value={supplierKeyword}
            onChange={(e) => setSupplierKeyword(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Vị trí</p>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
            placeholder="Chọn vị trí"
            value={locationKeyword}
            onChange={(e) => setLocationKeyword(e.target.value)}
          />
        </div>

        {/* Item Type */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Loại hàng</p>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
            placeholder="Chọn loại hàng"
            value={itemTypeKeyword}
            onChange={(e) => setItemTypeKeyword(e.target.value)}
          />
        </div>

        {/* Direct Sale */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Bán trực tiếp</p>
          {triToggle(directSaleFilter, setDirectSaleFilter)}
        </div>

        {/* Sales Channel */}
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Liên kết kênh bán
          </p>
          {triToggle(salesChannelFilter, setSalesChannelFilter)}
        </div>

        {/* Status Dropdown */}
        <div className="relative space-y-2" ref={statusDropdownRef}>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Trạng thái hàng hóa
          </p>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-800"
            onClick={() => setStatusDropdownOpen((p) => !p)}
          >
            <span>{statusOptions.find((o) => o.value === productStatusFilter)?.label}</span>
            <MaterialIcon
              name={statusDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              className="text-[18px]"
            />
          </button>
          {statusDropdownOpen && (
            <div className="absolute left-0 right-0 top-[58px] z-30 rounded-lg border border-slate-200 bg-white py-2 shadow-2xl">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                  onClick={() => {
                    setProductStatusFilter(opt.value);
                    setStatusDropdownOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {productStatusFilter === opt.value && (
                    <MaterialIcon name="check" className="text-[18px] text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ProductFilterSidebar;
