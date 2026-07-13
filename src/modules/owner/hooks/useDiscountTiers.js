import { useState, useEffect, useCallback } from 'react';
import {
  getDiscountTiers,
  createDiscountTier,
  updateDiscountTier,
  deleteDiscountTier,
} from '../services/discountService';

export const useDiscountTiers = (branchId) => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách discount tiers
  const fetchTiers = useCallback(async () => {
    if (!branchId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await getDiscountTiers(branchId);
      if (response?.success && response?.data) {
        setTiers(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setTiers(response);
      } else {
        setTiers([]);
      }
    } catch (err) {
      setError(err?.data?.message || err.message || 'Không thể tải danh sách chiết khấu.');
      setTiers([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // Tự động gọi API khi branchId thay đổi
  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // Tạo mới tier
  const handleCreateTier = async (formData, onSuccess) => {
    try {
      const payload = {
        ...formData,
        branchId: branchId,
        isActive: true,
      };
      const response = await createDiscountTier(payload);
      if (response) {
        fetchTiers();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Lỗi khi tạo mức chiết khấu.');
      throw err;
    }
  };

  // Cập nhật tier
  const handleUpdateTier = async (id, formData, onSuccess) => {
    try {
      const payload = {
        ...formData,
        branchId: branchId,
      };
      const response = await updateDiscountTier(id, payload);
      if (response) {
        fetchTiers();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Lỗi khi cập nhật mức chiết khấu.');
      throw err;
    }
  };

  // Xóa tier
  const handleDeleteTier = async (id, onSuccess) => {
    try {
      await deleteDiscountTier(id);
      // apiDelete returns undefined/null on 204 NoContent, so we can just call success
      fetchTiers();
      onSuccess?.();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Lỗi khi xóa mức chiết khấu.');
      throw err;
    }
  };

  return {
    tiers,
    loading,
    error,
    refetch: fetchTiers,
    handleCreateTier,
    handleUpdateTier,
    handleDeleteTier,
  };
};
