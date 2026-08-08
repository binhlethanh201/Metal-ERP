import { useState, useEffect, useCallback } from 'react';
import { getShifts, getShiftSummary } from '../services/shiftReturnService';
import { getOrders } from '../../../modules/pos/services/posService';

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
      if (res?.startedAt) {
        try {
          const shiftStart = new Date(res.startedAt);
          const shiftEnd = res.endedAt ? new Date(res.endedAt) : new Date();
          const ordersData = await getOrders({
            status: 'Completed',
            fromDate: shiftStart.toISOString(),
            toDate: shiftEnd.toISOString(),
            pageSize: 500,
          });
          const rawOrders = Array.isArray(ordersData)
            ? ordersData
            : ordersData?.items || ordersData?.data?.items || ordersData?.data || [];
          const filtered = (Array.isArray(rawOrders) ? rawOrders : [])
            .filter((o) => {
              const d = new Date(o.createdAt || o.date || o.invoiceDate || '');
              return !isNaN(d.getTime()) && d >= shiftStart && d <= shiftEnd;
            })
            .map((o) => ({
              id: o.invoiceCode || o.invoiceId || o.id || '',
              invoiceCode: o.invoiceCode || o.id || '',
              createdAt: o.createdAt || o.date || '',
              customerName: o.customerName || o.customer || 'Khách lẻ',
              totalAmount: parseFloat(o.totalAmount || o.total || o.grandTotal || 0),
              paymentMethod: o.paymentMethod || '',
              cashier: o.userName || o.cashier || o.createdBy || '',
            }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setShiftOrders(filtered);
        } catch (err) {
          console.error('Lỗi tải đơn hàng trong ca:', err);
        }
      }
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
  };
};

export default useShiftHistory;