import { useState, useEffect, useCallback } from 'react';
import {
  getStaffs,
  getAvailablePermissions,
  getStaffDetail,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
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
  const [staffs, setStaffs] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId] = useState(decodeCurrentUserId());

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

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
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    fetchAvailablePermissions();
  }, [fetchAvailablePermissions]);

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

  const handleUpdateStaff = async (id, formData, onSuccess) => {
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

  const handleToggleStatus = async (id) => {
    if (!window.confirm('Bạn có chắc muốn thay đổi trạng thái hoạt động của nhân viên này?'))
      return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) {
        alert(response.message);
        fetchStaffs();
      }
    } catch (err) {
      alert(formatApiError(err, 'Lỗi khi đổi trạng thái nhân viên.'));
    }
  };

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
      if (err?.status === 400 || err?.data?.errors) {
        alert(
          formatApiError(
            err,
            'Không thể xóa vì nhân viên đã phát sinh dữ liệu nghiệp vụ. Khuyên dùng: Chuyển sang chức năng "Vô hiệu hóa".'
          )
        );
      } else {
        alert(formatApiError(err, 'Lỗi khi xóa nhân viên.'));
      }
    }
  };

  return {
    staffs,
    permissions,
    loading,
    detailLoading,
    error,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    paginationMeta,
    currentUserId,
    fetchStaffDetail,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    handleDeleteStaff,
  };
};
