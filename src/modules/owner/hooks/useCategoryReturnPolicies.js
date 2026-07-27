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
          const catId = p.categoryId || '';
          const catName = p.categoryName || '';
          const key = catId || catName;
          if (key) {
            policyMap[key] = {
              categoryId: catId,
              categoryName: catName,
              returnDays: p.returnDays ?? p.returnDaysAllowed ?? '',
              exchangeDays: p.exchangeDays ?? p.exchangeDaysAllowed ?? '',
            };
          }
        });
        setPolicies(policyMap);
        if (Object.keys(policyMap).length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(policyMap));
          } catch {}
        }
      } else {
        // API lỗi hoặc không có dữ liệu → fallback localStorage
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            setPolicies(parsed);
            // Đồng thời push lên API nếu có dữ liệu trong localStorage (đồng bộ 1 chiều)
            if (Object.keys(parsed).length > 0) {
              const policiesArray = Object.values(parsed)
                .filter((vals) => (vals.returnDays || vals.exchangeDays) && vals.categoryName)
                .map((vals) => ({
                  categoryId: vals.categoryId || null,
                  categoryName: vals.categoryName,
                  returnDays: vals.returnDays ? parseInt(vals.returnDays, 10) : null,
                  exchangeDays: vals.exchangeDays ? parseInt(vals.exchangeDays, 10) : null,
                }));
              branchSettingsService.updateCategoryPolicies(branchId, policiesArray).catch(() => {});
            }
          }
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

  const updatePolicy = useCallback((categoryName, field, value, catId) => {
    setPolicies((prev) => {
      const key = catId || categoryName;
      if (!key) return prev;
      const current = prev[key] || {
        returnDays: '',
        exchangeDays: '',
        categoryId: catId || '',
        categoryName: categoryName || '',
      };
      const updated = { ...current, [field]: value };
      if (catId) updated.categoryId = catId;
      if (categoryName) updated.categoryName = categoryName;

      // Nếu cả 2 đều rỗng → xóa hẳn category khỏi policies
      if (!updated.returnDays && !updated.exchangeDays) {
        const result = { ...prev };
        delete result[key];
        // Xóa luôn entry cũ key bằng name nếu có (khi đã migrate lên id)
        const staleKey = catId && categoryName ? categoryName : null;
        if (staleKey && result[staleKey] === current) delete result[staleKey];
        return result;
      }
      return { ...prev, [key]: updated };
    });
  }, []);

  const savePolicies = useCallback(async (forcedPolicies) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const data = forcedPolicies || policies;
      const policiesArray = Object.values(data)
        .filter((vals) => (vals.returnDays || vals.exchangeDays) && vals.categoryName)
        .map((vals) => ({
          categoryId: vals.categoryId || null,
          categoryName: vals.categoryName,
          returnDays: vals.returnDays ? parseInt(vals.returnDays, 10) : null,
          exchangeDays: vals.exchangeDays ? parseInt(vals.exchangeDays, 10) : null,
        }));

      const response = await branchSettingsService.updateCategoryPolicies(branchId, policiesArray);
      // Lưu xuống localStorage để POS ReturnForm có thể dùng
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
