import { useState } from 'react';
import { Filter, RotateCcw, Layers } from 'lucide-react';
import { getLocalDateString } from '../../../../shared/utils/formatDate';
import { Button } from '../../../../shared/components/Button';
import Drawer from '../../../../shared/components/Drawer';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:disabled:bg-[#1a1a1a]';

const FilterField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">{label}</label>
    {children}
  </div>
);

export const InventoryFilterBar = ({
  type = 'INWARD',
  filters,
  onChangeFilter,
  onResetFilter,
  branches = [],
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const ticketTypes =
    type === 'INWARD'
      ? [
        { value: '', label: 'Tất cả loại nhập' },
        { value: 'PURCHASE', label: 'Nhập hàng từ NCC' },
        { value: 'CUSTOMER_RETURN', label: 'Khách hàng trả lại' },
      ]
      : [
        { value: '', label: 'Tất cả loại xuất' },
        { value: 'RETURN_SUPPLIER', label: 'Trả hàng cho NCC' },
        { value: 'WRITE_OFF', label: 'Xuất hủy / Hao hụt' },
        { value: 'TRANSFER', label: 'Xuất điều chuyển nội bộ' },
      ];

  // Đếm số lượng bộ lọc đang áp dụng (ẩn trong Drawer) để hiển thị Badge
  const todayString = getLocalDateString();
  let activeFilterCount = 0;
  if (filters.ticketType) activeFilterCount++;
  if (filters.fromDate) activeFilterCount++;
  if (filters.toDate && filters.toDate !== todayString) activeFilterCount++;
  if (filters.branchId) activeFilterCount++;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all dark:border-[#333333] dark:bg-[#1a1a1a]/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Bộ lọc trạng thái (Truy cập nhanh) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
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

        {/* Các nút thao tác */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Layers size={14} className="text-[#004785]" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {(filters.status ||
            filters.ticketType ||
            filters.fromDate ||
            filters.toDate !== todayString ||
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

      {/* Drawer chứa bộ lọc nâng cao */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Bộ lọc phiếu kho"
        widthClass="max-w-sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onResetFilter();
                setIsDrawerOpen(false);
              }}
            >
              Đặt lại
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Đóng
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <FilterField label="Phân loại phiếu">
            <select
              value={filters.ticketType || ''}
              onChange={(e) => onChangeFilter('ticketType', e.target.value)}
              className={inputClass}
            >
              {ticketTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Từ ngày">
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => onChangeFilter('fromDate', e.target.value)}
              className={inputClass}
            />
          </FilterField>

          <FilterField label="Đến ngày">
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => onChangeFilter('toDate', e.target.value)}
              className={inputClass}
            />
          </FilterField>

          {branches && branches.length > 0 && (
            <FilterField label="Chi nhánh">
              <select
                value={filters.branchId || ''}
                onChange={(e) => onChangeFilter('branchId', e.target.value)}
                className={inputClass}
              >
                <option value="">-- Tất cả chi nhánh --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </FilterField>
          )}
        </div>
      </Drawer>
    </div>
  );
};
