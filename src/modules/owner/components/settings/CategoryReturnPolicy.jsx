import React, { useState, useEffect } from 'react';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import { useCategoryReturnPolicies } from '../../hooks/useCategoryReturnPolicies';
import branchSettingsService from '../../services/branchSettingsService';

const formatDuration = (totalDays) => {
  if (!totalDays) return '';
  let remaining = parseInt(totalDays);
  const years = Math.floor(remaining / 365);
  remaining %= 365;
  const months = Math.floor(remaining / 30);
  const days = remaining % 30;
  const parts = [];
  if (years) parts.push(`${years} năm`);
  if (months) parts.push(`${months} tháng`);
  if (days) parts.push(`${days} ngày`);
  return parts.join(' ') || '0 ngày';
};

const UNIT_OPTIONS = [
  { value: 'days', label: 'ngày' },
  { value: 'months', label: 'tháng' },
  { value: 'years', label: 'năm' },
];

const toTotalDays = (val, unit) => {
  const num = parseInt(val) || 0;
  if (unit === 'years') return num * 365;
  if (unit === 'months') return num * 30;
  return num;
};

const fromTotalDays = (totalDays) => {
  if (!totalDays) return { value: '', unit: 'days' };
  let remaining = parseInt(totalDays);
  const years = Math.floor(remaining / 365);
  if (years > 0) return { value: String(years), unit: 'years' };
  remaining %= 365;
  const months = Math.floor(remaining / 30);
  if (months > 0) return { value: String(months), unit: 'months' };
  const days = remaining % 30;
  return { value: String(days || ''), unit: 'days' };
};

const DurationInput = ({ label, value, onChange, hint }) => {
  const handleValueChange = (newVal) => {
    if (newVal === '' || /^\d*$/.test(newVal)) onChange({ ...value, value: newVal });
  };
  const handleUnitChange = (newUnit) => {
    onChange({ ...value, unit: newUnit });
  };

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="0"
          className="w-20 min-w-[5rem] rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
        />
        <select
          value={value.unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="w-28 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
        >
          {UNIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {!value.value && (
        <p className="mt-1 text-xs italic text-slate-400 dark:text-[#808080]">Để trống = không cho phép</p>
      )}
      <p className="mt-1 text-xs text-slate-400 dark:text-[#808080]">{hint}</p>
    </div>
  );
};

const CategoryReturnPolicy = ({ branchId }) => {
  const {
    categories,
    policies,
    loading,
    error,
    message,
    updatePolicy,
    savePolicies,
    clearMessage,
    clearError,
  } = useCategoryReturnPolicies(branchId);

  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formCategory, setFormCategory] = useState('');

  // Form state: lưu { value, unit } cho cả return và exchange
  const emptyDuration = { value: '', unit: 'days' };
  const [formReturn, setFormReturn] = useState({ ...emptyDuration });
  const [formExchange, setFormExchange] = useState({ ...emptyDuration });

  // Tiền phạt trả hàng branch-level (%) — áp dụng cho mọi nhóm hàng
  const [returnDiscount, setReturnDiscount] = useState('');
  const [returnDiscountLoaded, setReturnDiscountLoaded] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountMsg, setDiscountMsg] = useState(null);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  const getCategoryName = (cat) => {
    if (typeof cat === 'string') return cat;
    return cat?.name || '';
  };

  const getCategoryProductCount = (cat) => {
    if (typeof cat === 'string') return null;
    return cat?.productCount ?? null;
  };

  const getCategoryId = (cat) => (typeof cat === 'string' ? null : cat?.id || null);

  // Các nhóm hàng đã được thiết lập (có ít nhất 1 trong 2 policy)
  const configuredEntries = Object.values(policies).filter(
    (vals) => Number(vals.returnDays) > 0 || Number(vals.exchangeDays) > 0
  );

  // Các nhóm hàng chưa thiết lập policy nào
  const availableCategories = categories.filter((cat) => {
    const id = getCategoryId(cat);
    const name = getCategoryName(cat);
    const policy = policies[name] || (id ? policies[id] : null);
    return !policy || (!policy.returnDays && !policy.exchangeDays);
  });

  const getCatIdByName = (name) => {
    if (!name) return '';
    const entry = policies[name];
    if (entry) return entry.categoryId || '';
    // Scan values
    const found = Object.values(policies).find((p) => p.categoryName === name);
    return found?.categoryId || '';
  };

  const handleOpenAdd = () => {
    setEditCategory(null);
    const firstAvail = availableCategories[0];
    setFormCategory(firstAvail ? getCategoryName(firstAvail) : '');
    setFormReturn({ ...emptyDuration });
    setFormExchange({ ...emptyDuration });
    setShowModal(true);
  };

  const handleOpenEdit = (catName) => {
    const entry = policies[catName] || Object.values(policies).find((p) => p.categoryName === catName) || {};
    setEditCategory(catName);
    setFormCategory(catName);
    setFormReturn(fromTotalDays(entry.returnDays));
    setFormExchange(fromTotalDays(entry.exchangeDays));
    setShowModal(true);
  };

  const handleModalSave = async () => {
    const catName = editCategory || formCategory;
    if (!catName) return;

    const returnDays = toTotalDays(formReturn.value, formReturn.unit);
    const exchangeDays = toTotalDays(formExchange.value, formExchange.unit);

    // Block neu ca 2 deu trong (ko cho phep them policy rong)
    if (!returnDays && !exchangeDays) {
      alert('Vui lòng nhập ít nhất một thời hạn (Trả hàng hoặc Đổi hàng) trước khi thêm.');
      return;
    }

    const catId = getCatIdByName(catName);

    updatePolicy(catName, 'returnDays', String(returnDays), catId);
    updatePolicy(catName, 'exchangeDays', String(exchangeDays), catId);
    // Sync ngay xuống localStorage để ReturnForm dùng được
    syncToLocal(catId || catName, catName, String(returnDays), String(exchangeDays));

    // Lưu lên backend ngay (không cần bấm "Lưu cài đặt")
    // Xây dựng lại policies map từ policies hiện tại + thay đổi
    const key = catId || catName;
    const newEntry = {
      categoryId: catId,
      categoryName: catName,
      returnDays: String(returnDays),
      exchangeDays: String(exchangeDays),
    };
    const updated = { ...policies, [key]: newEntry };
    if (!returnDays && !exchangeDays) delete updated[key];
    await savePolicies(updated);

    setShowModal(false);
    setEditCategory(null);
  };

  const handleDelete = async (catName) => {
    if (!window.confirm(`Xóa toàn bộ chính sách đổi/trả cho nhóm hàng "${catName}"?`)) return;
    const catId = getCatIdByName(catName);
    updatePolicy(catName, 'returnDays', '', catId);
    updatePolicy(catName, 'exchangeDays', '', catId);
    syncToLocal(catId || catName, catName, '', '');
    // Lưu lên backend ngay
    const updated = { ...policies };
    const key = catId || catName;
    delete updated[key];
    await savePolicies(updated);
  };

  // Sync policies xuống localStorage ngay lập tức (ko cần đợi bấm Lưu cài đặt)
  const syncToLocal = (key, catName, returnDays, exchangeDays) => {
    try {
      const raw = localStorage.getItem('pos_category_return_policies');
      const stored = raw ? JSON.parse(raw) : {};
      const storeKey = key || catName;
      if (returnDays || exchangeDays) {
        stored[storeKey] = {
          categoryId: key || '',
          categoryName: catName || '',
          returnDays,
          exchangeDays,
        };
      } else {
        delete stored[storeKey];
        // Dọn dẹp entry cũ key bằng name nếu có
        if (key && catName && stored[catName]) {
          delete stored[catName];
        }
      }
      localStorage.setItem('pos_category_return_policies', JSON.stringify(stored));
    } catch {}
  };

  // Tải Tiền phạt trả hàng branch-level
  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    setReturnDiscountLoaded(false);
    (async () => {
      try {
        const res = await branchSettingsService.getReturnDiscount(branchId);
        const val = res?.data?.returnDiscountPercent;
        if (!cancelled) {
          setReturnDiscount(val != null ? String(val) : '');
          if (val != null && val !== '') setIsDiscountApplied(true);
        }
      } catch {
        if (!cancelled) setReturnDiscount('');
      } finally {
        if (!cancelled) setReturnDiscountLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]);

  // Đồng bộ Tiền phạt trả hàng xuống localStorage để ReturnForm dùng được
  const syncDiscountToLocal = (percent) => {
    try {
      localStorage.setItem('pos_return_discount_percent', percent || '');
    } catch {}
  };

  const handleSaveDiscount = async () => {
    const num = parseFloat(returnDiscount);
    if (returnDiscount !== '' && (isNaN(num) || num < 0 || num > 100)) {
      alert('Tiền phạt trả hàng phải là số từ 0 đến 100 (%).');
      return;
    }
    setSavingDiscount(true);
    setDiscountMsg(null);
    try {
      const value = returnDiscount === '' ? null : num;
      await branchSettingsService.updateReturnDiscount(branchId, value);
      syncDiscountToLocal(returnDiscount);
      setDiscountMsg('Đã lưu Tiền phạt trả hàng.');
      setIsDiscountApplied(true);
    } catch (e) {
      alert('Không thể lưu Tiền phạt trả hàng. Vui lòng thử lại.');
    } finally {
      setSavingDiscount(false);
    }
  };


  if (loading) {
    return (
      <Card
        header={
          <div className="flex items-center gap-2">
            <Icon name="category" size={18} className="text-[#004785]" />
            <span>Chính sách đổi/trả theo nhóm hàng</span>
          </div>
        }
      >
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="category" size={18} className="text-[#004785]" />
            <span>Chính sách đổi/trả theo nhóm hàng</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            disabled={availableCategories.length === 0}
            className="flex items-center gap-1.5"
          >
            <Icon name="add" size={16} />
            Thêm nhóm
          </Button>
        </div>
      }
    >
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

      {/* Tiền phạt trả hàng — áp dụng cho cả cửa hàng */}
      <div className={`mb-4 rounded-lg border p-4 transition-colors ${
        isDiscountApplied 
          ? 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10' 
          : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
      }`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Icon name="sell" size={18} className={isDiscountApplied ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-[#e5e5e5]">
                  Tiền phạt trả hàng
                </p>
                <p className="text-xs text-slate-500 dark:text-[#999999]">
                  Trừ vào tiền hoàn lại — áp dụng cho mọi nhóm hàng
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="decimal"
                  value={returnDiscount}
                  disabled={!returnDiscountLoaded || isDiscountApplied}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d*([.,]\d*)?$/.test(v)) setReturnDiscount(v.replace(',', '.'));
                  }}
                  placeholder="0"
                  className="w-20 min-w-[5rem] rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium focus:border-[#004785] focus:outline-none disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-700 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:disabled:bg-[#2a2a2a] dark:disabled:text-[#a3a3a3]"
                />
                <span className="text-sm font-medium text-slate-500 dark:text-[#999999]">%</span>
              </div>
              {isDiscountApplied ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDiscountApplied(false)}
                  className="flex items-center gap-1.5 border-green-600 text-green-700 hover:bg-green-100 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/50"
                >
                  <Icon name="edit" size={16} />
                  Chỉnh sửa
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDiscount}
                  disabled={savingDiscount || !returnDiscountLoaded}
                  className="flex items-center gap-1.5"
                >
                  <Icon name="save" size={16} />
                  {savingDiscount ? 'Đang lưu...' : 'Áp dụng'}
                </Button>
              )}
            </div>
          </div>
          {discountMsg && (
            <p className="mt-2 text-xs font-medium text-green-700 dark:text-green-400">{discountMsg}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-400 dark:text-[#808080]">
            Vd 10% → khách trả hàng hoàn 1.000.000đ sẽ nhận 900.000đ. Để trống = không chiết khấu.
          </p>
        </div>

      {configuredEntries.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
          <Icon name="info" size={32} className="mx-auto mb-3 text-slate-300 dark:text-[#666666]" />
          <p className="font-medium">Chưa có thiết lập nào</p>
          <p className="mt-1">
            Nhấn "Thêm nhóm" để thiết lập chính sách đổi/trả cho từng nhóm hàng.
          </p>
          <p className="mt-1 text-xs">
            Sản phẩm không thuộc nhóm được thiết lập sẽ không được phép đổi/trả.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-[#333333] dark:text-[#999999]">
                <th className="pb-3 pr-4">Nhóm hàng</th>
                <th className="pb-3 pr-4">SL SP</th>
                <th className="pb-3 pr-4">Trả hàng</th>
                <th className="pb-3 pr-4">Đổi hàng</th>
              </tr>
            </thead>
            <tbody>
              {configuredEntries.map((vals) => {
                const catName = vals.categoryName || '';
                const cat = categories.find((c) => getCategoryName(c) === catName);
                const productCount = cat ? getCategoryProductCount(cat) : null;
                return (
                  <tr
                    key={vals.categoryId || catName}
                    className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/70 dark:border-[#333333] dark:hover:bg-blue-900/30"
                    onClick={() => handleOpenEdit(catName)}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-[#e5e5e5]">{catName || vals.categoryId}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-[#999999]">
                      {productCount !== null ? `${productCount}` : '-'}
                    </td>
                    <td className="py-3 pr-4">
                      {vals.returnDays ? (
                        <span className="font-semibold text-green-700">
                          {formatDuration(vals.returnDays)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-[#666666]">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {vals.exchangeDays ? (
                        <span className="font-semibold text-blue-700">
                          {formatDuration(vals.exchangeDays)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-[#666666]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#333333]">
        <p className="text-xs text-slate-400 dark:text-[#808080]">
          Chỉ sản phẩm thuộc nhóm hàng được thiết lập mới được phép đổi/trả. Để trống = không cho
          phép.
        </p>
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editCategory ? 'Sửa chính sách nhóm hàng' : 'Thêm chính sách nhóm hàng'}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              {editCategory && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                  onClick={() => { handleDelete(editCategory); setShowModal(false); }}
                >
                  Xóa
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleModalSave}
                disabled={editCategory ? false : !formCategory}
              >
                {editCategory ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {!editCategory ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                Nhóm hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                {availableCategories.map((cat) => (
                  <option key={getCategoryName(cat)} value={getCategoryName(cat)}>
                    {getCategoryName(cat)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Nhóm hàng</label>
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]">
                {editCategory}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <DurationInput
              label="Trả hàng (hoàn tiền)"
              value={formReturn}
              onChange={setFormReturn}
              placeholder="không cho phép"
              hint="Thời hạn được phép trả hàng hoàn tiền. Để trống = không cho trả."
            />
            <DurationInput
              label="Đổi hàng"
              value={formExchange}
              onChange={setFormExchange}
              placeholder="không cho phép"
              hint="Thời hạn được phép đổi hàng. Để trống = không cho đổi."
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default CategoryReturnPolicy;
