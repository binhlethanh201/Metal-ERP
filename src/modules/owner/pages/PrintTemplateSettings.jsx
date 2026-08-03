import React, { useEffect, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Card from '../../../shared/components/Card';
import { AlertCircle } from 'lucide-react';
import {
  getStockTemplate,
  upsertStockTemplate,
  deleteStockTemplate,
  getInvoiceTemplate,
  upsertInvoiceTemplate,
  deleteInvoiceTemplate,
} from '../services/printTemplateService';

const PAPER_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: 'K80', label: 'K80 (80mm)' },
  { value: 'K58', label: 'K58 (58mm)' },
];

const FONT_FAMILIES = [
  { value: 'monospace', label: 'Monospace' },
  { value: 'sans-serif', label: 'Sans serif' },
  { value: 'serif', label: 'Serif' },
];

const STOCK_TICKET_TYPES = [
  { value: 'PURCHASE', label: 'Phiếu nhập kho' },
  { value: 'SALE', label: 'Phiếu xuất kho' },
];

const DEFAULT_STOCK_TEMPLATE = {
  ticketType: 'PURCHASE',
  headerText: '',
  footerText: '',
  showLogo: false,
  logoUrl: '',
  paperSize: 'A5',
  fontSize: 12,
  fontFamily: 'monospace',
  showSupplier: true,
  showBranchInfo: true,
  branchName: '',
  branchAddress: '',
  phone: '',
  taxCode: '',
  showSignature: true,
  customFieldsJson: '{}',
  isActive: true,
};

const DEFAULT_INVOICE_TEMPLATE = {
  headerText: '',
  footerText: '',
  showLogo: false,
  logoUrl: '',
  paperSize: 'K80',
  fontSize: 12,
  fontFamily: 'monospace',
  showCustomerInfo: true,
  showCashierName: true,
  showBranchInfo: true,
  branchName: '',
  branchAddress: '',
  phone: '',
  taxCode: '',
  showPaymentMethod: true,
  thankYouMessage: 'Cảm ơn quý khách!',
  customFieldsJson: '{}',
  isActive: true,
};

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-slate-300 text-[#004785] focus:ring-[#004785]"
    />
    <span className="text-slate-700 dark:text-[#d4d4d4]">{label}</span>
  </label>
);

// eslint-disable-next-line 
const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
};

const PrintTemplateSettings = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [stockType, setStockType] = useState('PURCHASE');
  const [stockTemplate, setStockTemplate] = useState(DEFAULT_STOCK_TEMPLATE);
  const [invoiceTemplate, setInvoiceTemplate] = useState(DEFAULT_INVOICE_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const getFe = (prefix, field) => fieldErrors[prefix + '.' + field];

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateTemplate = (data, type) => {
    const errors = {};
    const prefix = type === 'stock' ? 'stock.' : 'invoice.';

    // fontSize: 8-24
    const fs = Number(data.fontSize);
    if (!Number.isFinite(fs) || fs < 8 || fs > 24) {
      errors[prefix + 'fontSize'] = 'Cỡ chữ phải từ 8 đến 24';
    }

    // phone: nếu có nhập thì phải đúng định dạng (10-11 số, bắt đầu bằng 0)
    if (data.phone && data.phone.trim()) {
      // eslint-disable-next-line
      const phoneClean = data.phone.replace(/[\s\.\-\(\)]/g, '');
      // eslint-disable-next-line
      if (!/^0\d{9,10}$/.test(phoneClean)) {
        errors[prefix + 'phone'] = 'SĐT phải 10-11 số, bắt đầu bằng 0';
      }
    }

    // taxCode: nếu có nhập thì phải 10-14 số
    if (data.taxCode && data.taxCode.trim()) {
      // eslint-disable-next-line
      if (!/^\d{10,14}$/.test(data.taxCode.replace(/[\s\-]/g, ''))) {
        errors[prefix + 'taxCode'] = 'MST phải là 10-14 chữ số';
      }
    }

    // logoUrl: nếu có nhập thì phải là URL hợp lệ
    if (data.logoUrl && data.logoUrl.trim()) {
      try {
        const url = new URL(data.logoUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors[prefix + 'logoUrl'] = 'URL phải bắt đầu bằng http:// hoặc https://';
        }
      } catch {
        errors[prefix + 'logoUrl'] = 'URL không hợp lệ';
      }
    }

    // headerText & footerText: giới hạn độ dài
    if (data.headerText && data.headerText.length > 500) {
      errors[prefix + 'headerText'] = 'Header không được quá 500 ký tự';
    }
    if (data.footerText && data.footerText.length > 500) {
      errors[prefix + 'footerText'] = 'Footer không được quá 500 ký tự';
    }
    if (data.thankYouMessage && data.thankYouMessage.length > 200) {
      errors[prefix + 'thankYouMessage'] = 'Lời cảm ơn không được quá 200 ký tự';
    }
    if (data.branchName && data.branchName.length > 100) {
      errors[prefix + 'branchName'] = 'Tên shop không được quá 100 ký tự';
    }
    if (data.branchAddress && data.branchAddress.length > 200) {
      errors[prefix + 'branchAddress'] = 'Địa chỉ không được quá 200 ký tự';
    }

    // taxRate chỉ dành cho invoice
    if (type === 'invoice' && data.taxRate !== undefined) {
      const tr = Number(data.taxRate);
      if (!Number.isFinite(tr) || tr < 0 || tr > 100) {
        errors[prefix + 'taxRate'] = 'Thuế VAT phải từ 0 đến 100';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (activeTab !== 'stock') return;
    setLoading(true);
    setError('');
    getStockTemplate(stockType)
      .then((res) => {
        const tpl = res?.data || res;
        if (tpl && tpl.ticketType) {
          setStockTemplate({ ...DEFAULT_STOCK_TEMPLATE, ...tpl, ticketType: stockType });
        } else {
          setStockTemplate({ ...DEFAULT_STOCK_TEMPLATE, ticketType: stockType });
        }
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải mẫu in phiếu kho.');
        setStockTemplate({ ...DEFAULT_STOCK_TEMPLATE, ticketType: stockType });
      })
      .finally(() => setLoading(false));
  }, [activeTab, stockType]);

  useEffect(() => {
    if (activeTab !== 'invoice') return;
    setLoading(true);
    setError('');
    getInvoiceTemplate()
      .then((res) => {
        const tpl = res?.data || res;
        if (tpl && (tpl.headerText !== undefined || tpl.paperSize !== undefined)) {
          setInvoiceTemplate({ ...DEFAULT_INVOICE_TEMPLATE, ...tpl });
        } else {
          setInvoiceTemplate(DEFAULT_INVOICE_TEMPLATE);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải mẫu in hóa đơn.');
        setInvoiceTemplate(DEFAULT_INVOICE_TEMPLATE);
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleSaveStock = async () => {
    if (!validateTemplate(stockTemplate, 'stock')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await upsertStockTemplate({ ...stockTemplate, ticketType: stockType });
      setSuccess('Đã lưu mẫu in phiếu kho.');
    } catch (err) {
      setError(err?.message || 'Không thể lưu mẫu in phiếu kho.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetStock = async () => {
    if (!window.confirm('Bạn có chắc muốn reset mẫu in phiếu kho về mặc định?')) return;
    setSaving(true);
    try {
      // Gọi API xóa, server sẽ fallback về global default
      await deleteStockTemplate(stockType).catch(() => {});
      setStockTemplate({ ...DEFAULT_STOCK_TEMPLATE, ticketType: stockType });
      setSuccess('Đã reset mẫu in phiếu kho về mặc định.');
    } catch (err) {
      setError(err?.message || 'Không thể reset mẫu in.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!validateTemplate(invoiceTemplate, 'invoice')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await upsertInvoiceTemplate(invoiceTemplate);
      setSuccess('Đã lưu mẫu in hóa đơn.');
    } catch (err) {
      setError(err?.message || 'Không thể lưu mẫu in hóa đơn.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetInvoice = async () => {
    if (!window.confirm('Bạn có chắc muốn reset mẫu in hóa đơn về mặc định?')) return;
    setSaving(true);
    try {
      await deleteInvoiceTemplate('default').catch(() => {});
      setInvoiceTemplate(DEFAULT_INVOICE_TEMPLATE);
      setSuccess('Đã reset mẫu in hóa đơn về mặc định.');
    } catch (err) {
      setError(err?.message || 'Không thể reset mẫu in.');
    } finally {
      setSaving(false);
    }
  };

  const updateStock = (field, value) => {
    setStockTemplate((prev) => ({ ...prev, [field]: value }));
    clearFieldError('stock.' + field);
  };

  const updateInvoice = (field, value) => {
    setInvoiceTemplate((prev) => ({ ...prev, [field]: value }));
    clearFieldError('invoice.' + field);
  };

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Cấu hình mẫu in</h1>
        <p className="mt-1 text-gray-600 dark:text-[#999999]">
          Tuỳ chỉnh mẫu in cho phiếu kho (nhập/xuất/kiểm kê) và hóa đơn bán hàng
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {Object.keys(fieldErrors).length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-amber-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Vui lòng sửa các lỗi sau trước khi lưu</p>
            <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
              {Object.entries(fieldErrors).map(([field, msg]) => (
                <li key={field}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <Icon name="check_circle" className="mt-0.5 text-green-500" size={20} />
          <p className="text-sm font-semibold text-green-700">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-[#333333]">
        <button
          type="button"
          onClick={() => { setActiveTab('stock'); setFieldErrors({}); setError(''); setSuccess(''); }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'stock'
              ? 'border-[#004785] text-[#004785] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#999999] dark:hover:text-[#e5e5e5]'
          }`}
        >
          Phiếu kho (Nhập/Xuất)
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('invoice'); setFieldErrors({}); setError(''); setSuccess(''); }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'invoice'
              ? 'border-[#004785] text-[#004785] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#999999] dark:hover:text-[#e5e5e5]'
          }`}
        >
          Hóa đơn bán hàng
        </button>
      </div>

      {activeTab === 'stock' && (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                  Loại phiếu
                </label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                >
                  {STOCK_TICKET_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetStock} disabled={saving} className="flex items-center gap-1.5">
                <Icon name="cached" size={14} /> Reset về mặc định
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveStock} disabled={saving} className="flex items-center gap-1.5">
                <Icon name="save" size={14} /> {saving ? 'Đang lưu...' : 'Lưu mẫu in'}
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-start">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Header & Footer
                    </h3>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Header (tiêu đề trên)</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                        value={stockTemplate.headerText}
                        onChange={(e) => updateStock('headerText', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Footer (chân phiếu)</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                        value={stockTemplate.footerText}
                        onChange={(e) => updateStock('footerText', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Logo URL (tuỳ chọn)"
                      value={stockTemplate.logoUrl}
                      onChange={(e) => updateStock('logoUrl', e.target.value)}
                      error={getFe('stock', 'logoUrl')}
                    />
                    <Toggle
                      checked={stockTemplate.showLogo}
                      onChange={(v) => updateStock('showLogo', v)}
                      label="Hiển thị logo"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Thông tin shop
                    </h3>
                    <Input
                      label="Tên shop"
                      value={stockTemplate.branchName}
                      onChange={(e) => updateStock('branchName', e.target.value)}
                      placeholder="Để trống để dùng mặc định"
                    />
                    <Input
                      label="Địa chỉ"
                      value={stockTemplate.branchAddress}
                      onChange={(e) => updateStock('branchAddress', e.target.value)}
                      placeholder="Để trống để dùng mặc định"
                    />
                    <Input
                      label="Mã số thuế"
                      value={stockTemplate.taxCode}
                      onChange={(e) => updateStock('taxCode', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Để trống để dùng mặc định"
                      maxLength={14}
                      error={getFe('stock', 'taxCode')}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Định dạng
                    </h3>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Khổ giấy</label>
                      <select
                        value={stockTemplate.paperSize}
                        onChange={(e) => updateStock('paperSize', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                      >
                        {PAPER_SIZES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Font chữ</label>
                      <select
                        value={stockTemplate.fontFamily}
                        onChange={(e) => updateStock('fontFamily', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                      >
                        {FONT_FAMILIES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Cỡ chữ"
                      type="number"
                      min={8}
                      max={24}
                      value={stockTemplate.fontSize}
                      onChange={(e) => updateStock('fontSize', e.target.value === '' ? '' : Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 0)))}
                      error={getFe('stock', 'fontSize')}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Hiển thị
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        checked={stockTemplate.showSupplier}
                        onChange={(v) => updateStock('showSupplier', v)}
                        label="Hiển thị nhà cung cấp"
                      />
                      <Toggle
                        checked={stockTemplate.showBranchInfo}
                        onChange={(v) => updateStock('showBranchInfo', v)}
                        label="Hiển thị thông tin shop"
                      />
                      <Toggle
                        checked={stockTemplate.showSignature}
                        onChange={(v) => updateStock('showSignature', v)}
                        label="Hiển thị ô chữ ký"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'invoice' && (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <Button variant="outline" size="sm" onClick={handleResetInvoice} disabled={saving} className="flex items-center gap-1.5">
                <Icon name="cached" size={14} /> Reset về mặc định
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveInvoice} disabled={saving} className="flex items-center gap-1.5">
                <Icon name="save" size={14} /> {saving ? 'Đang lưu...' : 'Lưu mẫu in'}
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-start">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Header & Footer
                    </h3>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Header (tiêu đề trên)</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                        value={invoiceTemplate.headerText}
                        onChange={(e) => updateInvoice('headerText', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Footer (chân hóa đơn)</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                        value={invoiceTemplate.footerText}
                        onChange={(e) => updateInvoice('footerText', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Lời cảm ơn"
                      value={invoiceTemplate.thankYouMessage}
                      onChange={(e) => updateInvoice('thankYouMessage', e.target.value)}
                    />
                    <Input
                      label="Logo URL (tuỳ chọn)"
                      value={invoiceTemplate.logoUrl}
                      onChange={(e) => updateInvoice('logoUrl', e.target.value)}
                      error={getFe('invoice', 'logoUrl')}
                    />
                    <Toggle
                      checked={invoiceTemplate.showLogo}
                      onChange={(v) => updateInvoice('showLogo', v)}
                      label="Hiển thị logo"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Thông tin shop
                    </h3>
                    <Input
                      label="Tên shop"
                      value={invoiceTemplate.branchName}
                      onChange={(e) => updateInvoice('branchName', e.target.value)}
                      placeholder="Để trống để dùng mặc định"
                    />
                    <Input
                      label="Địa chỉ"
                      value={invoiceTemplate.branchAddress}
                      onChange={(e) => updateInvoice('branchAddress', e.target.value)}
                      placeholder="Để trống để dùng mặc định"
                    />
                    <Input
                      label="Số điện thoại"
                      value={invoiceTemplate.phone}
                      onChange={(e) => updateInvoice('phone', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Để trống để dùng mặc định"
                      maxLength={11}
                      error={getFe('invoice', 'phone')}
                    />
                    <Input
                      label="Mã số thuế"
                      value={invoiceTemplate.taxCode}
                      onChange={(e) => updateInvoice('taxCode', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Để trống để dùng mặc định"
                      maxLength={14}
                      error={getFe('invoice', 'taxCode')}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Định dạng
                    </h3>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Khổ giấy</label>
                      <select
                        value={invoiceTemplate.paperSize}
                        onChange={(e) => updateInvoice('paperSize', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                      >
                        {PAPER_SIZES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Font chữ</label>
                      <select
                        value={invoiceTemplate.fontFamily}
                        onChange={(e) => updateInvoice('fontFamily', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                      >
                        {FONT_FAMILIES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Cỡ chữ"
                      type="number"
                      min={8}
                      max={24}
                      value={invoiceTemplate.fontSize}
                      onChange={(e) => updateInvoice('fontSize', parseInt(e.target.value, 10) || 12)}
                      error={getFe('invoice', 'fontSize')}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-[#999999]">
                      Hiển thị
                    </h3>
                    <div className="space-y-2">
                      <Toggle
                        checked={invoiceTemplate.showCustomerInfo}
                        onChange={(v) => updateInvoice('showCustomerInfo', v)}
                        label="Hiển thị thông tin khách hàng"
                      />
                      <Toggle
                        checked={invoiceTemplate.showCashierName}
                        onChange={(v) => updateInvoice('showCashierName', v)}
                        label="Hiển thị tên thu ngân"
                      />
                      <Toggle
                        checked={invoiceTemplate.showBranchInfo}
                        onChange={(v) => updateInvoice('showBranchInfo', v)}
                        label="Hiển thị thông tin shop"
                      />
                      <Toggle
                        checked={invoiceTemplate.showPaymentMethod}
                        onChange={(v) => updateInvoice('showPaymentMethod', v)}
                        label="Hiển thị phương thức thanh toán"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PrintTemplateSettings;