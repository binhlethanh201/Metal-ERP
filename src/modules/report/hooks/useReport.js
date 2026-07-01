import { useState, useCallback } from 'react';

export const useReport = (apiFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunction(payload);
        // API của bạn trả về { success: true, data: {...} }
        if (response && response.success) {
          setData(response.data);
          return response.data;
        } else {
          setError(response?.message || 'Có lỗi xảy ra từ máy chủ.');
          return null;
        }
      } catch (err) {
        // apiClient.js của bạn ném ra error có chứa error.data
        const errorMsg = err.data?.message || err.message || 'Lỗi kết nối API';
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, isLoading, error, execute };
};
