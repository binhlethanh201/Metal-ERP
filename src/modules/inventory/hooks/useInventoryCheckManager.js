import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../services/apiClient';
import ENDPOINTS from '../../../services/endpoints';
import {
  getInventoryChecks,
  createInventoryCheck,
  updateInventoryCheck,
  deleteInventoryCheck,
  fillInventoryCheck,
  approveInventoryCheck,
  cancelInventoryCheck,
  reasonInventoryCheck,
  rejectInventoryCheck,
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
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [paginationMeta, setPaginationMeta] = useState({
    totalCount: 0,
    totalPages: 1,
  });

  // Logic load danh sách chi nhánh dành riêng cho Owner
  useEffect(() => {
    if (isOwner) {
      apiGet(ENDPOINTS.OWNER.BRANCHES)
        .then((res) => {
          if (res?.success && res.data) {
            const list = res.data.items || res.data;
            setBranches(list);
            // Tự động chọn chi nhánh đầu tiên nếu chưa chọn
            if (list.length > 0 && !branchId) {
              setBranchId(list[0].branchId);
            }
          }
        })
        .catch((err) => console.error('Lỗi lấy chi nhánh:', err));
    }
  }, [isOwner, branchId]);

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
  const handleCreateCheck = async (productIds, notes, assigneeUserId = null, onSuccess) => {
    try {
      const response = await createInventoryCheck(productIds, notes, assigneeUserId);
      if (response?.success) {
        alert('Tạo phiếu kiểm kê thành công (Trạng thái: Nháp)!');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Lỗi khi tạo phiếu kiểm kê mới.');
    }
  };

  // Cập nhật phiếu nháp
  const handleUpdateCheck = async (id, data, onSuccess) => {
    try {
      const response = await updateInventoryCheck(id, data);
      if (response?.success) {
        alert('Cập nhật phiếu kiểm kê thành công!');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi cập nhật phiếu.');
    }
  };

  // Xóa phiếu nháp
  const handleDeleteCheck = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu kiểm kê nháp này?')) return;
    try {
      const response = await deleteInventoryCheck(id);
      if (response?.success) {
        alert('Đã xóa phiếu kiểm kê thành công!');
        fetchChecks();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi xóa phiếu.');
    }
  };
  // Điền số lượng thực tế
  const handleFillCheck = async (ticketId, details, onSuccess) => {
    try {
      const response = await fillInventoryCheck(ticketId, details);
      if (response?.success) {
        alert('Đã cập nhật số lượng kiểm đếm thành công! Phiếu đã chuyển sang chờ duyệt.');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi cập nhật số lượng kiểm kê.');
    }
  };

  // Duyệt phiếu
  const handleApproveCheck = async (id, onSuccess) => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn duyệt phiếu này? Tồn kho sẽ được điều chỉnh ngay lập tức.'
      )
    )
      return;
    try {
      const response = await approveInventoryCheck(id);
      if (response?.success) {
        alert('Đã duyệt phiếu kiểm kê! Tồn kho đã được cập nhật.');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi duyệt phiếu kiểm kê.');
    }
  };

  // Yêu cầu đếm lại (Reject)
  const handleRejectCheck = async (id, reason, onSuccess) => {
    if (!reason) {
      alert('Vui lòng nhập lý do yêu cầu đếm lại!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn trả phiếu này về trạng thái Nháp để đếm lại không?'))
      return;

    try {
      const response = await rejectInventoryCheck(id, reason);
      if (response?.success) {
        alert('Đã yêu cầu đếm lại thành công. Phiếu đã được chuyển về trạng thái Nháp.');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi yêu cầu đếm lại.');
    }
  };

  // Hủy phiếu
  const handleCancelCheck = async (id, reason = '', onSuccess) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy phiếu kiểm kê này không?')) return;
    try {
      const response = await cancelInventoryCheck(id, reason);
      if (response?.success) {
        alert('Đã hủy phiếu kiểm kê thành công.');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi hủy phiếu kiểm kê.');
    }
  };

  // Nhập giải trình
  const handleReasonCheck = async (id, details, onSuccess) => {
    try {
      const response = await reasonInventoryCheck(id, details);
      if (response?.success) {
        alert('Đã lưu giải trình chênh lệch thành công!');
        fetchChecks();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi lưu giải trình.');
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
    setBranchId,
    branches,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    refetch: fetchChecks,
    handleCreateCheck,
    handleUpdateCheck,
    handleDeleteCheck,
    handleFillCheck,
    handleApproveCheck,
    handleRejectCheck, // Xuất hàm mới
    handleCancelCheck,
    handleReasonCheck,
  };
};
