import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Package } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

export const ProductSearch = ({ products, onSelectProduct }) => {
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return products.slice(0, 6);
    return products.filter((product) =>
      `${product.productCode} ${product.productName}`.toLowerCase().includes(keyword)
    );
  }, [products, searchText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setSelectedDropdownIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F3') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (isDropdownOpen && filteredProducts.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedDropdownIndex((prev) => (prev + 1 >= filteredProducts.length ? 0 : prev + 1));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedDropdownIndex((prev) =>
            prev - 1 < 0 ? filteredProducts.length - 1 : prev - 1
          );
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (selectedDropdownIndex >= 0 && selectedDropdownIndex < filteredProducts.length) {
            onSelectProduct(filteredProducts[selectedDropdownIndex]);
            setIsDropdownOpen(false);
            setSearchText('');
          }
        } else if (event.key === 'Escape') {
          setIsDropdownOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, selectedDropdownIndex, filteredProducts, onSelectProduct]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={searchInputRef}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
        placeholder="Tìm theo mã hoặc tên sản phẩm (Nhấn F3)"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-0"
      />

      {isDropdownOpen && filteredProducts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          {filteredProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelectProduct(product);
                setIsDropdownOpen(false);
                setSearchText('');
              }}
              onMouseEnter={() => setSelectedDropdownIndex(index)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                selectedDropdownIndex === index ? 'bg-sky-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">
                  {product.productName} ({product.unitName})
                </div>
                <div className="mt-0.5 flex gap-4 text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Mã: {product.productCode}</span>
                  <span>Giá chuẩn: {formatCurrency(product.costPrice)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
