import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import Icon from '../../../../shared/components/Icon';

const GROUP_COLORS = {
  'Ca nhan': 'info',
  'Doanh nghiep': 'primary',
  'Dai ly': 'warning',
  'Nha thau': 'success',
};

const CustomerBar = ({ selectedCustomer, onOpenPicker, onClearCustomer, onQuickAdd }) => (
  <div className="mb-4 flex items-center gap-3">
    <button
      type="button"
      onClick={onOpenPicker}
      className="flex flex-1 items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-left transition-all hover:border-[#004785] hover:bg-blue-50/50 dark:border-[#404040] dark:hover:bg-blue-900/20"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white">
        {selectedCustomer ? selectedCustomer.name.charAt(0).toUpperCase() : 'L'}
      </div>
      <div className="flex-1">
        {selectedCustomer ? (
          <>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">{selectedCustomer.name}</p>
              <Badge variant={GROUP_COLORS[selectedCustomer.group] || 'secondary'} size="sm">
                {selectedCustomer.group}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#999999]">
              {selectedCustomer.phone} - {formatCurrency(selectedCustomer.totalSpent)} -{' '}
              {selectedCustomer.orderCount} don
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-500 dark:text-[#999999]">Khách lẻ</p>
            <p className="text-xs text-slate-400 dark:text-[#808080]">Bấm để chọn khách hàng</p>
          </>
        )}
      </div>
      <svg className="h-5 w-5 text-slate-400 dark:text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {onQuickAdd && (
      <button
        type="button"
        onClick={onQuickAdd}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#004785] px-4 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-800 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
        title="Thêm nhanh khách hàng"
      >
        <Icon name="add" size={16} />
        <span>Thêm khách</span>
      </button>
    )}
  </div>
);

export default CustomerBar;