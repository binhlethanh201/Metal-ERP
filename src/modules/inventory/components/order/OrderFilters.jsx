import React from 'react';
import { Button } from '../../../../shared/components/Button';
import { QUICK_DATE_OPTIONS } from '../../data/orderPageData';

const OrderFilters = ({
  dateCriteria,
  setDateCriteria,
  quickDate,
  handleQuickDateChange,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedTags,
  onOpenLabelFilter,
  onFetchData,
  isFetching,
  onOpenColumnModal,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2">
      <select
        value={dateCriteria}
        onChange={(e) => {
          setDateCriteria(e.target.value);
        }}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
      >
        <option value="Ngày giao hàng">Ngày giao hàng</option>
        <option value="Ngày tạo đơn">Ngày tạo đơn</option>
        <option value="Ngày hóa đơn">Ngày hóa đơn</option>
      </select>
      <select
        value={quickDate}
        onChange={(e) => handleQuickDateChange(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
      >
        {QUICK_DATE_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="text-xs text-slate-500 dark:text-[#999999]">Từ ngày</span>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => {
          setFromDate(e.target.value);
        }}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
      />
      <span className="text-xs text-slate-500 dark:text-[#999999]">Đến ngày</span>
      <input
        type="date"
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
        }}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
      />
      <Button variant="outline" size="sm" onClick={onOpenLabelFilter}>
        Lọc nhãn {selectedTags.length > 0 && `(${selectedTags.length})`}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onFetchData}
        disabled={isFetching}
        className="border-[#004785] text-[#004785] disabled:opacity-60"
      >
        {isFetching ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#004785] border-t-transparent" />
            Đang tải...
          </span>
        ) : (
          'Lấy dữ liệu'
        )}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenColumnModal}
        className="ml-auto"
        title="Cấu hình cột"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </Button>
    </div>
  );
};

export default OrderFilters;
