import { useState, useCallback, useEffect } from 'react';
import { branchSettingsService } from '../services/branchSettingsService';

export const useBranchSettings = (branchId) => {
  const [settings, setSettings] = useState({
    returnDaysAllowed: null,
    exchangeDaysAllowed: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch settings on mount or branchId change
  useEffect(() => {
    if (!branchId) return;
    fetchSettings();
  }, [branchId, fetchSettings]);

  const fetchSettings = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await branchSettingsService.getSettings(branchId);
      // API returns {success, message, data: {returnDaysAllowed, exchangeDaysAllowed}}
      if (response?.data) {
        setSettings({
          returnDaysAllowed: response.data.returnDaysAllowed,
          exchangeDaysAllowed: response.data.exchangeDaysAllowed,
        });
      }
    } catch (err) {
      console.error('Error fetching branch settings:', err);
      if (err.status === 404) {
        setError(
          'API chưa được cài đặt. Vui lòng kiểm tra backend endpoint /api/owner/branches/{id}/settings.'
        );
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải cài đặt.');
      }
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const saveSettings = useCallback(
    async (data) => {
      setSaving(true);
      setError(null);
      setMessage(null);
      try {
        const response = await branchSettingsService.updateSettings(branchId, data);
        if (response?.data) {
          setSettings({
            returnDaysAllowed: response.data.returnDaysAllowed,
            exchangeDaysAllowed: response.data.exchangeDaysAllowed,
          });
          setMessage('Cập nhật cài đặt thành công!');
        }
        return true;
      } catch (err) {
        console.error('Error saving branch settings:', err);
        if (err.status === 404) {
          setError(
            'API chưa được cài đặt. Vui lòng kiểm tra backend endpoint PUT /api/owner/branches/{id}/settings.'
          );
        } else {
          setError(err.response?.data?.message || err.message || 'Không thể lưu cài đặt.');
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [branchId]
  );

  const clearMessage = useCallback(() => setMessage(null), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    settings,
    loading,
    saving,
    error,
    message,
    saveSettings,
    clearMessage,
    clearError,
    fetchSettings,
  };
};

export default useBranchSettings;
