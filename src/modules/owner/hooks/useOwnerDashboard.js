import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../services/apiClient'; // Import apiGet (kiểm tra lại đường dẫn tương đối cho chuẩn)

const useOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // apiGet đã tự động cấu hình Base URL và gắn Header Authorization
      const json = await apiGet('/api/owner/dashboard/overview');
      // Backend có thể trả về { success: true, data: {...} } hoặc {...} trực tiếp
      setData(json?.data ?? json);
    } catch (err) {
      // Bắt lỗi theo chuẩn mà apiClient.js đã ném ra
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};

export default useOwnerDashboard;
