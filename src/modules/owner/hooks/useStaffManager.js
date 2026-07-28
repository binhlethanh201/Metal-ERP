import { useState, useEffect, useCallback } from 'react';
import {
  getStaffs,
  getAvailablePermissions,
  getStaffDetail,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  restoreStaff,
  permanentDeleteStaff,
} from '../services/staffService';

// --- Helper: lấy userId hiện tại từ JWT lưu trong storage (key 'authToken', khớp apiClient.js) ---
const decodeCurrentUserId = () => {
  try {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return null;

    const payloadBase64 = token.split('.')[1];
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(atob(normalized))));
    return (
      payload.nameid ||
      payload.sub ||
      payload.userId ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      null
    );
  } catch {
    return null;
  }
};

const formatApiError = (err, defaultMsg = 'Đã có lỗi xảy ra.') => {
  const message = err?.data?.message || err?.message || defaultMsg;
  const errors = err?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return `${message}\nChi tiết:\n- ${errors.join('\n- ')}`;
  }
  return message;
};

export const useStaffManager = () => {
  const [activeStaffs, setActiveStaffs] = useState([]);
  const [hiddenStaffs, setHiddenStaffs] = useState([]);
  const [deletedStaffs, setDeletedStaffs] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [hiddenLoading, setHiddenLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId] = useState(decodeCurrentUserId());

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [activePaginationMeta, setActivePaginationMeta] = useState({ totalCount: 0, totalPages: 1 });
  const [hiddenPaginationMeta, setHiddenPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  // Fetch ACTIVE list (theo search + phân trang)
  const fetchActiveStaffs = useCallback(async () => {
    setActiveLoading(true);
    setError('');
    try {
      const response = await getStaffs({
        page,
        pageSize,
        search,
        view: 'active',
      });
      if (response?.success && response?.data) {
        setActiveStaffs(response.data.items || []);
        setActivePaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(formatApiError(err, 'Không thể tải danh sách nhân viên đang hoạt động.'));
    } finally {
      setActiveLoading(false);
    }
  }, [page, pageSize, search]);

  // Fetch HIDDEN list (chỉ search thôi, pageSize mặc định 100 đủ cho danh sách ẩn)
  const fetchHiddenStaffs = useCallback(async () => {
    setHiddenLoading(true);
    try {
      const response = await getStaffs({
        page: 1,
        pageSize: 100,
        search: '',
        view: 'hidden',
      });
      if (response?.success && response?.data) {
        setHiddenStaffs(response.data.items || []);
        setHiddenPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên đã ẩn:', err);
    } finally {
      setHiddenLoading(false);
    }
  }, []);

  // Fetch DELETED list (gọi service riêng, có daysUntilPermanentDelete)
  const fetchDeletedStaffs = useCallback(async () => {
    setDeletedLoading(true);
    try {
      const { getDeletedStaffs } = await import('../services/staffService');
      const response = await getDeletedStaffs();
      if (response?.success && response?.data) {
        setDeletedStaffs(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhân viên đã xóa:', err);
    } finally {
      setDeletedLoading(false);
    }
  }, []);

  const fetchAvailablePermissions = useCallback(async () => {
    try {
      const response = await getAvailablePermissions();
      if (response?.success) setPermissions(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách quyền hạn:', err);
    }
  }, []);

  // Lấy dữ liệu chi tiết (bao gồm quyền)
  const fetchStaffDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await getStaffDetail(id);
      if (response?.success && response?.data) {
        return response.data;
      }
    } catch (err) {
      alert(formatApiError(err, 'Không thể lấy thông tin chi tiết nhân viên.'));
    } finally {
      setDetailLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchActiveStaffs();
  }, [fetchActiveStaffs]);

  useEffect(() => {
    fetchHiddenStaffs();
  }, [fetchHiddenStaffs]);

  useEffect(() => {
    fetchDeletedStaffs();
  }, [fetchDeletedStaffs]);

  useEffect(() => {
    fetchAvailablePermissions();
  }, [fetchAvailablePermissions]);

  const handleCreateStaff = async (formData, onSuccess) => {
    try {
      const response = await createStaff(formData);
      if (response?.success) {
        alert(response.message || 'Tạo nhân viên thành công!');
        fetchActiveStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi tạo nhân viên mới.'));
    }
  };

  const handleUpdateStaff = async (id, formData, onSuccess) => {
    try {
      const response = await updateStaff(id, formData);
      if (response?.success) {
        alert(response.message || 'Cập nhật nhân viên thành công!');
        fetchActiveStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi cập nhật nhân viên.'));
    }
  };

  const handleToggleStatus = async (id, onSuccess) => {
    if (!window.confirm('Bạn có chắc muốn ẨN nhân viên này?'))
      return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) {
        // Khi ẩn → nhân viên rời ACTIVE → nhảy sang HIDDEN
        fetchActiveStaffs();
        fetchHiddenStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi đổi trạng thái nhân viên.'));
    }
  };

  // Ẩn từ row bảng ACTIVE
  const handleHideStaff = async (id) => {
    if (!window.confirm('Bạn có chắc muốn ẨN nhân viên này? Họ sẽ chuyển sang tab "Đã ẩn".'))
      return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) {
        fetchActiveStaffs();
        fetchHiddenStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi ẩn nhân viên.'));
    }
  };

  // Kích hoạt từ row bảng HIDDEN
  const handleActivateStaff = async (id) => {
    if (!window.confirm('Kích hoạt lại nhân viên này? Họ sẽ chuyển sang tab "Đang hoạt động".'))
      return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) {
        fetchActiveStaffs();
        fetchHiddenStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi kích hoạt nhân viên.'));
    }
  };

  // Khôi phục từ row bảng DELETED
  const handleRestoreStaff = async (id) => {
    if (!window.confirm('Khôi phục nhân viên này? Họ sẽ chuyển sang tab "Đang hoạt động".'))
      return;
    try {
      const response = await restoreStaff(id);
      if (response?.success) {
        fetchActiveStaffs();
        fetchDeletedStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi khôi phục nhân viên.'));
    }
  };

  const handlePermanentDeleteStaff = async (id, staffObj) => {
    const fullName = staffObj?.fullName || 'nhân viên này';
    if (
      !window.confirm(
        `Bạn có chắc muốn XOÁ VĨNH VIỄN nhân viên "${fullName}"?\nHành động KHÔNG thể hoàn tác.`
      )
    )
      return;
    try {
      const response = await permanentDeleteStaff(id);
      if (response?.success) {
        alert('Đã xóa vĩnh viễn nhân viên.');
        fetchHiddenStaffs();
        fetchDeletedStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi xóa vĩnh viễn nhân viên.'));
    }
  };

  const refetchAll = useCallback(() => {
    fetchActiveStaffs();
    fetchHiddenStaffs();
    fetchDeletedStaffs();
  }, [fetchActiveStaffs, fetchHiddenStaffs, fetchDeletedStaffs]);

  return {
    activeStaffs,
    hiddenStaffs,
    deletedStaffs,
    permissions,
    activeLoading,
    hiddenLoading,
    deletedLoading,
    detailLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    activePaginationMeta,
    hiddenPaginationMeta,
    currentUserId,
    fetchStaffDetail,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleHideStaff,
    handleActivateStaff,
    handleRestoreStaff,
    handlePermanentDeleteStaff,
    refetch: refetchAll,
  };
};
