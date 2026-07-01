import { useState, useEffect, useCallback } from 'react';
import {
  getInventoryChecks,
  createInventoryCheck,
  fillInventoryCheck,
} from '../services/inventoryCheckService';
import { useAuth } from '../../../shared/hooks/useAuth';

export const useInventoryCheckManager = () => {
  const { user } = useAuth();
  const isOwner = user?.roles?.includes('Owner') || user?.role === 'Owner';

  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trạng thái bộ lọc
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branchId, setBranchId] = useState(''); // Thêm branchId cho Owner

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [paginationMeta, setPaginationMeta] = useState({
    totalCount: 0,
    totalPages: 1,
  });

  const fetchChecks = useCallback(async () => {
    // KHÓA API: Nếu là Owner mà chưa có branchId thì không gọi API để tránh lỗi
    if (isOwner && !branchId) return;

    setLoading(true);
    setError('');
    try {
      const filters = {
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        branchId: branchId || undefined, // Gửi branchId lên Backend
        pageNumber,
        pageSize,
      };

      const response = await getInventoryChecks(filters);
      if (response?.success && response?.data) {
        setChecks(response.data.items || []);
        setPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || 'Không thể tải danh sách phiếu kiểm kê.');
    } finally {
      setLoading(false);
    }
  }, [isOwner, branchId, status, startDate, endDate, pageNumber, pageSize]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPageNumber(1);
  };

  // Tạo phiếu mới
  const handleCreateCheck = async (productIds, notes, currentBranchId, onSuccess) => {
    try {
      // Truyền thêm currentBranchId
      const response = await createInventoryCheck(productIds, notes, currentBranchId);
      if (response?.success) {
        alert('Tạo phiếu kiểm kê thành công (Trạng thái: Nháp)!');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(
        err?.data?.message ||
          err?.message ||
          'Lỗi khi tạo phiếu kiểm kê. (Có thể do lỗi BE chưa nhận branchId của Owner)'
      );
    }
  };

  //  Điền số lượng thực tế Put
  const handleFillCheck = async (ticketId, details, onSuccess) => {
    try {
      const response = await fillInventoryCheck(ticketId, details);
      if (response?.success) {
        alert('Đã cập nhật số lượng kiểm đếm thành công! Phiếu đã chuyển sang chờ duyệt.');
        fetchChecks(); // Load lại bảng để thấy trạng thái thay đổi
        onSuccess?.(); // Đóng modal
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi cập nhật số lượng kiểm kê.');
    }
  };

  return {
    checks,
    loading,
    error,
    status,
    setStatus: (val) => handleFilterChange(setStatus, val),
    startDate,
    setStartDate: (val) => handleFilterChange(setStartDate, val),
    endDate,
    setEndDate: (val) => handleFilterChange(setEndDate, val),
    branchId,
    setBranchId, // Xuất ra cho giao diện dùng
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    refetch: fetchChecks,
    handleCreateCheck,
    handleFillCheck,
  };
};
