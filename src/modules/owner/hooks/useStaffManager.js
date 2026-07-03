import { useState, useEffect, useCallback } from 'react';
import {
  getStaffs,
  getAvailablePermissions,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
} from '../services/staffService';
import { getBranches } from '../services/branchService';

// Helper parse lỗi từ chuẩn ApiResponse<T> mới của backend
const formatApiError = (err, defaultMsg = 'Đã có lỗi xảy ra.') => {
  const message = err?.data?.message || err?.message || defaultMsg;
  const errors = err?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return `${message}\nChi tiết:\n- ${errors.join('\n- ')}`;
  }
  return message;
};

export const useStaffManager = () => {
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20); // Chuẩn mặc định của API mới
  const [search, setSearch] = useState('');
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  // 1. Tải danh sách nhân viên
  const fetchStaffs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getStaffs({ page, pageSize, search });
      if (response?.success && response?.data) {
        setStaffs(response.data.items || []);
        setPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(formatApiError(err, 'Không thể tải danh sách nhân viên.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  // 2. Tải danh sách chi nhánh (Dành cho UI phụ ngoài controller này nếu có)
  const fetchBranchesForDropdown = useCallback(async () => {
    try {
      const response = await getBranches();
      if (response?.success) setBranches(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách chi nhánh:', err);
    }
  }, []);

  // 3. Tải danh sách toàn bộ quyền hạn (Permissions) cho UI Checkbox
  const fetchAvailablePermissions = useCallback(async () => {
    try {
      const response = await getAvailablePermissions();
      if (response?.success) setPermissions(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách quyền hạn:', err);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    fetchBranchesForDropdown();
    fetchAvailablePermissions();
  }, [fetchBranchesForDropdown, fetchAvailablePermissions]);

  // 4. Tạo nhân viên
  const handleCreateStaff = async (formData, onSuccess) => {
    try {
      const response = await createStaff(formData);
      if (response?.success) {
        alert(response.message || 'Tạo nhân viên thành công!');
        fetchStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi tạo nhân viên mới.'));
    }
  };

  // 5. Cập nhật nhân viên (Partial Update)
  const handleUpdateStaff = async (id, formData, onSuccess) => {
    // FE UX check: Cảnh báo nếu user bỏ chọn hết toàn bộ quyền
    if (
      formData.permissionCodes &&
      Array.isArray(formData.permissionCodes) &&
      formData.permissionCodes.length === 0
    ) {
      const confirmRemoveAll = window.confirm(
        'CẢNH BÁO: Bạn đang bỏ chọn tất cả quyền. Nhân viên này sẽ mất toàn bộ quyền truy cập nghiệp vụ. Tiếp tục?'
      );
      if (!confirmRemoveAll) return;
    }

    try {
      const response = await updateStaff(id, formData);
      if (response?.success) {
        alert(response.message || 'Cập nhật nhân viên thành công!');
        fetchStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi cập nhật nhân viên.'));
    }
  };

  // 6. Đổi trạng thái hoạt động (Kích hoạt / Khóa)
  const handleToggleStatus = async (id) => {
    if (!window.confirm('Bạn có chắc muốn thay đổi trạng thái hoạt động của nhân viên này?'))
      return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) {
        alert(response.message); // Hiển thị thông báo chi tiết từ backend (Khóa/Mở khóa thành công)
        fetchStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi đổi trạng thái nhân viên.'));
    }
  };

  // 7. Xóa cứng nhân viên (Xử lý chi tiết lỗi 400 FK Constraint)
  const handleDeleteStaff = async (id) => {
    if (
      !window.confirm(
        'CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên này? Hành động này không thể hoàn tác.'
      )
    ) {
      return;
    }

    try {
      const response = await deleteStaff(id);
      if (response?.success) {
        alert(response.message || 'Đã xóa hoàn toàn nhân viên ra khỏi hệ thống.');
        fetchStaffs();
      }
    } catch (err) {
      // Backend gợi ý: Lỗi 400 do ràng buộc dữ liệu (FK constraint)
      if (err?.status === 400 || err?.data?.errors) {
        alert(
          formatApiError(
            err,
            'Không thể xóa vì nhân viên đã phát sinh dữ liệu nghiệp vụ (hóa đơn, phiếu kho...). Khuyên dùng: Hãy chuyển sang chức năng "Vô hiệu hóa" tài khoản.'
          )
        );
      } else {
        alert(formatApiError(err, 'Lỗi khi xóa nhân viên.'));
      }
    }
  };

  return {
    staffs,
    branches,
    permissions,
    loading,
    error,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    paginationMeta,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleDeleteStaff,
    refetch: fetchStaffs,
  };
};
