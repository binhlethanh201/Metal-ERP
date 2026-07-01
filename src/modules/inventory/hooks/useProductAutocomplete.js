/**
 * Hook quản lý Autocomplete sản phẩm cho dòng xuất kho.
 * Xử lý: tìm kiếm realtime, hiển thị dropdown grid, chọn sản phẩm.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { productListForExport } from '../data/goodsIssueMockData';

export const useProductAutocomplete = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setActiveLineId(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filterProducts = useCallback((keyword) => {
    if (!keyword || !keyword.trim()) {
      setResults(productListForExport.slice(0, 20));
      return;
    }
    const kw = keyword.trim().toLowerCase();
    const filtered = productListForExport.filter(
      (p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
    );
    setResults(filtered.slice(0, 20));
  }, []);

  const openSearch = useCallback(
    (lineId, currentCode = '') => {
      setActiveLineId(lineId);
      setSearchText(currentCode || '');
      setActiveIndex(-1);
      setIsOpen(true);
      filterProducts(currentCode || '');
    },
    [filterProducts]
  );

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setActiveLineId(null);
    setSearchText('');
    setResults([]);
    setActiveIndex(-1);
  }, []);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchText(value);
      filterProducts(value);
      setActiveIndex(-1);
    },
    [filterProducts]
  );

  const handleKeyDown = useCallback(
    (e, onSelect) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        onSelect(results[activeIndex]);
        closeSearch();
      } else if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'F9') {
        e.preventDefault();
      } else if (e.key === 'F3') {
        e.preventDefault();
      }
    },
    [results, activeIndex, closeSearch]
  );

  return {
    searchText,
    setSearchText: handleSearchChange,
    results,
    isOpen,
    activeLineId,
    activeIndex,
    dropdownRef,
    inputRef,
    openSearch,
    closeSearch,
    handleKeyDown,
  };
};

export default useProductAutocomplete;
