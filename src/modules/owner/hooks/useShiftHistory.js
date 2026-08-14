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
  const setSearchKeyword = (keyword) => setFilters((f) => ({ ...f, shiftCode: keyword, page: 1 }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const [shiftSummary, setShiftSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [shiftOrders, setShiftOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadShiftSummary = async (shiftId) => {
    setSummaryLoading(true);
    setOrdersLoading(true);
    setShiftSummary(null);
    setShiftOrders([]);
    try {
      const res = await getShiftSummary(shiftId);
      setShiftSummary(res);
      // Backend trả sẵn danh sách Activities (Bán/Hoàn/Đổi) theo ShiftId chính xác —
      // không còn dùng getOrders theo time-window (lệch ca, thiếu hoàn tiền/đổi hàng).
      const acts = Array.isArray(res?.activities) ? res.activities : [];
      const mapped = acts
        .map((a) => ({
          id: a.code || `${a.type}-${a.createdAt || ''}`,
          type: a.type, // Sale | Refund | Exchange
          invoiceCode: a.code || '',
          createdAt: a.createdAt || '',
          customerName: a.customerName || 'Khách lẻ',
          totalAmount: typeof a.amount === 'number' ? a.amount : 0, // có dấu
          paymentMethod: a.method || '',
          cashier: a.userName || '',
          description: a.description || '',
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setShiftOrders(mapped);
    } catch (err) {
      console.error('Lỗi tải chi tiết ca bán:', err);
      alert(err?.data?.message || 'Không thể tải chi tiết ca bán.');
    } finally {
      setSummaryLoading(false);
      setOrdersLoading(false);
    }
  };

  const clearShiftSummary = () => {
    setShiftSummary(null);
    setShiftOrders([]);
  };

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
    shiftOrders,
    ordersLoading,
    loadShiftSummary,
    clearShiftSummary,
    setSearchKeyword,
  };
};

export default useShiftHistory;