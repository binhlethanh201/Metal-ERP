/**
 * Hook quản lý tất cả state bộ lọc + sort + phân trang cho ProductManagement.
 * Export: search, sortConfig, filter states, pagination, filteredRows (đã lọc + sắp xếp).
 */
import { useState, useRef, useMemo } from 'react';
import {
  parseDateTime,
  getCreatedPresetRange,
  getEstimatedPresetRange,
} from '../utils/productUtils';

export const useProductFilters = (products = []) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'desc' });
  const [groupKeyword, setGroupKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
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
  const [supplierKeyword, setSupplierKeyword] = useState('');
  const [locationKeyword, setLocationKeyword] = useState('');
  const [itemTypeKeyword, setItemTypeKeyword] = useState('');
  const [directSaleFilter, setDirectSaleFilter] = useState('all');
  const [salesChannelFilter, setSalesChannelFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('active');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const estimatedRef = useRef(null);
  const createdRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const filteredRows = useMemo(() => {
    const filtered = products.filter((row) => {
      const q = search.trim().toLowerCase();
      if (
        q &&
        !String(row.productCode || row.id || '')
          .toLowerCase()
          .includes(q) &&
        !row.name.toLowerCase().includes(q)
      )
        return false;
      if (
        groupKeyword.trim() &&
        !row.group.toLowerCase().includes(groupKeyword.trim().toLowerCase())
      )
        return false;
      if (
        supplierKeyword.trim() &&
        !row.supplier.toLowerCase().includes(supplierKeyword.trim().toLowerCase())
      )
        return false;
      if (
        locationKeyword.trim() &&
        !row.location.toLowerCase().includes(locationKeyword.trim().toLowerCase())
      )
        return false;
      if (
        itemTypeKeyword.trim() &&
        !row.itemType.toLowerCase().includes(itemTypeKeyword.trim().toLowerCase())
      )
        return false;
      if (stockFilter === 'inStock' && row.stock <= 0) return false;
      if (stockFilter === 'outStock' && row.stock > 0) return false;
      if (directSaleFilter === 'yes' && !row.directSale) return false;
      if (directSaleFilter === 'no' && row.directSale) return false;
      if (salesChannelFilter === 'yes' && !row.salesChannelLinked) return false;
      if (salesChannelFilter === 'no' && row.salesChannelLinked) return false;
      if (productStatusFilter === 'active' && row.productStatus !== 'active') return false;
      if (productStatusFilter === 'inactive' && row.productStatus !== 'inactive') return false;
      if (productStatusFilter === 'draft' && row.productStatus !== 'draft') return false;
      if (createdRange) {
        const d = parseDateTime(row.createdAt);
        if (!d || d < createdRange.start || d > createdRange.end) return false;
      }
      if (estimatedRange) {
        const d = parseDateTime(row.estimatedOutAt);
        if (!d || d < estimatedRange.start || d > estimatedRange.end) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      const compare = `${valueA}`.localeCompare(`${valueB}`, 'vi');
      return sortConfig.direction === 'asc' ? compare : -compare;
    });
  }, [
    products,
    search,
    sortConfig,
    groupKeyword,
    stockFilter,
    supplierKeyword,
    locationKeyword,
    itemTypeKeyword,
    directSaleFilter,
    salesChannelFilter,
    productStatusFilter,
    createdRange,
    estimatedRange,
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

  const handleEstimatedPreset = (label) => {
    setEstimatedSelectedLabel(label);
    setEstimatedRange(getEstimatedPresetRange(label));
    setEstimatedStockOutFilter('custom');
    setEstimatedQuickOpen(false);
  };

  const handleCreatedPreset = (label) => {
    setCreatedSelectedLabel(label);
    setCreatedRange(getCreatedPresetRange(label));
    setCreatedTimeFilter('custom');
    setCreatedQuickOpen(false);
  };

  return {
    search,
    setSearch,
    sortConfig,
    toggleSort,
    getSortIcon,
    groupKeyword,
    setGroupKeyword,
    stockFilter,
    setStockFilter,
    estimatedStockOutFilter,
    setEstimatedStockOutFilter,
    estimatedQuickOpen,
    setEstimatedQuickOpen,
    estimatedCustomOpen,
    setEstimatedCustomOpen,
    estimatedSelectedLabel,
    estimatedRange,
    setEstimatedRange,
    createdTimeFilter,
    setCreatedTimeFilter,
    createdQuickOpen,
    setCreatedQuickOpen,
    createdCustomOpen,
    setCreatedCustomOpen,
    createdSelectedLabel,
    createdRange,
    setCreatedRange,
    statusDropdownOpen,
    setStatusDropdownOpen,
    supplierKeyword,
    setSupplierKeyword,
    locationKeyword,
    setLocationKeyword,
    itemTypeKeyword,
    setItemTypeKeyword,
    directSaleFilter,
    setDirectSaleFilter,
    salesChannelFilter,
    setSalesChannelFilter,
    productStatusFilter,
    setProductStatusFilter,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    handlePageSizeChange,
    estimatedRef,
    createdRef,
    statusDropdownRef,
    filteredRows,
    handleEstimatedPreset,
    handleCreatedPreset,
    setEstimatedSelectedLabel,
    setCreatedSelectedLabel,
  };
};
