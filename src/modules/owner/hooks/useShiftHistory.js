import { useState, useEffect, useCallback } from 'react';
import { getShifts, getShiftSummary } from '../services/shiftReturnService';

const DEFAULT_FILTERS = { from: '', to: '', page: 1, pageSize: 20 };

export const useShiftHistory = () => {
  const [shifts, setShifts] = useState([]);
  const [pagination, setPagination] = useState({ totalCount: 0, pageNumber: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getShifts(filters);
      setShifts(res?.items || []);
      setPagination({
        totalCount: res?.totalCount || 0,
        pageNumber: res?.pageNumber || filters.page,
        pageSize: res?.pageSize || filters.pageSize,
      });
    } catch (err) {
      console.error('Lỗi tải lịch sử ca bán:', err);
      setError(err?.data?.message || 'Không thể tải lịch sử ca bán.');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const setPage = (page) => setFilters((f) => ({ ...f, page }));
  const setPageSize = (pageSize) => setFilters((f) => ({ ...f, pageSize, page: 1 }));
  const setDateRange = (from, to) => setFilters((f) => ({ ...f, from, to, page: 1 }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Chi tiết/tóm tắt ca — tải on-demand khi mở modal
  const [shiftSummary, setShiftSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadShiftSummary = async (shiftId) => {
    setSummaryLoading(true);
    setShiftSummary(null);
    try {
      const res = await getShiftSummary(shiftId);
      setShiftSummary(res);
    } catch (err) {
      console.error('Lỗi tải chi tiết ca bán:', err);
      alert(err?.data?.message || 'Không thể tải chi tiết ca bán.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const clearShiftSummary = () => setShiftSummary(null);

  return {
    shifts,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    setDateRange,
    resetFilters,
    refetch: fetchShifts,
    shiftSummary,
    summaryLoading,
    loadShiftSummary,
    clearShiftSummary,
  };
};

export default useShiftHistory;
