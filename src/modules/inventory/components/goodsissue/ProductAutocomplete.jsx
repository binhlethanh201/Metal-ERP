/**
 * ProductAutocomplete - Dropdown thông minh chọn hàng hóa cho dòng xuất kho.
 * Hiển thị Grid Dropdown với Mã HH | Tên HH | Tồn kho.
 * Hỗ trợ filter realtime, phím tắt, F9 thêm mới, F3 tìm nhanh.
 */
import { useRef, useEffect } from 'react';

const ProductAutocomplete = ({
  searchText,
  onSearchChange,
  results,
  isOpen,
  activeIndex,
  dropdownRef,
  inputRef,
  onSelect,
  onClose,
  onKeyDown,
  onQuickAdd,
  onAdvancedSearch,
}) => {
  const localInputRef = useRef(null);

  const inputEl = inputRef || localInputRef;

  useEffect(() => {
    if (isOpen && inputEl.current) {
      inputEl.current.focus();
    }
  }, [isOpen, inputEl]);

  const handleSelect = (product) => {
    onSelect(product);
    onClose();
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputEl}
        type="text"
        className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
        placeholder="Nhập mã hoặc tên..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => onSearchChange(searchText)}
        onKeyDown={(e) => onKeyDown(e, handleSelect)}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 z-[150] mt-1 w-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-[#333333] dark:bg-[#1a1a1a]"
        >
          {/* Grid Header */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
            <span className="w-[120px] shrink-0">Mã HH</span>
            <span className="flex-1">Tên HH</span>
            <span className="w-[100px] shrink-0 text-right">Tồn kho</span>
          </div>

          {/* Results */}
          <div className="max-h-[280px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
                Khong tim thay hang hoa
              </div>
            ) : (
              results.map((product, idx) => (
                <button
                  key={product.id}
                  type="button"
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                    idx === activeIndex
                      ? 'bg-blue-50 text-blue-900 dark:bg-[#272727] dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-[#b3b3b3] dark:hover:bg-[#333333]'
                  } ${idx < results.length - 1 ? 'border-b border-slate-100 dark:border-[#333333]' : ''}`}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => {
                    // viSửal hover sync; actual index managed by parent via onKeyDown
                  }}
                >
                  <span className="w-[120px] shrink-0 font-mono font-semibold text-slate-800 dark:text-[#e5e5e5]">
                    {product.code}
                  </span>
                  <span className="flex-1 dark:text-[#d4d4d4]">{product.name}</span>
                  <span className="w-[100px] shrink-0 text-right tabular-nums dark:text-[#b3b3b3]">
                    {product.stock != null ? product.stock.toLocaleString('vi-VN') : '-'}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-[#333333]"
              onClick={onQuickAdd}
            >
              <span className="text-base leading-none">+</span>
              <span>Thêm mới (F9)</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              onClick={onAdvancedSearch}
            >
              <span className="text-base leading-none">Q</span>
              <span>Tìm nhanh (F3)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAutocomplete;
