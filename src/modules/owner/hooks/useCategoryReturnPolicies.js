import { useState, useCallback, useEffect } from 'react';
import { branchSettingsService } from '../services/branchSettingsService';
import { getCategories } from '../../../modules/inventory/services/productService';

const STORAGE_KEY = 'pos_category_return_policies';

export const useCategoryReturnPolicies = (branchId) => {
  const [categories, setCategories] = useState([]);
  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const [catRes, policyRes] = await Promise.allSettled([
        getCategories(),
        branchSettingsService.getCategoryPolicies(branchId),
      ]);

      if (
        catRes.status === 'fulfilled' &&
        catRes.value?.success &&
        Array.isArray(catRes.value?.data)
      ) {
        setCategories(catRes.value.data);
      } else {
        setCategories([]);
      }

      if (policyRes.status === 'fulfilled' && policyRes.value?.data) {
        const savedPolicies = Array.isArray(policyRes.value.data)
          ? policyRes.value.data
          : policyRes.value.data.policies || [];
        const policyMap = {};
        savedPolicies.forEach((p) => {
          if (p.categoryName) {
            policyMap[p.categoryName] = {
              returnDays: p.returnDays ?? p.returnDaysAllowed ?? '',
              exchangeDays: p.exchangeDays ?? p.exchangeDaysAllowed ?? '',
            };
          }
        });
        setPolicies(policyMap);
        // Lưu xuống localStorage để POS ReturnForm có thể dùng
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(policyMap));
        } catch {}
      } else if (policyRes.status === 'rejected' && policyRes.reason?.status !== 404) {
        console.warn('Không thể tải category policies:', policyRes.reason);
        // Fallback: đọc từ localStorage
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) setPolicies(JSON.parse(cached));
        } catch {}
      } else if (policyRes.status === 'rejected') {
        // 404 hoặc lỗi khác → fallback localStorage
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) setPolicies(JSON.parse(cached));
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching category return policies:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePolicy = useCallback((categoryName, field, value) => {
    setPolicies((prev) => {
      const current = prev[categoryName] || { returnDays: '', exchangeDays: '' };
      const updated = { ...current, [field]: value };
      // Nếu cả 2 đều rỗng → xóa hẳn category khỏi policies
      if (!updated.returnDays && !updated.exchangeDays) {
        const { [categoryName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [categoryName]: updated };
    });
  }, []);

  const savePolicies = useCallback(async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const policiesArray = Object.entries(policies)
        .filter(([_, vals]) => vals.returnDays || vals.exchangeDays)
        .map(([categoryName, vals]) => ({
          categoryName,
          returnDays: vals.returnDays ? parseInt(vals.returnDays, 10) : null,
          exchangeDays: vals.exchangeDays ? parseInt(vals.exchangeDays, 10) : null,
        }));

      const response = await branchSettingsService.updateCategoryPolicies(branchId, policiesArray);
      // Lưu xuống localStorage để POS ReturnForm có thể dùng
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
      } catch {}
      if (response?.success) {
        setMessage('Lưu chính sách đổi trả theo nhóm hàng thành công!');
      } else {
        setMessage('Lưu thành công!');
      }
      return true;
    } catch (err) {
      console.error('Error saving category return policies:', err);
      if (err.status === 404) {
        setError('API chưa được cài đặt. Vui lòng kiểm tra backend endpoint.');
      } else {
        setError(err.message || 'Không thể lưu cài đặt.');
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [branchId, policies]);

  const clearMessage = useCallback(() => setMessage(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    categories,
    policies,
    loading,
    saving,
    error,
    message,
    updatePolicy,
    savePolicies,
    clearMessage,
    clearError,
    refetch: fetchData,
  };
};

export default useCategoryReturnPolicies;
