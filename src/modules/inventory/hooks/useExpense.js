import { useState, useEffect, useCallback } from 'react';
import {
  getExpenses,
  createExpense,
  confirmExpense,
  cancelExpense,
} from '../services/expenseService';

const DEFAULT_PAGINATION = { totalCount: 0, totalPages: 1 };

export const useExpense = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bộ lọc & phân trang
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('createdat');
  const [order, setOrder] = useState('desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState(DEFAULT_PAGINATION);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        status: status && status !== 'ALL' ? status : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sort: sort || undefined,
        order: order || undefined,
        pageNumber,
        pageSize,
      };
      const response = await getExpenses(filters);
      const data = response?.data || response;

      if (data) {
        setVouchers(data.items || []);
        setPaginationMeta({
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Không thể tải danh sách phiếu chi tiền.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, supplierId, status, fromDate, toDate, sort, order, pageNumber, pageSize]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCreate = async (payload) => {
    const response = await createExpense(payload);
    await fetchVouchers();
    return response;
  };

  const handleConfirm = async (id) => {
    const response = await confirmExpense(id);
    await fetchVouchers();
    return response;
  };

  const handleCancel = async (id, cancelReason) => {
    const response = await cancelExpense(id, cancelReason);
    await fetchVouchers();
    return response;
  };

  return {
    vouchers,
    loading,
    error,
    setError,

    categoryId,
    setCategoryId,
    supplierId,
    setSupplierId,
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sort,
    setSort,
    order,
    setOrder,

    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,

    handleCreate,
    handleConfirm,
    handleCancel,
    refetch: fetchVouchers,
  };
};

export default useExpense;
