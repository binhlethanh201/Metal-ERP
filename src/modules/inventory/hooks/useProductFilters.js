import { useState, useMemo } from 'react';

export const useProductFilters = () => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdat', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState('');
  const [brandKeyword, setBrandKeyword] = useState('');
  const [supplierKeyword, setSupplierKeyword] = useState('');
  // Mặc định 'all' để KHÔNG lọc gì cả (khớp với option "Tất cả" trong UI).
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20); // Chuẩn API default là 20
  const [currentPage, setCurrentPage] = useState(1);

  // Chuẩn hóa 100% camelCase Query Params khớp bản API mới
  const queryParams = useMemo(() => {
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
      sort: sortConfig.key,
      order: sortConfig.direction,
    };
    if (search.trim()) params.searchTerm = search.trim();
    if (groupKeyword.trim()) params.categoryName = groupKeyword.trim();
    if (brandKeyword.trim()) params.brandName = brandKeyword.trim();
    if (supplierKeyword.trim()) params.supplierId = supplierKeyword.trim();
    // status chỉ được gửi khi là 'active' hoặc 'inactive'; 'all' nghĩa là không lọc.
    if (productStatusFilter === 'active' || productStatusFilter === 'inactive') {
      params.status = productStatusFilter;
    }
    return params;
  }, [
    currentPage,
    pageSize,
    search,
    groupKeyword,
    brandKeyword,
    supplierKeyword,
    productStatusFilter,
    sortConfig,
  ]);

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    queryParams,
    search,
    setSearch,
    sortConfig,
    toggleSort,
    getSortIcon,
    groupKeyword,
    setGroupKeyword,
    brandKeyword,
    setBrandKeyword,
    supplierKeyword,
    setSupplierKeyword,
    productStatusFilter,
    setProductStatusFilter,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    currentPage,
    setCurrentPage,
  };
};

export default useProductFilters;
