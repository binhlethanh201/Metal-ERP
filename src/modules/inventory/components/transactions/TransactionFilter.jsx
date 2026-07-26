import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const filterOptions = {
  searchBy: [
    { value: 'ticketCode', label: 'Mã phiếu' },
    { value: 'productName', label: 'Tên sản phẩm' },
    { value: 'supplierName', label: 'Nhà cung cấp' },
    { value: 'customerName', label: 'Khách hàng' },
    { value: 'note', label: 'Ghi chú' },
  ],
  type: [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'INWARD', label: 'Nhập kho' },
    { value: 'OUTWARD', label: 'Xuất kho' },
  ],
  status: [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'PENDING', label: 'Đang xử lý' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ],
};

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:hover:bg-[#272727]"
      >
        <span className={selected ? 'text-slate-900 dark:text-[#e5e5e5]' : 'text-slate-400 dark:text-[#808080]'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform dark:text-[#808080] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[150px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-[#333333] dark:bg-[#0f0f0f]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-[#272727] ${
                  option.value === value
                    ? 'bg-slate-100 font-medium text-slate-900 dark:bg-[#272727] dark:text-[#e5e5e5]'
                    : 'text-slate-700 dark:text-[#b3b3b3]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const TransactionFilter = ({ onFilterChange, filters: initialFilters }) => {
  const todayString = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    searchTerm: initialFilters?.searchTerm || '',
    searchBy: initialFilters?.searchBy || 'ticketCode',
    type: initialFilters?.type || 'ALL',
    status: initialFilters?.status || 'ALL',
    dateFrom: initialFilters?.dateFrom || '',
    dateTo: initialFilters?.dateTo || todayString,
    createdBy: initialFilters?.createdBy || '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      searchTerm: '',
      searchBy: 'ticketCode',
      type: 'ALL',
      status: 'ALL',
      dateFrom: '',
      dateTo: todayString,
      createdBy: '',
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.createdBy;

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#808080]" />
            <input
              type="text"
              placeholder={`Tìm kiếm theo ${filterOptions.searchBy.find((s) => s.value === filters.searchBy)?.label}`}
              value={filters.searchTerm}
              onChange={(e) => handleChange('searchTerm', e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
            />
          </div>
        </div>

        {/* Search By Dropdown */}
        <div className="w-full lg:w-44">
          <SelectDropdown
            options={filterOptions.searchBy}
            value={filters.searchBy}
            onChange={(val) => handleChange('searchBy', val)}
            placeholder="Tìm theo..."
          />
        </div>

        {/* Type Dropdown */}
        <div className="w-full lg:w-36">
          <SelectDropdown
            options={filterOptions.type}
            value={filters.type}
            onChange={(val) => handleChange('type', val)}
            placeholder="Loại..."
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full lg:w-40">
          <SelectDropdown
            options={filterOptions.status}
            value={filters.status}
            onChange={(val) => handleChange('status', val)}
            placeholder="Trạng thái..."
          />
        </div>

        {/* Advanced Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
            showAdvanced || hasActiveFilters
              ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#b3b3b3] dark:hover:bg-[#272727]'
          }`}
        >
          <Filter className="h-4 w-4" />
          Lọc nâng cao
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
              !
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#b3b3b3] dark:hover:bg-[#272727] dark:hover:text-[#e5e5e5]"
          >
            <X className="h-4 w-4" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date From */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#999999]">Từ ngày</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#999999]">Đến ngày</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
              />
            </div>

            {/* Created By */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-[#999999]">Người tạo</label>
              <input
                type="text"
                placeholder="Tìm theo tên người tạo..."
                value={filters.createdBy}
                onChange={(e) => handleChange('createdBy', e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;
