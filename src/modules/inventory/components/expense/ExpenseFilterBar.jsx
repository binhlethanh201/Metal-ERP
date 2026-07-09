import React from 'react';
import { Button } from '../../../../shared/components/Button';
import { Drawer } from '../../../../shared/components/Drawer';
import { Input } from '../../../../shared/components/Input';
import { Filter, RefreshCw, Layers, RotateCcw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdat', label: 'Ngày tạo' },
  { value: 'code', label: 'Mã phiếu' },
  { value: 'amount', label: 'Số tiền' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'category', label: 'Nhóm chi phí' },
];

const ExpenseFilterBar = ({
  status,
  setStatus,
  categoryId,
  setCategoryId,
  supplierId,
  setSupplierId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sort,
  setSort,
  order,
  setOrder,
  setPageNumber,
  refetch,
  loading,
  categories,
  suppliers,
  showFilterDrawer,
  setShowFilterDrawer,
}) => {
  let activeFilterCount = 0;
  if (categoryId) activeFilterCount++;
  if (supplierId) activeFilterCount++;
  if (fromDate) activeFilterCount++;
  if (toDate) activeFilterCount++;
  if (sort && sort !== 'createdat') activeFilterCount++;

  const handleReset = () => {
    setCategoryId('');
    setSupplierId('');
    setFromDate('');
    setToDate('');
    setStatus('ALL');
    setSort('createdat');
    setOrder('desc');
    setPageNumber(1);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter size={14} /> Trạng thái:
          </span>
          {[
            { value: 'ALL', label: 'Tất cả' },
            { value: 'PENDING', label: 'Chờ xác nhận' },
            { value: 'COMPLETED', label: 'Đã xác nhận' },
            { value: 'CANCELLED', label: 'Đã hủy' },
          ].map((item) => {
            const isActive = status === item.value;
            return (
              <Button
                key={item.value}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatus(item.value);
                  setPageNumber(1);
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterDrawer(true)}
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

          {(categoryId ||
            supplierId ||
            fromDate ||
            toDate ||
            (status && status !== 'ALL') ||
            sort !== 'createdat') && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
              title="Xóa toàn bộ bộ lọc"
            >
              <RotateCcw size={13} /> Đặt lại
            </Button>
          )}
        </div>
      </div>

      <Drawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Bộ lọc phiếu chi"
        widthClass="max-w-sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowFilterDrawer(false)}>
              Đóng
            </Button>
            <Button variant="primary" onClick={() => setShowFilterDrawer(false)}>
              Áp dụng
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhóm chi phí</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="">Tất cả nhóm chi phí</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="">Tất cả nhà cung cấp</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Từ ngày</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Đến ngày</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Sắp xếp theo</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Thứ tự</label>
            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ExpenseFilterBar;
