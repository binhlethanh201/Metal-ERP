import { useState, useEffect, useCallback } from 'react';
import { getSupplierDebts, getSupplierDebtDetail } from '../services/supplierService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getLocalDateString } from '../../../shared/utils/formatDate';

export const useSupplierDebt = () => {
  const { token } = useAuth();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({
    totalClosingDebt: 0,
    totalOverdueDebt: 0,
    totalPaidInPeriod: 0,
    totalSuppliers: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bộ lọc theo API
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all'); // 'normal', 'overdue', 'paid', 'all'
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        searchTerm: searchTerm || undefined,
        status: status !== 'all' ? status : undefined,
        pageNumber,
        pageSize,
      };

      const response = await getSupplierDebts(filters);
      const data = response?.data || response;

      if (data) {
        setDebts(data.items || []);
        if (data.summary) setSummary(data.summary);
        setPaginationMeta({
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Không thể tải dữ liệu công nợ.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, status, pageNumber, pageSize]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPageNumber(1); // Reset trang về 1 khi đổi bộ lọc
  };

  // Hàm tải chi tiết 1 NCC
  const fetchDebtDetail = async (supplierId) => {
    const res = await getSupplierDebtDetail(supplierId);
    return res?.data || res;
  };

  // Hàm Xuất Excel bằng Fetch + Blob (để tự động chèn Token)
  const handleExport = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_API_URL;
      const url = new URL(`${baseUrl}/api/supplierdebt/export`);

      if (status !== 'all') url.searchParams.append('status', status);
      if (searchTerm) url.searchParams.append('searchTerm', searchTerm);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/csv',
        },
      });

      if (!res.ok) {
        // Thử đọc xem server có trả về thông báo lỗi JSON không
        const errorData = await res.json().catch(() => ({ message: 'Không thể xuất file CSV' }));
        throw new Error(errorData.message || 'Lỗi từ phía máy chủ');
      }

      const blob = await res.blob();

      // Kiểm tra xem blob có phải là file rỗng hoặc lỗi không
      if (blob.size === 0) throw new Error('File xuất ra trống dữ liệu');

      const csvBlob = new Blob(['\ufeff', blob], { type: 'text/csv;charset=utf-8;' });
      const objectUrl = URL.createObjectURL(csvBlob);

      const a = document.createElement('a');
      a.href = objectUrl;
      const dateStr = getLocalDateString().replace(/-/g, '');
      a.download = `cong-no-ncc-${dateStr}.csv`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Export Error:', err);
      alert('Thông báo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    debts,
    summary,
    loading,
    error,
    searchTerm,
    setSearchTerm: (val) => handleFilterChange(setSearchTerm, val),
    status,
    setStatus: (val) => handleFilterChange(setStatus, val),
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    fetchDebtDetail,
    handleExport,
    refetch: fetchDebts,
  };
};
