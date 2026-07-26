import React, { useState, useEffect } from 'react';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Icon from '../../../../shared/components/Icon';
import { useBranchSettings } from '../../hooks/useBranchSettings';

const BranchSettingsForm = ({ branchId }) => {
  const {
    settings,
    loading,
    saving,
    error,
    message,
    saveSettings,
    clearMessage,
    clearError,
  } = useBranchSettings(branchId);

  const [formData, setFormData] = useState({
    returnDaysAllowed: '',
    exchangeDaysAllowed: '',
  });

  // Sync form data when settings load
  useEffect(() => {
    setFormData({
      returnDaysAllowed: settings.returnDaysAllowed ?? '',
      exchangeDaysAllowed: settings.exchangeDaysAllowed ?? '',
    });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and empty string
    if (value === '' || /^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      returnDaysAllowed: formData.returnDaysAllowed === '' ? null : parseInt(formData.returnDaysAllowed, 10),
      exchangeDaysAllowed: formData.exchangeDaysAllowed === '' ? null : parseInt(formData.exchangeDaysAllowed, 10),
    };
    await saveSettings(data);
  };

  if (loading) {
    return (
      <Card header="Chính sách đổi/trả hàng">
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#004785] border-t-transparent" />
          <span className="ml-2 text-sm text-slate-500 dark:text-[#999999]">Đang tải...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Icon name="settings" size={18} className="text-[#004785]" />
          <span>Chính sách đổi/trả hàng</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Message/Error alerts */}
        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <Icon name="check_circle" size={16} />
            <span>{message}</span>
            <button
              type="button"
              onClick={clearMessage}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <Icon name="error" size={16} />
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Return Days */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Thời hạn trả hàng (ngày)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="returnDaysAllowed"
              value={formData.returnDaysAllowed}
              onChange={handleChange}
              placeholder="Ví dụ: 30 (để trống = không giới hạn)"
              hint="Số ngày kể từ ngày mua được phép trả hàng"
            />
          </div>

          {/* Exchange Days */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Thời hạn đổi hàng (ngày)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="exchangeDaysAllowed"
              value={formData.exchangeDaysAllowed}
              onChange={handleChange}
              placeholder="Ví dụ: 30 (để trống = không giới hạn)"
              hint="Số ngày kể từ ngày mua được phép đổi hàng"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Icon name="save" size={16} />
                <span>Lưu cài đặt</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BranchSettingsForm;
