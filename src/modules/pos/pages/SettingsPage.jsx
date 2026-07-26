/**
 * SettingsPage - Trang cài đặt POS
 * Route: /pos/settings
 * Lưu cài đặt cục bộ trong localStorage (backend chưa hỗ trợ /pos/settings)
 */
import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/Button';
import ReceiptSettings from '../components/settings/ReceiptSettings';
import PrinterSettings from '../components/settings/PrinterSettings';

const STORAGE_KEY = 'pos_receipt_settings';

const DEFAULT_SETTINGS = {
  receiptHeader: 'CẢM ƠN QUÝ KHÁCH',
  receiptFooter: 'Hẹn gặp lại!',
  vatRate: 8,
  printerName: '',
  autoPrint: false,
};

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load từ localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFormData({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Lỗi đọc settings:', e);
    }
    setLoading(false);
  }, []);

  const handleChange = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      // Lưu vào localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Lưu cài đặt thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004785]" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
          Quản lý cấu hình hóa đơn và máy in cho máy bán hàng
        </p>
      </div>

      <div className="space-y-6">
        {/* Receipt settings */}
        <ReceiptSettings data={formData} onChange={handleChange} disabled={saving} />

        {/* Printer settings */}
        <PrinterSettings data={formData} onChange={handleChange} disabled={saving} />
      </div>

      {/* Save button */}
      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isDirty || saving}
          loading={saving}
        >
          Lưu cài đặt
        </Button>
        {isDirty && <span className="text-sm text-amber-600">Bạn có thay đổi chưa lưu</span>}
        {saveSuccess && <span className="text-sm text-green-600">Lưu thành công!</span>}
      </div>
    </div>
  );
};

export default SettingsPage;
