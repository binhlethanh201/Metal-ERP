/**
 * Sidebar bộ lọc sản phẩm - Nhóm hàng, tồn kho, dự kiến hết, thời gian tạo,
 * nhà cung cấp, vị trí, loại hàng, bán trực tiếp, kênh bán, trạng thái.
 */
import Icon from '../../../../shared/components/Icon';
import { DatePickerPopup, QuickRangePopover } from './popovers/FilterPopovers';
import { estimatedQuickRanges, createdQuickRanges, statusOptions } from '../../utils/productUtils';

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
        <Icon name="chevron_right" className="text-[18px]" />
      </button>

      <aside
        className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'}`}
      >
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>

        {/* Header Bộ lọc + Reset */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Bộ lọc</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              setGroupKeyword('');
              setStockFilter('all');
              setEstimatedStockOutFilter('allTime');
              setEstimatedSelectedLabel('Toàn thời gian');
              setCreatedTimeFilter('allTime');
              setCreatedSelectedLabel('Toàn thời gian');
              setSupplierKeyword('');
              setLocationKeyword('');
              setItemTypeKeyword('');
              setDirectSaleFilter('all');
              setSalesChannelFilter('all');
              setProductStatusFilter('all');
            }}
            title="Xóa bộ lọc"
          >
            <Icon name="cached" size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setProductStatusFilter('draft')}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
        >
          <Icon name="description" size={16} />
          Bản nháp
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
                <Icon
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
                <Icon
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
            <Icon
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
                    <Icon name="check" className="text-[18px] text-blue-600" />
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
