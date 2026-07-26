import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Search, Package } from 'lucide-react';

export const ProductSearchInput = ({ products = [], onSelectProduct, formatCurrency }) => {
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return products.slice(0, 20);
    return products.filter((p) =>
      `${p.productCode} ${p.productName}`.toLowerCase().includes(keyword)
    );
  }, [products, searchText]);

  // Bắt sự kiện click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dùng useCallback để ổn định tham chiếu hàm handleSelect
  const handleSelect = useCallback(
    (product) => {
      if (!product) return;
      onSelectProduct(product);
      setSearchText('');
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onSelectProduct]
  );

  // Lắng nghe phím tắt toàn cục (F3 và các phím điều hướng Arrow/Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      }

      if (isOpen && filteredProducts.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1 >= filteredProducts.length ? 0 : prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 < 0 ? filteredProducts.length - 1 : prev - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          handleSelect(filteredProducts[selectedIndex]);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredProducts, selectedIndex, handleSelect]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#808080]" />
      <input
        ref={searchInputRef}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Tìm theo mã hoặc tên sản phẩm (F3 để focus nhanh)"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-0 focus:border-sky-500 focus:bg-white dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:focus:bg-[#1a1a1a]"
      />

      {isOpen && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]"
        >
          {filteredProducts.map((product, idx) => (
            <button
              key={product.id || idx}
              type="button"
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 dark:border-b-[#333333] ${
                selectedIndex === idx ? 'bg-sky-50 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-[#272727]'
              }`}
            >
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <Package size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
                  {product.productName} ({product.unitName || product.unit || ''})
                </div>
                <div className="mt-0.5 flex items-center gap-4 text-xs text-slate-600 dark:text-[#999999]">
                  <span className="font-medium text-slate-700 dark:text-[#b3b3b3]">Mã: {product.productCode}</span>
                  <span>Giá nhập cũ: {formatCurrency(product.costPrice)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchText && filteredProducts.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
          Không tìm thấy sản phẩm nào khớp từ khóa
        </div>
      )}
    </div>
  );
};
