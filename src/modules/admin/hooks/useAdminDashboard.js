import { useState, useEffect, useCallback } from 'react';
import { getOverview } from '../services/adminService';

const useAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await getOverview();
      setData(json);
    } catch (err) {
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

export default useAdminDashboard;
