import { useState, useCallback } from 'react';
import { getOwnerDefectiveItems } from '../services/ownerWarrantyService';

export const useOwnerWarrantyHistory = () => {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    fromDate: '',
    toDate: '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      };

      const response = await getOwnerDefectiveItems(activeFilters);
      if (response && response.items) {
        setItems(response.items);
        setTotalCount(response.totalCount);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hàng bảo hành:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const setPage = (page) => setFilters((prev) => ({ ...prev, page }));
  const setPageSize = (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  const setSearch = (search) => setFilters((prev) => ({ ...prev, search, page: 1 }));
  const setDateRange = (fromDate, toDate) => setFilters((prev) => ({ ...prev, fromDate, toDate, page: 1 }));

  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      search: '',
      fromDate: '',
      toDate: '',
    });
  };

  return {
    items,
    totalCount,
    loading,
    error,
    filters,
    fetchItems,
    setPage,
    setPageSize,
    setSearch,
    setDateRange,
    resetFilters,
  };
};
