import { useState, useEffect, useCallback } from 'react';
import { getBranchHistory } from '../services/branchService';

export const useBranchHistory = (branchId) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trạng thái bộ lọc và phân trang chuẩn theo Query Params của API Doc
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Mặc định hiển thị 10 dòng ở panel con
  const [type, setType] = useState(''); // "import", "export", "check"
  const [status, setStatus] = useState(''); // "pending", "approved", "cancelled"

  const [paginationMeta, setPaginationMeta] = useState({
    totalCount: 0,
    totalPages: 1,
  });

  const fetchHistory = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const filters = {
        page,
        pageSize,
        type: type || undefined,
        status: status || undefined,
      };
      const response = await getBranchHistory(branchId, filters);
      if (response?.success && response?.data) {
        setHistoryItems(response.data.items || []);
        setPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || 'Không thể tải lịch sử phiếu kho.');
    } finally {
      setLoading(false);
    }
  }, [branchId, page, pageSize, type, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    historyItems,
    loading,
    error,
    page,
    setPage,
    type,
    setType,
    status,
    setStatus,
    paginationMeta,
    refetch: fetchHistory,
  };
};
