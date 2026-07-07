import { useState } from 'react';
import { Filter, RotateCcw, Calendar, Tag, Layers } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';

export const InventoryFilterBar = ({
  type = 'INWARD',
  filters,
  onChangeFilter,
  onResetFilter,
  branches = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ticketTypes =
    type === 'INWARD'
      ? [
          { value: '', label: 'Tất cả loại nhập' },
          { value: 'PURCHASE', label: 'Nhập hàng từ NCC' },
          { value: 'CUSTOMER_RETURN', label: 'Khách hàng trả lại' },
          { value: 'BALANCE_ADJUST', label: 'Cân bằng kiểm kho' },
        ]
      : [
          { value: '', label: 'Tất cả loại xuất' },
          { value: 'RETURN_SUPPLIER', label: 'Trả hàng cho NCC' },
          { value: 'WRITE_OFF', label: 'Xuất hủy / Hao hụt' },
          { value: 'TRANSFER', label: 'Xuất điều chuyển nội bộ' },
        ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter size={14} /> Lọc trạng thái:
          </span>
          {[
            { value: '', label: 'Mặc định' },
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'COMPLETED', label: 'Hoàn tất' },
            { value: 'CANCELLED', label: 'Đã hủy' },
            { value: 'ALL', label: 'Hiển thị tất cả' },
          ].map((item) => {
            const isActive = (filters.status || '') === item.value;
            return (
              <Button
                key={item.value}
                type="button"
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChangeFilter('status', item.value)}
              >
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5"
          >
            <Layers size={14} className="text-[#004785]" />
            {isExpanded ? 'Thu gọn bộ lọc' : 'Lọc nâng cao'}
          </Button>

          {(filters.status ||
            filters.ticketType ||
            filters.fromDate ||
            filters.toDate ||
            filters.branchId) && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onResetFilter}
              className="flex items-center gap-1"
              title="Xóa toàn bộ bộ lọc"
            >
              <RotateCcw size={13} /> Đặt lại
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-3 duration-200 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Tag size={13} /> Phân loại phiếu:
            </label>
            <select
              value={filters.ticketType || ''}
              onChange={(e) => onChangeFilter('ticketType', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-[#004785]"
            >
              {ticketTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Calendar size={13} /> Từ ngày:
            </label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => onChangeFilter('fromDate', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-[#004785]"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
              <Calendar size={13} /> Đến ngày:
            </label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => onChangeFilter('toDate', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-[#004785]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
