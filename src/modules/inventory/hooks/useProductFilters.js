import { useState, useMemo } from 'react';

export const useProductFilters = () => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdat', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState('');
  const [brandKeyword, setBrandKeyword] = useState('');
  // Mặc định 'all' = không lọc gì (khớp option "Tất cả" trong UI select).
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Query params gửi lên API — chỉ bao gồm những tham số API thực sự hỗ trợ.
  // Không đưa filter ngày tháng (dự kiến hết hàng / thời gian tạo) vào đây
  // vì tài liệu API không có param tương ứng cho ProductsController.
  const queryParams = useMemo(() => {
    const params = {
      pageNumber: currentPage,
      pageSize,
      sort: sortConfig.key,
      order: sortConfig.direction,
    };
    if (search.trim()) params.searchTerm = search.trim();
    // categoryName: API lọc theo equals, nên phải gửi đúng tên chính xác.
    // ProductFilterSidebar dùng <select> từ API nên đảm bảo luôn đúng.
    if (groupKeyword.trim()) params.categoryName = groupKeyword.trim();
    if (brandKeyword.trim()) params.brandName = brandKeyword.trim();
    // status chỉ gửi khi là 'active' hoặc 'inactive'; 'all' = bỏ param (không lọc).
    if (productStatusFilter === 'active' || productStatusFilter === 'inactive') {
      params.status = productStatusFilter;
    }
    return params;
  }, [currentPage, pageSize, search, groupKeyword, brandKeyword, productStatusFilter, sortConfig]);

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
