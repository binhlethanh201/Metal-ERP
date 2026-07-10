import { useState, useEffect, useCallback } from 'react';
import {
  getReturnOrders,
  getReturnOrderDetail,
  cancelReturnOrder,
} from '../services/shiftReturnService';

const DEFAULT_FILTERS = {
  invoiceId: '',
  status: '', // '' = tất cả | PENDING | COMPLETED | CANCELLED
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 20,
};

export const useReturnHistory = () => {
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState({ totalCount: 0, pageNumber: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReturnOrders(filters);
      setReturns(res?.items || []);
      setPagination({
        totalCount: res?.totalCount || 0,
        pageNumber: res?.pageNumber || filters.page,
        pageSize: res?.pageSize || filters.pageSize,
      });
    } catch (err) {
      console.error('Lỗi tải lịch sử đổi/trả:', err);
      setError(err?.data?.message || 'Không thể tải lịch sử đổi/trả.');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const setPage = (page) => setFilters((f) => ({ ...f, page }));
  const setPageSize = (pageSize) => setFilters((f) => ({ ...f, pageSize, page: 1 }));
  const setStatus = (status) => setFilters((f) => ({ ...f, status, page: 1 }));
  const setDateRange = (dateFrom, dateTo) =>
    setFilters((f) => ({ ...f, dateFrom, dateTo, page: 1 }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Chi tiết phiếu — tải on-demand khi mở modal
  const [returnDetail, setReturnDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadReturnDetail = async (id) => {
    setDetailLoading(true);
    setReturnDetail(null);
    try {
      const res = await getReturnOrderDetail(id);
      setReturnDetail(res);
    } catch (err) {
      console.error('Lỗi tải chi tiết phiếu đổi trả:', err);
      alert(err?.data?.message || 'Không thể tải chi tiết phiếu đổi trả.');
    } finally {
      setDetailLoading(false);
    }
  };

  const clearReturnDetail = () => setReturnDetail(null);

  // Chỉ hủy được phiếu đang PENDING (theo doc: MSG-78 nếu sai trạng thái)
  const handleCancelReturn = async (returnId) => {
    if (!window.confirm('Bạn có chắc muốn hủy phiếu đổi trả này?')) return false;
    try {
      await cancelReturnOrder(returnId);
      await fetchReturns();
      return true;
    } catch (err) {
      alert(err?.data?.message || 'Không thể hủy phiếu đổi trả.');
      return false;
    }
  };

  return {
    returns,
    pagination,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    setStatus,
    setDateRange,
    resetFilters,
    refetch: fetchReturns,
    returnDetail,
    detailLoading,
    loadReturnDetail,
    clearReturnDetail,
    handleCancelReturn,
  };
};

export default useReturnHistory;
