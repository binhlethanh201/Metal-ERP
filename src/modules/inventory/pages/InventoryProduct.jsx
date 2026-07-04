/**
 * TRANG HÀNG HÓA - Consolidated
 */
import { useState, useEffect, Fragment } from 'react';
import Icon from '../../../shared/components/Icon';
import { useProductFilters } from '../hooks/useProductFilters';
import {
  getProduct,
  getCategories,
  renameCategory,
  deleteCategory,
  getBrands,
  renameBrand,
  deleteBrand,
} from '../services/productService';
import { useProductList } from '../hooks/useProductList';
import { useEditProductForm } from '../hooks/useEditProductForm';
import { formatMoney } from '../utils/productUtils';

/* ==================== CONFIG / UTILITY ==================== */
const estimatedQuickRanges = [
  { label: 'Hôm nay', group: 'estimated' },
  { label: 'Ngày mai', group: 'estimated' },
  { label: '3 ngày tới', group: 'estimated' },
  { label: '5 ngày tới', group: 'estimated' },
  { label: '7 ngày tới', group: 'estimated' },
  { label: '30 ngày tới', group: 'estimated' },
  { label: 'Tháng này', group: 'estimated' },
];

const createdQuickRanges = [
  { label: 'Hôm nay', group: 'created' },
  { label: 'Hôm qua', group: 'created' },
  { label: 'Tuần này', group: 'created' },
  { label: 'Tuần trước', group: 'created' },
  { label: 'Tháng này', group: 'created' },
  { label: 'Tháng trước', group: 'created' },
];

const fmtMoney = (v) => formatMoney(v);
const fmtDateTime = (dateStr) => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

/* ==================== FILTER POPOVERS ==================== */
const DatePickerPopup = ({ onCancel, onApply }) => (
  <div className="absolute left-[calc(100%+10px)] top-14 z-30 w-[620px] rounded-xl border border-slate-200 bg-white shadow-2xl">
    <div className="px-4 pb-3 pt-4">
      <p className="text-sm text-slate-500">
        Từ ngày: <span className="font-semibold text-slate-800">01/05/2026</span> - Đến ngày:{' '}
        <span className="font-semibold text-slate-800">31/05/2026</span>
      </p>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <button type="button" className="text-base font-semibold text-blue-600" onClick={onCancel}>
        Hôm nay
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-base font-semibold text-slate-600"
          onClick={onCancel}
        >
          Bỏ qua
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-base font-semibold text-white"
          onClick={onApply}
        >
          Áp dụng
        </button>
      </div>
    </div>
  </div>
);

const QuickRangePopover = ({ ranges, onSelect, onReset }) => (
  <div
    className="absolute left-[calc(100%+10px)] top-6 z-30 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
    style={{ width: ranges.length <= 3 ? '500px' : '740px' }}
  >
    <div className={`grid gap-4 ${ranges.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
      {ranges.map((col) => (
        <div key={col.title || col.label}>
          <p className="mb-2 text-sm font-bold text-slate-800">{col.title || 'Mốc thời gian'}</p>
          <div className="flex flex-col gap-2">
            {(col.options || [col.label]).map((opt) => (
              <button
                key={opt}
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-left text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600"
                onClick={() => onSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white"
        onClick={onReset}
      >
        Toàn thời gian
      </button>
    </div>
  </div>
);

/* ==================== FORM COMPONENTS ==================== */
const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="mb-6 overflow-hidden rounded-[10px] border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="mb-2 text-[20px] font-semibold leading-tight text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="text-body-md mb-0 leading-relaxed text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="ml-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
          >
            <Icon
              name="ChevronDown"
              className={`text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
};

const AutocompleteInput = ({ label, value, onChange, options = [], placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const kw = (value || '').toLowerCase();
    setFilteredOptions(options.filter((opt) => opt.toLowerCase().includes(kw)));
  }, [value, options]);

  return (
    <div className="relative space-y-2">
      <label className="text-label-md text-on-surface-variant">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          placeholder={placeholder || 'Chọn hoặc nhập mới...'}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name="expand_more" size={18} />
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ImageUploader = ({
  images = [],
  maxImages,
  fileInputRef,
  onOpenFilePicker,
  onUpload,
  onPinImage,
  onRemoveImage,
  onAddImageUrl,
  productName,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    const url = (urlInput || '').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      alert('Link ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    if (images.length >= maxImages) {
      alert(`Chỉ được tối đa ${maxImages} ảnh`);
      return;
    }
    onAddImageUrl?.(url);
    setUrlInput('');
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        onChange={onUpload}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />
      <div className="flex w-full items-start gap-4">
        <div className="relative flex-1 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb]">
          <div className="aspect-[1/1] w-full">
            {images?.length > 0 ? (
              <img
                src={images[0].url}
                alt={productName || 'Product'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center py-8 text-gray-400">
                <button
                  type="button"
                  onClick={onOpenFilePicker}
                  className="flex flex-col items-center gap-2"
                >
                  <Icon name="add" className="text-gray-400" size={28} />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </div>
            )}
          </div>
          {images?.length > 0 && (
            <div className="absolute left-2 top-2 z-20 rounded-full bg-black/75 px-3 py-1 text-[12px] font-semibold text-white">
              Main
            </div>
          )}
        </div>
        <div className="flex w-20 flex-col items-center gap-3">
          {images.length < maxImages ? (
            <button
              onClick={onOpenFilePicker}
              type="button"
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed border-[#d1d5db] bg-white text-xl text-[#6b7280] transition-all duration-200 hover:border-blue-600 hover:bg-[#eff6ff] hover:text-blue-600"
            >
              <Icon name="add" size={20} />
            </button>
          ) : (
            <div className="h-20 w-20" />
          )}
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative h-20 w-20 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]"
            >
              <button
                type="button"
                onClick={() => onPinImage(idx)}
                className="absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90 shadow-sm"
                title={idx === 0 ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}
              >
                <Icon
                  name="push_pin"
                  className={idx === 0 ? 'text-blue-600' : 'text-gray-600'}
                  size={14}
                />
              </button>
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute bottom-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90 shadow-sm"
                title="Xóa ảnh"
              >
                <Icon name="delete" className="text-red-500" size={14} />
              </button>
              <img
                src={img.url}
                alt={`thumb-${idx}`}
                className={`h-full w-full object-cover ${idx === 0 ? 'ring-2 ring-blue-300' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full items-stretch gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder="Dán link ảnh (https://...) rồi nhấn Thêm"
          className="flex-1 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Icon name="add" size={16} />
          <span>Thêm</span>
        </button>
      </div>
      {images.length >= maxImages && (
        <p className="text-xs text-amber-600">Đã đạt tối đa {maxImages} ảnh.</p>
      )}
    </div>
  );
};

const AttributeEditor = ({ f }) => (
  <>
    <h4 className="mb-1 text-[18px] font-semibold text-gray-800">Thuộc tính</h4>
    <p className="mb-5 text-[14px] text-gray-500">Thêm đặc điểm như hương vị, dung tích, màu sắc</p>
    <div className="space-y-3">
      {(f.form.attributes || []).map((attr) => (
        <div
          key={attr.id}
          className="grid items-center"
          style={{ gridTemplateColumns: '230px 1fr 52px', gap: '12px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                f.setOpenDropdownId(f.openDropdownId === attr.id ? null : attr.id);
              }}
              className={`h-12 w-full border bg-white px-4 text-left ${f.openDropdownId === attr.id ? 'border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-[#d1d5db]'} flex items-center justify-between rounded-[10px] text-[16px]`}
            >
              <span className={`truncate ${attr.name ? 'text-gray-800' : 'text-gray-500'}`}>
                {attr.name || 'Chọn thuộc tính'}
              </span>
              <Icon name="expand_more" size={16} className="text-gray-500" />
            </button>
            {f.openDropdownId === attr.id && (
              <div
                className="absolute bottom-full left-0 z-50 mb-2 w-full origin-bottom transform overflow-hidden rounded-lg bg-white shadow-lg"
                style={{ padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              >
                {(f.availableAttributes || []).map((item, aidx) => (
                  <div
                    key={item + aidx}
                    onClick={() => {
                      f.updateAttr(attr.id, 'name', item);
                      f.setOpenDropdownId(null);
                    }}
                    className={`flex h-11 cursor-pointer items-center justify-between px-4 ${attr.name === item ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  >
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        f.setEditAttrIndex(aidx);
                        f.setEditAttrValue(item);
                        f.setEditAttrModalOpen(true);
                        f.setOpenDropdownId(null);
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => {
                    f.setEditingAttrId(attr.id);
                    f.setNewAttrName('');
                    f.setCreateAttrModalOpen(true);
                    f.setOpenDropdownId(null);
                  }}
                  className="flex h-11 cursor-pointer items-center px-4 hover:bg-gray-100"
                >
                  <span className="font-medium text-blue-600">+ Tạo thuộc tính mới</span>
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Nhập giá trị thuộc tính"
            value={attr.value || ''}
            onChange={(e) => f.updateAttr(attr.id, 'value', e.target.value)}
            className="h-12 rounded-[10px] bg-[#f3f4f6] px-4 text-[16px] placeholder-gray-400 focus:border focus:border-blue-600 focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => f.removeAttr(attr.id)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            f.addAttrRow();
          }}
          className="mt-2 flex items-center gap-1 text-[18px] font-medium text-blue-600 hover:underline"
        >
          <Icon name="add" size={18} />
          <span>Thêm thuộc tính</span>
        </button>
      </div>
    </div>
  </>
);

const UnitManagement = ({ f }) => (
  <div className="mb-8">
    <h4 className="text-label-md mb-1 font-bold text-on-surface">Đơn vị tính</h4>
    <p className="text-body-md mb-6 leading-relaxed text-on-surface-variant">
      Thêm đơn vị bán hoặc nhập như chai, lốc, thùng. Đặt công thức quy đổi để tính nhanh giá và tồn
      kho.
    </p>
    <div className="mb-6 flex flex-wrap items-end gap-5">
      <div className="min-w-[200px] flex-1 space-y-2">
        <label className="text-label-md text-on-surface-variant">Tên đơn vị cơ bản</label>
        <input
          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
          placeholder="Ví dụ: chai"
          type="text"
          value={f.form.baseUnit?.name || ''}
          onChange={(e) =>
            f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), name: e.target.value })
          }
        />
      </div>
      <div className="w-40 space-y-2">
        <label className="text-label-md text-on-surface-variant">Giá bán</label>
        <input
          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-right focus:ring-0"
          type="text"
          value={fmtMoney(f.form.baseUnit?.price || 0)}
          onChange={(e) =>
            f.handleChange('baseUnit', {
              ...(f.form.baseUnit || {}),
              price: Number(e.target.value.replaceAll('.', '').replaceAll(',', '')) || 0,
            })
          }
        />
      </div>
      <div className="flex items-center space-x-2 pb-2.5">
        <input
          checked={!!f.form.baseUnit?.directSale}
          type="checkbox"
          id="direct-sell-main"
          className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8] focus:ring-[#1E6BB8]"
          onChange={(e) =>
            f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), directSale: e.target.checked })
          }
        />
        <label className="cursor-pointer text-[15px] leading-[1.35]" htmlFor="direct-sell-main">
          Bán trực tiếp
        </label>
      </div>
    </div>
    {(f.form.conversionUnits || []).length > 0 && <div className="mb-6 border-t border-gray-200" />}
    {(f.form.conversionUnits || []).length > 0 && (
      <div className="mb-6 space-y-3">
        <h5 className="text-[14px] font-semibold text-gray-700">Đơn vị quy đổi</h5>
        {(f.form.conversionUnits || []).map((unit) => (
          <div
            key={unit.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-medium text-gray-700">1</span>
              <span className="text-[14px] font-semibold text-gray-700">{unit.name}</span>
              <span className="text-[16px] font-semibold text-gray-600">=</span>
              <span className="text-[14px] font-medium text-gray-700">
                {unit.rate || unit.convertValue}
              </span>
              <span className="text-[14px] font-semibold text-gray-700">
                {f.form.baseUnit?.name || 'Cái'}
              </span>
            </div>
            <div className="min-w-[20px] flex-1" />
            <div className="min-w-[100px] text-right">
              <span className="text-[14px] text-gray-600">
                {unit.price
                  ? fmtMoney(unit.price)
                  : fmtMoney(
                      (Number(f.form.baseUnit?.price) || 0) *
                        (Number(unit.rate || unit.convertValue) || 1)
                    )}{' '}
                đ
              </span>
            </div>
            <div className="flex flex-none items-center space-x-2">
              <input
                type="checkbox"
                checked={unit.directSale !== false}
                onChange={(e) => f.updateConversionUnit(unit.id, 'directSale', e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8]"
              />
              <span className="text-[14px] text-gray-600">Bán</span>
            </div>
            <button
              type="button"
              onClick={() => f.removeConversionUnit(unit.id)}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        ))}
      </div>
    )}
    <button
      type="button"
      onClick={() => f.setAddConversionUnitModal(true)}
      className="text-body-md flex items-center font-semibold text-[#1E6BB8] hover:underline"
    >
      <Icon name="add" size={18} />
      <span>Thêm đơn vị</span>
    </button>
  </div>
);

/* ==================== MODAL SUB-COMPONENTS ==================== */
const ModalWrapper = ({ children }) => (
  <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
      {children}
    </div>
  </div>
);

const ModalFooter = ({ onCancel, onSave, saveLabel = 'Lưu', extraLeft }) => (
  <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
    <div>{extraLeft}</div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
      >
        Bỏ qua
      </button>
      <button
        type="button"
        onClick={onSave}
        className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
      >
        {saveLabel}
      </button>
    </div>
  </div>
);

const CreateLocationModal = ({ open, newLocationName, setNewLocationName, onClose, onSave }) => {
  if (!open) return null;
  const handleKey = (e) => {
    if (e.key === 'Enter' && (newLocationName || '').trim()) {
      e.preventDefault();
      onSave?.();
    }
  };
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo vị trí</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">
          Vị trí <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          onKeyDown={handleKey}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} />
    </ModalWrapper>
  );
};

const CreateAttributeModal = ({ open, newAttrName, setNewAttrName, onClose, onSave }) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo thuộc tính</h3>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
        <input
          type="text"
          value={newAttrName}
          onChange={(e) => setNewAttrName(e.target.value)}
          placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Xong" />
    </ModalWrapper>
  );
};

const EditAttributeModal = ({
  open,
  editAttrValue,
  setEditAttrValue,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Sửa thuộc tính</h3>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
        <input
          type="text"
          value={editAttrValue}
          onChange={(e) => setEditAttrValue(e.target.value)}
          placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
        />
      </div>
      <ModalFooter
        onCancel={onClose}
        onSave={onSave}
        saveLabel="Xong"
        extraLeft={
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 items-center gap-2 rounded-md border border-transparent bg-white px-3 text-sm font-medium text-gray-700 hover:bg-red-50"
          >
            <Icon name="delete" />
            <span className="text-sm">Xóa</span>
          </button>
        }
      />
    </ModalWrapper>
  );
};

const AddConversionUnitModal = ({
  open,
  newConversionUnit,
  setNewConversionUnit,
  form,
  formatMoney: fm,
  onClose,
  onSave,
}) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Thêm đơn vị quy đổi</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="mb-2 block text-sm text-gray-700">Tên đơn vị</label>
          <input
            type="text"
            value={newConversionUnit.name || ''}
            onChange={(e) => setNewConversionUnit({ ...newConversionUnit, name: e.target.value })}
            placeholder="Ví dụ: lốc, thùng"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-700">Giá trị quy đổi (Rate)</label>
            <input
              type="number"
              value={newConversionUnit.rate || newConversionUnit.convertValue || ''}
              onChange={(e) =>
                setNewConversionUnit({
                  ...newConversionUnit,
                  rate: e.target.value,
                  convertValue: e.target.value,
                })
              }
              placeholder="Ví dụ: 12, 24"
              min="1"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-700">Giá bán</label>
            <input
              type="number"
              value={newConversionUnit.price || ''}
              onChange={(e) =>
                setNewConversionUnit({ ...newConversionUnit, price: e.target.value })
              }
              placeholder="Giá bán của đơn vị này"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Thêm" />
    </ModalWrapper>
  );
};

/* ==================== CATEGORY / BRAND MANAGER MODAL ==================== */
const CategoryBrandManagerModal = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'categories' ? await getCategories() : await getBrands();
      if (res?.success && Array.isArray(res?.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  const handleRename = async (oldName) => {
    const trimmed = (newNameInput || '').trim();
    if (!trimmed || trimmed === oldName) {
      setEditingName('');
      return;
    }
    try {
      const res =
        activeTab === 'categories'
          ? await renameCategory(oldName, trimmed)
          : await renameBrand(oldName, trimmed);
      if (res?.success) {
        alert(res?.message || 'Đổi tên thành công');
        setEditingName('');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi đổi tên');
    }
  };

  const handleDelete = async (item) => {
    const isCat = activeTab === 'categories';
    const label = isCat ? 'nhóm hàng' : 'thương hiệu';
    if (
      !window.confirm(
        `Thao tác này sẽ gỡ ${label} "${item.name}" khỏi ${item.productCount} sản phẩm.\nBạn có chắc chắn muốn tiếp tục?`
      )
    ) {
      return;
    }

    try {
      const res = isCat ? await deleteCategory(item.name) : await deleteBrand(item.name);
      if (res?.success) {
        alert(res?.message || 'Xóa thành công');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(err?.data?.message || 'Lỗi khi xóa');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Quản lý Nhóm hàng & Thương hiệu</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Nhóm hàng (Categories)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`ml-8 py-3 font-semibold ${activeTab === 'brands' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Thương hiệu (Brands)
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Chưa có dữ liệu nào.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase text-gray-500">
                  <th className="pb-3">Tên</th>
                  <th className="pb-3 text-center">Số lượng sản phẩm</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {items.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">
                      {editingName === item.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newNameInput}
                            onChange={(e) => setNewNameInput(e.target.value)}
                            className="rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRename(item.name)}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingName('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {item.productCount} Sản phẩm
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {editingName !== item.name && (
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingName(item.name);
                              setNewNameInput(item.name);
                            }}
                            className="text-gray-500 hover:text-blue-600"
                            title="Đổi tên"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="text-gray-500 hover:text-red-600"
                            title="Xóa / Gỡ khỏi sản phẩm"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================== PRODUCT DETAIL PANEL ==================== */
const SummaryBar = ({ row }) => {
  const items = [
    { label: 'Mã SP', value: row.productCode || row.id },
    { label: 'Tên SP', value: row.productName || row.name },
    { label: 'Giá bán', value: `${fmtMoney(row.salePrice)} đ` },
    { label: 'Giá vốn', value: `${fmtMoney(row.costPrice)} đ` },
    { label: 'Tồn kho', value: row.actualStock ?? row.stock ?? 0 },
    {
      label: 'Trạng thái',
      value: row.isActive !== false && row.status !== 'inactive' ? 'Đang bán' : 'Ngừng bán',
    },
  ];
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 pb-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-500">{it.label}:</span>
          <span className="font-bold text-slate-800">{it.value || '-'}</span>
        </div>
      ))}
    </div>
  );
};

const InfoTabPanel = ({ row, loading }) => {
  if (loading)
    return <div className="p-8 text-center text-slate-400">Đang tải thông tin chi tiết...</div>;
  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img
            src={
              row.imageUrl ||
              row.image ||
              'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop'
            }
            alt={row.productName || row.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-slate-900">{row.productName || row.name}</h3>
          <p className="mb-3 text-xs text-slate-500">
            Danh mục:{' '}
            <span className="font-bold uppercase text-slate-700">
              {row.categoryName || row.group || 'Chưa có'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {row.unit || 'Sản phẩm'}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {row.directSale !== false ? 'Bán trực tiếp' : 'Không bán trực tiếp'}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Mã hàng', row.productCode || row.id],
          ['Mã vạch', row.barcode || 'Chưa có'],
          ['Tồn thực tế', row.actualStock ?? row.stock ?? 0],
          ['Tồn khả dụng', row.availableStock ?? row.stock ?? 0],
          ['Giá vốn', `${fmtMoney(row.costPrice)} đ`],
          ['Giá bán', `${fmtMoney(row.salePrice)} đ`],
          ['Thương hiệu', row.brandName || row.brand || 'Chưa có'],
          ['Vị trí', row.shelfLocation || row.location || 'Chưa có'],
          ['Trọng lượng', row.weight ? `${row.weight} ${row.weightUnit || 'g'}` : 'Chưa có'],
          ['Kích thước', row.specification || row.specificationDetail || 'Chưa có'],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1 border-b border-slate-100 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
              {label}
            </p>
            <p
              className={`text-sm font-bold ${value === 'Chưa có' ? 'text-slate-400' : 'text-slate-800'}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DescTabPanel = ({ row, loading, onEdit }) => {
  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Mô tả</h4>
        <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
          {row.specification || row.description || 'Chưa có mô tả kỹ thuật'}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onEdit?.(row, 'description')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="edit" size={16} /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

const PlaceholderTab = ({ title }) => (
  <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-400">
    {title} - Đang phát triển
  </div>
);

const StatusToggleModal = ({ open, onClose, onConfirm, isActive }) => {
  if (!open) return null;
  const isStopping = isActive !== false;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">
            {isStopping ? 'Ngừng kinh doanh' : 'Mở bán lại'}
          </h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-gray-100">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="p-6 text-sm text-slate-600">
          {isStopping
            ? 'Sản phẩm sẽ bị ẩn khỏi các kênh bán hàng. Thông tin tồn kho vẫn được giữ nguyên. Bạn có chắc chắn?'
            : 'Sản phẩm sẽ hiển thị lại và có thể giao dịch bình thường. Bạn có muốn tiếp tục?'}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white ${isStopping ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const BottomToolbar = ({ row, fullData, onEdit, onDelete, onToggleStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4">
      <div className="flex gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(row.id || row.productId);
          }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600"
        >
          <Icon name="delete" size={18} /> Xóa
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(fullData);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Icon name="edit" size={18} /> Chỉnh sửa
        </button>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Icon name="more_horiz" size={20} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 z-30 mb-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStatusModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {row.isActive !== false && row.status !== 'inactive'
                  ? 'Ngừng kinh doanh'
                  : 'Mở bán lại'}
              </button>
            </div>
          )}
        </div>
      </div>
      <StatusToggleModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        isActive={row.isActive !== false && row.status !== 'inactive'}
        onConfirm={() => onToggleStatus?.(row.id || row.productId, row.isActive)}
      />
    </div>
  );
};

const ProductDetailPanel = ({ row, onEdit, onDelete, onToggleStatus }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [fullData, setFullData] = useState(row);
  const [loading, setLoading] = useState(false);
  const TABS = [
    { key: 'info', label: 'Thông tin' },
    { key: 'desc', label: 'Mô tả, ghi chú' },
    { key: 'stock-card', label: 'Thẻ kho' },
    { key: 'inventory', label: 'Tồn kho' },
  ];
  const productId = row?.id || row?.productId;

  useEffect(() => {
    setFullData((prev) => ({
      ...prev,
      ...row,
    }));
    const fetchDetail = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await getProduct(productId);
        if (res?.success && res?.data) setFullData((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error('Lỗi tải chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-4 sm:p-6">
      <SummaryBar row={fullData} />
      <div className="mt-4 flex gap-0 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === 'info' && <InfoTabPanel row={fullData} loading={loading} />}
        {activeTab === 'desc' && <DescTabPanel row={fullData} loading={loading} onEdit={onEdit} />}
        {activeTab === 'stock-card' && <PlaceholderTab title="Thẻ kho" />}
        {activeTab === 'inventory' && <PlaceholderTab title="Tồn kho" />}
      </div>
      {activeTab === 'info' && (
        <BottomToolbar
          row={row}
          fullData={fullData}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      )}
    </div>
  );
};

/* ==================== PRODUCT TABLE ==================== */
const ProductTable = ({
  rows = [],
  sortConfig,
  getSortIcon,
  onToggleSort,
  onToggleStatus,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
}) => {
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const columns = [
    ['Mã hàng', 'code', 'w-[140px]'],
    ['Tên hàng', 'name', 'w-[240px]'],
    ['Đơn vị', '', 'w-[90px]'],
    ['Thương hiệu', '', 'w-[130px]'],
    ['Giá bán', 'saleprice', 'w-[110px]'],
    ['Giá vốn', 'costprice', 'w-[110px]'],
    ['Tồn kho', 'stock', 'w-[110px]'],
    ['Vị trí kho', '', 'w-[110px]'],
    ['Hoạt động', '', 'w-[90px]'],
    ['Thời gian tạo', 'createdat', 'w-[160px]'],
  ];
  return (
    <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
      <thead className="border-b border-slate-200 bg-[#e8f0fe]">
        <tr className="text-[11px] font-bold uppercase text-slate-600">
          <th className="w-[48px] px-4 py-3 text-center">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary focus:ring-primary"
              checked={isAllSelected}
              onChange={(e) => onSelectAll?.(e.target.checked, rows)}
            />
          </th>
          <th className="w-[40px] px-2 py-3">
            <Icon name="star_outline" className="text-slate-400" size={16} />
          </th>
          {columns.map(([label, sortKey, widthClass]) => {
            const isSorted = sortConfig?.key === sortKey;
            const isNumCol = label === 'Giá bán' || label === 'Giá vốn' || label === 'Tồn kho';
            return (
              <th
                key={label}
                className={`${widthClass} ${sortKey ? 'cursor-pointer select-none' : ''} px-4 py-3 ${isNumCol ? 'text-right' : ''}`}
                onClick={() => sortKey && onToggleSort?.(sortKey)}
              >
                <div className={`flex items-center gap-1 ${isNumCol ? 'justify-end' : ''}`}>
                  <span className="truncate">{label}</span>
                  {sortKey && (
                    <Icon
                      name={getSortIcon?.(sortKey) || 'unfold_more'}
                      size={14}
                      className={isSorted ? 'font-bold text-blue-600' : 'text-slate-400 opacity-50'}
                    />
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => {
          const isExpanded = expandedId === (row.id || row.productId);
          const currentId = row.id || row.productId;
          const isSelected = selectedIds.includes(currentId);
          return (
            <Fragment key={currentId}>
              <tr
                className={`group cursor-pointer transition-colors hover:bg-blue-50 ${isExpanded || isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => onToggleExpand?.(currentId)}
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectRow?.(currentId, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-2 py-3">
                  <Icon
                    name="star_outline"
                    className="text-slate-300 transition-colors group-hover:text-amber-400"
                    size={16}
                  />
                </td>
                <td className="overflow-hidden px-4 py-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100">
                      {row.imageUrl || row.image ? (
                        <img
                          src={row.imageUrl || row.image}
                          alt={row.productName || row.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon name="image" className="text-slate-400" size={20} />
                      )}
                    </div>
                    <span className="truncate font-medium text-primary">
                      {row.productCode || row.id}
                    </span>
                  </div>
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-700">
                  {row.productName || row.name}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.unit || '---'}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.brandName || row.brand || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                  {fmtMoney(row.salePrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                  {fmtMoney(row.costPrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                  {row.actualStock ?? row.stock ?? 0}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-500">
                  {row.shelfLocation || row.location || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={row.isActive !== false && row.status !== 'inactive'}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleStatus?.(
                          currentId,
                          row.isActive !== false && row.status !== 'inactive'
                        );
                      }}
                    />
                    <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                  </label>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                  {fmtDateTime(row.createdAt)}
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={12} className="border-b border-blue-200 p-0">
                    <ProductDetailPanel
                      row={row}
                      onEdit={(r, tab) => onEdit?.(r, tab)}
                      onDelete={onDelete}
                      onToggleStatus={onToggleStatus}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

/* ==================== FILTER SIDEBAR ==================== */
const ProductFilterSidebar = ({ isCollapsed, onToggleCollapse, filters }) => {
  const {
    groupKeyword,
    setGroupKeyword,
    brandKeyword,
    setBrandKeyword,
    estimatedStockOutFilter,
    estimatedSelectedLabel,
    estimatedQuickOpen,
    estimatedCustomOpen,
    estimatedRef,
    setEstimatedStockOutFilter,
    setEstimatedRange,
    setEstimatedCustomOpen,
    setEstimatedQuickOpen,
    createdTimeFilter,
    createdSelectedLabel,
    createdQuickOpen,
    createdCustomOpen,
    createdRef,
    setCreatedTimeFilter,
    setCreatedRange,
    setCreatedCustomOpen,
    setCreatedQuickOpen,
    supplierKeyword,
    setSupplierKeyword,
    productStatusFilter,
    setProductStatusFilter,
    handleEstimatedPreset,
    handleCreatedPreset,
    setEstimatedSelectedLabel,
    setCreatedSelectedLabel,
  } = filters;

  return (
    <>
      <button
        type="button"
        className={`fixed left-[260px] top-[148px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all duration-300 hover:scale-110 ${isCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => onToggleCollapse(false)}
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>
      <aside
        className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'}`}
      >
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Bộ lọc</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              setGroupKeyword('');
              setBrandKeyword?.('');
              setEstimatedStockOutFilter('allTime');
              setEstimatedSelectedLabel('Toàn thời gian');
              setCreatedTimeFilter('allTime');
              setCreatedSelectedLabel('Toàn thời gian');
              setSupplierKeyword('');
              setProductStatusFilter('active');
            }}
          >
            <Icon name="cached" size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Trạng thái hàng hóa
          </p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={productStatusFilter}
            onChange={(e) => setProductStatusFilter(e.target.value)}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhóm hàng</p>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            placeholder="Lọc theo danh mục..."
            value={groupKeyword}
            onChange={(e) => setGroupKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Thương hiệu</p>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            placeholder="Lọc theo thương hiệu..."
            value={brandKeyword || ''}
            onChange={(e) => setBrandKeyword?.(e.target.value)}
          />
        </div>

        <div className="relative space-y-2" ref={estimatedRef}>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Dự kiến hết hàng
          </p>
          {[
            {
              val: 'allTime',
              label: estimatedSelectedLabel,
              onChange: () => {
                setEstimatedStockOutFilter('allTime');
                setEstimatedRange(null);
                setEstimatedCustomOpen(false);
                setEstimatedQuickOpen((p) => !p);
              },
            },
            {
              val: 'custom',
              label: 'Tùy chỉnh',
              onChange: () => {
                setEstimatedStockOutFilter('custom');
                setEstimatedQuickOpen(false);
                setEstimatedCustomOpen((p) => !p);
              },
            },
          ].map((opt) => (
            <label
              key={opt.val}
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${estimatedStockOutFilter === opt.val ? 'border border-blue-900' : 'border border-slate-200'}`}
            >
              <input
                type="radio"
                name="estimatedStockOut"
                checked={estimatedStockOutFilter === opt.val}
                onChange={opt.onChange}
                className="h-4 w-4 text-blue-900 focus:ring-blue-900"
              />
              <span className="flex w-full items-center justify-between text-sm text-slate-600">
                {opt.label}
                <Icon
                  name={opt.val === 'custom' ? 'calendar_today' : 'chevron_right'}
                  className="text-sm text-slate-400"
                />
              </span>
            </label>
          ))}
          {estimatedQuickOpen && (
            <QuickRangePopover
              ranges={estimatedQuickRanges}
              onSelect={handleEstimatedPreset}
              onReset={() => {
                setEstimatedSelectedLabel('Toàn thời gian');
                setEstimatedRange(null);
                setEstimatedStockOutFilter('allTime');
                setEstimatedQuickOpen(false);
              }}
            />
          )}
          {estimatedCustomOpen && (
            <DatePickerPopup
              onCancel={() => setEstimatedCustomOpen(false)}
              onApply={() => {
                setEstimatedSelectedLabel('01/05/2026 - 31/05/2026');
                setEstimatedStockOutFilter('custom');
                setEstimatedCustomOpen(false);
              }}
            />
          )}
        </div>

        <div className="relative space-y-2" ref={createdRef}>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Thời gian tạo</p>
          {[
            {
              val: 'allTime',
              label: createdSelectedLabel,
              onChange: () => {
                setCreatedTimeFilter('allTime');
                setCreatedRange(null);
                setCreatedCustomOpen(false);
                setCreatedQuickOpen((p) => !p);
              },
            },
            {
              val: 'custom',
              label: createdSelectedLabel === 'Toàn thời gian' ? 'Tùy chỉnh' : createdSelectedLabel,
              onChange: () => {
                setCreatedTimeFilter('custom');
                setCreatedQuickOpen(false);
                setCreatedCustomOpen((p) => !p);
              },
            },
          ].map((opt) => (
            <label
              key={opt.val}
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 ${createdTimeFilter === opt.val ? 'border border-blue-900' : 'border border-slate-200'}`}
            >
              <input
                type="radio"
                name="createdTime"
                checked={createdTimeFilter === opt.val}
                onChange={opt.onChange}
                className="h-4 w-4 text-blue-900 focus:ring-blue-900"
              />
              <span className="flex w-full items-center justify-between text-sm text-slate-600">
                {opt.label}
                <Icon
                  name={opt.val === 'custom' ? 'calendar_today' : 'chevron_right'}
                  className="text-sm text-slate-400"
                />
              </span>
            </label>
          ))}
          {createdQuickOpen && (
            <QuickRangePopover
              ranges={createdQuickRanges}
              onSelect={handleCreatedPreset}
              onReset={() => {
                setCreatedSelectedLabel('Toàn thời gian');
                setCreatedRange(null);
                setCreatedTimeFilter('allTime');
                setCreatedQuickOpen(false);
              }}
            />
          )}
          {createdCustomOpen && (
            <DatePickerPopup
              onCancel={() => setCreatedCustomOpen(false)}
              onApply={() => {
                setCreatedSelectedLabel('01/05/2026 - 31/05/2026');
                setCreatedTimeFilter('custom');
                setCreatedCustomOpen(false);
              }}
            />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Nhà cung cấp ID
          </p>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            placeholder="Lọc theo Guid nhà cung cấp..."
            value={supplierKeyword}
            onChange={(e) => setSupplierKeyword(e.target.value)}
          />
        </div>
      </aside>
    </>
  );
};

/* ==================== EDIT PRODUCT MODAL - CONTENT ==================== */
const EditProductModalContent = ({ onClose, product, onSave, title, productList, initialTab }) => {
  const f = useEditProductForm({ product, onSave, onClose, productList, initialTab });
  return (
    <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white font-sans shadow-2xl sm:mx-6">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-6">
        <h1 className="text-[20px] font-bold leading-tight text-on-surface">
          {title || (product ? 'Sửa hàng hóa' : 'Thêm hàng hóa')}
        </h1>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <Icon name="close" className="text-slate-500" />
        </button>
      </header>
      <div className="flex h-12 border-b border-gray-200">
        {['info', 'description'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => f.setActiveTab(tab)}
            className={`flex h-12 items-center px-4 text-sm tracking-wider ${f.activeTab === tab ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
          >
            {tab === 'info' ? 'Thông tin' : 'Mô tả'}
          </button>
        ))}
      </div>
      <form onSubmit={f.handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <main className="custom-scroll flex-1 space-y-6 overflow-y-auto px-8 py-6 sm:px-6 sm:py-5">
          {f.activeTab === 'info' ? (
            <div>
              <section className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">
                        Mã hàng (Duy nhất)
                      </label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0 disabled:bg-gray-100"
                        type="text"
                        disabled={!!product}
                        value={f.form.productCode || f.form.id || ''}
                        onChange={(e) => f.handleChange('productCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Mã vạch</label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                        placeholder="Nhập mã vạch"
                        type="text"
                        value={f.form.barcode || ''}
                        onChange={(e) => f.handleChange('barcode', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <label className="text-label-md text-on-surface-variant">Tên hàng (*)</label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-semibold focus:ring-0"
                      type="text"
                      required
                      value={f.form.name || ''}
                      onChange={(e) => f.handleChange('name', e.target.value)}
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <AutocompleteInput
                      label="Nhóm hàng / Danh mục"
                      value={f.form.group}
                      onChange={(val) => f.handleChange('group', val)}
                      options={f.groups}
                      placeholder="Chọn từ gợi ý hoặc gõ tên mới..."
                    />
                    <AutocompleteInput
                      label="Thương hiệu"
                      value={f.form.brand}
                      onChange={(val) => f.handleChange('brand', val)}
                      options={f.brands}
                      placeholder="Chọn từ gợi ý hoặc gõ tên mới..."
                    />
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-3">
                  <ImageUploader
                    images={f.images}
                    maxImages={f.MAX_IMAGES}
                    fileInputRef={f.fileInputRef}
                    onOpenFilePicker={f.handleOpenFilePicker}
                    onUpload={f.handleUpload}
                    onPinImage={f.handlePinImage}
                    onRemoveImage={f.handleRemoveImage}
                    onAddImageUrl={f.handleAddImageUrl}
                    productName={f.form.name}
                  />
                </div>
              </section>
              <Section
                title="Tồn kho ban đầu"
                subtitle="Thiết lập số lượng tồn thực tế ban đầu."
                defaultOpen
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">
                      Tồn thực tế ban đầu
                    </label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right font-semibold focus:ring-0"
                      type="number"
                      min="0"
                      value={f.form.stock !== '' ? f.form.stock : '0'}
                      onChange={(e) => f.handleChange('stock', e.target.value)}
                    />
                  </div>
                </div>
              </Section>
              <Section title="Giá vốn, giá bán" defaultOpen>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ['Giá vốn (*)', 'costPrice'],
                    ['Giá bán (*)', 'salePrice'],
                  ].map(([label, field]) => (
                    <div key={field} className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">{label}</label>
                      <div className="relative">
                        <input
                          className="text-body-lg w-full border-b-2 border-l-0 border-r-0 border-t-0 border-outline-variant bg-transparent py-2 pr-8 text-right font-bold leading-[1.2] text-primary focus:border-primary"
                          type="text"
                          inputMode="numeric"
                          value={
                            f.form[field] != null && f.form[field] !== ''
                              ? fmtMoney(f.form[field])
                              : ''
                          }
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, '');
                            f.handleChange(field, raw);
                          }}
                        />
                        <span className="text-label-md absolute bottom-2 right-0 font-normal leading-[1.1] text-on-surface-variant">
                          đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Vị trí, trọng lượng, kích thước" defaultOpen>
                <div className="mb-5 grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-label-md text-on-surface-variant">Vị trí Kệ/Tủ</label>
                      <button
                        type="button"
                        onClick={() => {
                          f.setNewLocationName('');
                          f.setCreateLocationModalOpen(true);
                        }}
                        className="text-label-sm font-semibold text-primary hover:underline"
                      >
                        Tạo mới
                      </button>
                    </div>
                    <select
                      className="text-body-md w-full appearance-none rounded-[8px] border border-outline-variant bg-surface-container-lowest px-3 py-2.5 pr-9 focus:ring-0"
                      value={f.form.shelfLocation || ''}
                      onChange={(e) => f.handleChange('shelfLocation', e.target.value)}
                    >
                      <option value="">Chọn vị trí...</option>
                      {(Array.isArray(f.locations) ? f.locations : []).map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">Trọng lượng</label>
                    <div className="flex items-center overflow-hidden rounded-[8px] border border-outline-variant bg-surface-container-lowest">
                      <input
                        className="flex-1 border-none bg-transparent px-3 py-2 text-right text-[15px] font-semibold leading-[1.35] focus:ring-0"
                        type="number"
                        min="0"
                        step="any"
                        value={f.form.weight ?? ''}
                        onChange={(e) => f.handleChange('weight', e.target.value)}
                      />
                      <select
                        className="text-label-sm cursor-pointer border-l border-outline-variant bg-surface-container-low px-2 py-2 font-bold leading-[1.15] text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={['g', 'kg'].includes(f.form.weightUnit) ? f.form.weightUnit : 'g'}
                        onChange={(e) => f.handleChange('weightUnit', e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Section>
              <Section title="Quản lý theo đơn vị tính và thuộc tính" defaultOpen>
                <UnitManagement f={f} />
                <div className="border-t border-gray-200 pt-6">
                  <AttributeEditor f={f} />
                </div>
              </Section>
            </div>
          ) : (
            <div>
              <div className="overflow-hidden rounded-md border border-[#dcdfe6] bg-white">
                <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-[#f5f6f7] px-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Mô tả kỹ thuật (Specification)
                  </span>
                </div>
                <textarea
                  className="min-h-[160px] w-full resize-none bg-white p-4 text-[15px] leading-[1.4] outline-none"
                  placeholder="Nhập mô tả sản phẩm / thông số kỹ thuật"
                  value={f?.form?.specification ?? f?.form?.description ?? ''}
                  onChange={(e) => f?.handleChange?.('specification', e.target.value)}
                />
              </div>
            </div>
          )}
        </main>
        <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <input
              checked={f.form.productStatus !== 'inactive'}
              type="checkbox"
              id="footer-status-active"
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              onChange={(e) =>
                f.handleChange('productStatus', e.target.checked ? 'active' : 'inactive')
              }
            />
            <label
              className="flex cursor-pointer items-center text-sm font-semibold text-gray-700"
              htmlFor="footer-status-active"
            >
              Đang hoạt động (Active)
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700"
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              className="h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              Lưu dữ liệu
            </button>
          </div>
        </footer>
      </form>
      <CreateLocationModal
        open={f.createLocationModalOpen}
        newLocationName={f.newLocationName}
        setNewLocationName={f.setNewLocationName}
        onClose={() => f.setCreateLocationModalOpen(false)}
        onSave={() => {
          f.saveNewLocation(f.newLocationName);
          f.setCreateLocationModalOpen(false);
          f.setNewLocationName('');
        }}
      />
      <CreateAttributeModal
        open={f.createAttrModalOpen}
        newAttrName={f.newAttrName}
        setNewAttrName={f.setNewAttrName}
        onClose={() => {
          f.setCreateAttrModalOpen(false);
          f.setEditingAttrId(null);
        }}
        onSave={() => {
          const name = (f.newAttrName || '').trim();
          if (name) {
            f.addAvailableAttribute(name);
            if (f.editingAttrId) f.updateAttr(f.editingAttrId, 'name', name);
          }
          f.setCreateAttrModalOpen(false);
          f.setEditingAttrId(null);
        }}
      />
      <EditAttributeModal
        open={f.editAttrModalOpen}
        editAttrValue={f.editAttrValue}
        setEditAttrValue={f.setEditAttrValue}
        onClose={() => {
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
        onSave={() => {
          const oldName = f.availableAttributes[f.editAttrIndex];
          const next = (f.availableAttributes || []).map((v, i) =>
            i === f.editAttrIndex ? f.editAttrValue || v : v
          );
          f.persistAvailableAttributes(next);
          f.setForm((c) => ({
            ...c,
            attributes: (c.attributes || []).map((a) =>
              a.name === oldName ? { ...a, name: f.editAttrValue || oldName } : a
            ),
          }));
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
        onDelete={() => {
          const oldName = f.availableAttributes[f.editAttrIndex];
          f.persistAvailableAttributes(
            (f.availableAttributes || []).filter((_, i) => i !== f.editAttrIndex)
          );
          f.setForm((c) => ({
            ...c,
            attributes: (c.attributes || []).map((a) =>
              a.name === oldName ? { ...a, name: '' } : a
            ),
          }));
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
      />
      <AddConversionUnitModal
        open={f.addConversionUnitModal}
        newConversionUnit={f.newConversionUnit}
        setNewConversionUnit={f.setNewConversionUnit}
        form={f.form}
        formatMoney={fmtMoney}
        onClose={() => f.setAddConversionUnitModal(false)}
        onSave={f.addConversionUnitHandler}
      />
    </div>
  );
};

/* ==================== EDIT PRODUCT MODAL - WRAPPER ==================== */
const EditProductModal = (props) => {
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(!!props.product);
  useEffect(() => {
    if (props.open && props.product) {
      setLoading(true);
      getProduct(props.product.id || props.product.productId)
        .then((res) => {
          setFullProduct(
            res?.success && res?.data ? { ...props.product, ...res.data } : props.product
          );
        })
        .catch(() => setFullProduct(props.product))
        .finally(() => setLoading(false));
    } else {
      setFullProduct(null);
      setLoading(false);
    }
  }, [props.open, props.product]);
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      {loading ? (
        <div className="flex h-32 w-64 items-center justify-center rounded-xl bg-white shadow-xl">
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Icon name="sync" className="animate-spin text-3xl" />
            <span className="text-sm font-bold text-slate-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : (
        <EditProductModalContent {...props} product={fullProduct} />
      )}
    </div>
  );
};

/* ==================== MAIN PAGE ==================== */
export const ProductManagement = () => {
  const [expandedId, setExpandedId] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [initialEditTab, setInitialEditTab] = useState('info');
  const [selectedIds, setSelectedIds] = useState([]);
  const filters = useProductFilters();

  const activeQueryParams = filters.queryParams;

  const {
    products,
    paginationMeta,
    apiStatus,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleStatus,
    handleBulkToggleStatus,
    refetch,
  } = useProductList(activeQueryParams);

  const {
    estimatedRef,
    setEstimatedQuickOpen,
    setEstimatedCustomOpen,
    createdRef,
    setCreatedQuickOpen,
    setCreatedCustomOpen,
  } = filters;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (estimatedRef?.current && !estimatedRef.current.contains(e.target)) {
        setEstimatedQuickOpen?.(false);
        setEstimatedCustomOpen?.(false);
      }
      if (createdRef?.current && !createdRef.current.contains(e.target)) {
        setCreatedQuickOpen?.(false);
        setCreatedCustomOpen?.(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [
    estimatedRef,
    setEstimatedQuickOpen,
    setEstimatedCustomOpen,
    createdRef,
    setCreatedQuickOpen,
    setCreatedCustomOpen,
  ]);

  const { currentPage, setCurrentPage, pageSize } = filters;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalCount = paginationMeta?.totalCount || 0;
  const startRowNum = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRowNum = Math.min(currentPage * pageSize, totalCount);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage, setCurrentPage]);

  const handleSave = (updated) => {
    handleSaveProduct(updated, productToEdit, () => {
      filters.setCurrentPage(1);
      setEditModalOpen(false);
      setProductToEdit(null);
      refetch();
    });
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [products]);

  const handleSelectRow = (id, isChecked) => {
    if (isChecked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleSelectAll = (isChecked, currentRows) => {
    if (isChecked) setSelectedIds(currentRows.map((row) => row.id || row.productId));
    else setSelectedIds([]);
  };

  return (
    <div className="mt-2 w-full space-y-4 text-slate-800">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hàng hóa</h1>
        <p className="mt-1 text-gray-600">Quản lý kho hàng hóa</p>
      </div>

      <div className="flex w-full">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${apiStatus.isMock ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
        >
          {apiStatus.loading
            ? 'Đang tải danh sách hàng hóa...'
            : apiStatus.isMock
              ? '⚠ Đang hiển thị dữ liệu mẫu cục bộ (Chưa kết nối API Server)'
              : '✔ Đã đồng bộ dữ liệu từ API Server'}
        </div>
      </div>

      <div className="relative flex w-full min-w-0 items-start gap-6 pb-6 pt-2">
        <ProductFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filters}
        />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Icon name="check_circle" size={20} /> Đã chọn {selectedIds.length} hàng hóa
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  onClick={async () => {
                    if (window.confirm(`Mở bán ${selectedIds.length} sản phẩm?`)) {
                      const ok = await handleBulkToggleStatus(selectedIds, true);
                      if (ok) setSelectedIds([]);
                    }
                  }}
                >
                  <Icon name="play_circle" size={18} /> Mở bán
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                  onClick={async () => {
                    if (window.confirm(`Ngừng bán ${selectedIds.length} sản phẩm?`)) {
                      const ok = await handleBulkToggleStatus(selectedIds, false);
                      if (ok) setSelectedIds([]);
                    }
                  }}
                >
                  <Icon name="block" size={18} /> Ngừng bán
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-1 gap-3">
              <div className="flex min-w-[240px] max-w-sm flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1">
                <Icon name="search" className="mr-2 text-slate-400" />
                <input
                  className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
                  placeholder="Tìm theo mã, tên hàng, mã vạch..."
                  value={filters.search}
                  onChange={(e) => {
                    filters.setSearch(e.target.value);
                    filters.setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setCategoryModalOpen(true)}
              >
                <Icon name="ListFilter" className="text-sm text-slate-500" /> Quản lý Nhóm & Thương
                hiệu
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-black"
                onClick={() => {
                  setProductToEdit(null);
                  setEditModalOpen(true);
                }}
              >
                <Icon name="add" className="text-sm" /> Thêm mới
              </button>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <ProductTable
                rows={products}
                sortConfig={filters.sortConfig}
                getSortIcon={filters.getSortIcon}
                onToggleSort={filters.toggleSort}
                onToggleStatus={handleToggleStatus}
                expandedId={expandedId}
                onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? '' : id))}
                onEdit={(row, tab) => {
                  setProductToEdit(row);
                  setInitialEditTab(tab || 'info');
                  setEditModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
              />
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={filters.pageSize}
                    onChange={(e) => filters.handlePageSizeChange(Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>{`${startRowNum} - ${endRowNum} trong tổng số ${totalCount} hàng hóa`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={filters.currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {filters.currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={filters.currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditProductModal
          key={productToEdit?.id || productToEdit?.productId || 'new'}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setProductToEdit(null);
          }}
          product={productToEdit}
          onSave={handleSave}
          productList={products}
          initialTab={initialEditTab}
          title={productToEdit ? 'Sửa hàng hóa' : 'Thêm hàng hóa'}
        />
      )}

      <CategoryBrandManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default ProductManagement;
