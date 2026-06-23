import { useState, useEffect, useCallback } from 'react';
import { getBranches, createBranch, updateBranch } from '../services/branchService';

export const useBranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách chi nhánh
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBranches();
      if (response?.success && response?.data) {
        setBranches(response.data);
      }
    } catch (err) {
      setError(err?.data?.message || 'Không thể tải danh sách chi nhánh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động gọi API lần đầu
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Xử lý tạo mới
  const handleCreateBranch = async (formData, onSuccess) => {
    try {
      const response = await createBranch(formData);
      if (response?.success) {
        alert('Tạo chi nhánh thành công! Hệ thống đã tự động gán tồn kho.');
        fetchBranches(); // Tải lại danh sách
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi tạo chi nhánh mới.');
    }
  };

  // Xử lý cập nhật
  const handleUpdateBranch = async (id, formData, onSuccess) => {
    try {
      const response = await updateBranch(id, formData);
      if (response?.success) {
        alert('Cập nhật chi nhánh thành công!');
        fetchBranches(); // Tải lại danh sách
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi cập nhật chi nhánh.');
    }
  };

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches,
    handleCreateBranch,
    handleUpdateBranch,
  };
};
