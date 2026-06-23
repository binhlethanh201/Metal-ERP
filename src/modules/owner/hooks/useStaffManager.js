import { useState, useEffect, useCallback } from 'react';
import {
  getStaffs,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  assignBranch,
  unassignBranch,
} from '../services/staffService';
import { getBranches } from '../services/branchService';

export const useStaffManager = () => {
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  const fetchStaffs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getStaffs({ page, search: search || undefined });
      if (response?.success && response?.data) {
        setStaffs(response.data.items || []);
        setPaginationMeta({
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchBranchesForDropdown = useCallback(async () => {
    try {
      const response = await getBranches();
      if (response?.success) setBranches(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách chi nhánh', err);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    fetchBranchesForDropdown();
  }, [fetchBranchesForDropdown]);

  const handleCreateStaff = async (formData, onSuccess) => {
    try {
      const response = await createStaff(formData);
      if (response?.success) {
        alert('Tạo nhân viên thành công!');
        fetchStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi tạo nhân viên mới.');
    }
  };

  const handleUpdateStaff = async (id, formData, onSuccess) => {
    try {
      const response = await updateStaff(id, formData);
      if (response?.success) {
        alert('Cập nhật thông tin thành công!');
        fetchStaffs();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi cập nhật nhân viên.');
    }
  };

  const handleToggleStatus = async (id) => {
    if (!window.confirm('Bạn có chắc muốn thay đổi trạng thái nhân viên này?')) return;
    try {
      const response = await toggleStaffStatus(id);
      if (response?.success) fetchStaffs();
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi đổi trạng thái.');
    }
  };

  const handleAssignBranch = async (staffId, branchId, onSuccess) => {
    try {
      const response = await assignBranch(staffId, branchId);
      if (response?.success) {
        alert('Gán/Điều chuyển chi nhánh thành công!');
        onSuccess?.();
        fetchStaffs();
      }
    } catch (err) {
      const errorMsg =
        err?.message || err?.data?.message || 'Nhân viên đã được gán vào chi nhánh này.';
      alert(`Không thể điều chuyển: ${errorMsg}`);
      onSuccess?.();
      fetchStaffs();
    }
  };

  //Xử lý gỡ nhân viên khỏi chi nhánh
  const handleUnassignBranch = async (staffId, branchId) => {
    // Hỏi xác nhận trước khi gỡ (an toàn UX)
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn gỡ nhân viên này khỏi chi nhánh hiện tại? Họ sẽ không thể đăng nhập vào chi nhánh này nữa.'
      )
    ) {
      return;
    }

    try {
      const response = await unassignBranch(staffId, branchId);
      if (response?.success) {
        alert('Gỡ chi nhánh thành công!');
        fetchStaffs(); // Refresh lại bảng dữ liệu
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi gỡ chi nhánh. (Có thể do dữ liệu không đồng bộ)');
    }
  };

  return {
    staffs,
    branches,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    paginationMeta,
    handleCreateStaff,
    handleUpdateStaff,
    handleToggleStatus,
    refetch: fetchStaffs,
    handleAssignBranch,
    handleUnassignBranch,
  };
};
