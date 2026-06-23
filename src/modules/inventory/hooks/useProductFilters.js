import { useState, useRef, useMemo } from 'react';
import { getCreatedPresetRange, getEstimatedPresetRange } from '../utils/productUtils';

export const useProductFilters = () => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdat', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState(''); // Ánh xạ thành CategoryName
  const [supplierKeyword, setSupplierKeyword] = useState(''); // Ánh xạ thành BrandName/Supplier
  const [productStatusFilter, setProductStatusFilter] = useState('active');
  const [pageSize, setPageSize] = useState(10); // Khớp default 10 của backend
  const [currentPage, setCurrentPage] = useState(1);

  // Các state UI cho Popover (Giữ nguyên của bạn)
  const [estimatedStockOutFilter, setEstimatedStockOutFilter] = useState('allTime');
  const [createdTimeFilter, setCreatedTimeFilter] = useState('allTime');
  const [estimatedQuickOpen, setEstimatedQuickOpen] = useState(false);
  const [createdQuickOpen, setCreatedQuickOpen] = useState(false);
  const [estimatedCustomOpen, setEstimatedCustomOpen] = useState(false);
  const [createdCustomOpen, setCreatedCustomOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [estimatedSelectedLabel, setEstimatedSelectedLabel] = useState('Toàn thời gian');
  const [createdSelectedLabel, setCreatedSelectedLabel] = useState('Toàn thời gian');
  const [estimatedRange, setEstimatedRange] = useState(null);
  const [createdRange, setCreatedRange] = useState(null);
  const [locationKeyword, setLocationKeyword] = useState('');
  const [itemTypeKeyword, setItemTypeKeyword] = useState('');
  const [directSaleFilter, setDirectSaleFilter] = useState('all');
  const [salesChannelFilter, setSalesChannelFilter] = useState('all');

  const estimatedRef = useRef(null);
  const createdRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // VŨ KHÍ MỚI: Tự động gom param chuẩn API Document
  const queryParams = useMemo(() => {
    const params = {
      PageNumber: currentPage,
      PageSize: pageSize,
      Sort: sortConfig.key,
      Order: sortConfig.direction,
    };

    if (search.trim()) params.SearchTerm = search.trim();
    if (groupKeyword.trim()) params.CategoryName = groupKeyword.trim();
    if (supplierKeyword.trim()) params.BrandName = supplierKeyword.trim();

    if (productStatusFilter === 'active') params.Status = 'active';
    if (productStatusFilter === 'inactive') params.Status = 'inactive';

    return params;
  }, [
    currentPage,
    pageSize,
    search,
    groupKeyword,
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
    setCurrentPage(1); // Đổi size thì reset về trang 1
  };

  return {
    queryParams, // <-- Chỉ cần truyền cái này vào useProductList
    search,
    setSearch,
    sortConfig,
    toggleSort,
    getSortIcon,
    groupKeyword,
    setGroupKeyword,
    supplierKeyword,
    setSupplierKeyword,
    productStatusFilter,
    setProductStatusFilter,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    currentPage,
    setCurrentPage,
    // ... xuất nốt các state UI râu ria khác để Modal/Sidebar ko bị lỗi
    estimatedRef,
    createdRef,
    statusDropdownRef,
    estimatedQuickOpen,
    setEstimatedQuickOpen,
    createdQuickOpen,
    setCreatedQuickOpen,
    statusDropdownOpen,
    setStatusDropdownOpen,
    estimatedCustomOpen,
    setEstimatedCustomOpen,
    createdCustomOpen,
    setCreatedCustomOpen,
    estimatedSelectedLabel,
    setEstimatedSelectedLabel,
    createdSelectedLabel,
    setCreatedSelectedLabel,
    handleEstimatedPreset: (label) => {
      setEstimatedSelectedLabel(label);
      setEstimatedRange(getEstimatedPresetRange(label));
      setEstimatedStockOutFilter('custom');
      setEstimatedQuickOpen(false);
    },
    handleCreatedPreset: (label) => {
      setCreatedSelectedLabel(label);
      setCreatedRange(getCreatedPresetRange(label));
      setCreatedTimeFilter('custom');
      setCreatedQuickOpen(false);
    },
  };
};
