import { useState, useRef, useMemo } from 'react';
import { getCreatedPresetRange, getEstimatedPresetRange } from '../utils/productUtils';

export const useProductFilters = () => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdat', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState('');
  const [supplierKeyword, setSupplierKeyword] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('active');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
  const [stockFilter, setStockFilter] = useState('all');

  const estimatedRef = useRef(null);
  const createdRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const queryParams = useMemo(() => {
    const params = {
      PageNumber: currentPage,
      PageSize: pageSize,
      Sort: sortConfig.key,
      Order: sortConfig.direction,
    };
    if (search.trim()) params.SearchTerm = search.trim();
    if (groupKeyword.trim()) params.CategoryName = groupKeyword.trim();
    if (supplierKeyword.trim()) params.supplierId = supplierKeyword.trim();
    if (productStatusFilter === 'active') params.status = 'active';
    if (productStatusFilter === 'inactive') params.status = 'inactive';

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
    supplierKeyword,
    setSupplierKeyword,
    productStatusFilter,
    setProductStatusFilter,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    currentPage,
    setCurrentPage,

    // --- BỔ SUNG ĐẦY ĐỦ CÁC STATE BỊ THIẾU ĐỂ XÓA WARNING ---
    estimatedStockOutFilter,
    setEstimatedStockOutFilter,
    createdTimeFilter,
    setCreatedTimeFilter,
    estimatedRange,
    setEstimatedRange,
    createdRange,
    setCreatedRange,
    locationKeyword,
    setLocationKeyword,
    itemTypeKeyword,
    setItemTypeKeyword,
    directSaleFilter,
    setDirectSaleFilter,
    salesChannelFilter,
    setSalesChannelFilter,
    stockFilter,
    setStockFilter,
    // --------------------------------------------------------

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
