import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const GROUP_COLORS = {
  'Ca nhan': 'info',
  'Doanh nghiep': 'primary',
  'Dai ly': 'warning',
  'Nha thau': 'success',
};

const CustomerBar = ({ selectedCustomer, onOpenPicker, onClearCustomer }) => (
  <div className="mb-4 flex items-center gap-3">
    <button
      type="button"
      onClick={onOpenPicker}
      className="flex flex-1 items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-left transition-all hover:border-[#004785] hover:bg-blue-50/50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004785] text-sm font-bold text-white">
        {selectedCustomer ? selectedCustomer.name.charAt(0).toUpperCase() : 'L'}
      </div>
      <div className="flex-1">
        {selectedCustomer ? (
          <>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{selectedCustomer.name}</p>
              <Badge variant={GROUP_COLORS[selectedCustomer.group] || 'secondary'} size="sm">
                {selectedCustomer.group}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {selectedCustomer.phone} - {formatCurrency(selectedCustomer.totalSpent)} -{' '}
              {selectedCustomer.orderCount} don
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-500">Khách lẻ</p>
            <p className="text-xs text-slate-400">Bấm để chọn khách hàng</p>
          </>
        )}
      </div>
      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {selectedCustomer && (
      <button
        type="button"
        onClick={onClearCustomer}
        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
        title="Bỏ chọn khách hàng"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )}
  </div>
);

export default CustomerBar;
