/**
 * TRANG HÀNG HÓA - Consolidated
 * Gộp từ: ProductTable, ProductFilterSidebar, FilterPopovers, ProductDetailPanel,
 * ProductInfoTab, ProductDescriptionTab, EditProductModal, EditProductModals,
 * Section, ImageUploader, AttributeEditor, UnitManagement
 */
import { useState, useEffect, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { useProductFilters } from '../hooks/useProductFilters';
import { getProduct } from '../services/productService';
import { useProductList } from '../hooks/useProductList';
import { useEditProductForm } from '../hooks/useEditProductForm';
import {
  estimatedQuickRanges,
  createdQuickRanges,
  statusOptions,
  formatMoney,
} from '../utils/productUtils';

/* ==================== UTILITY ==================== */
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
        Từ ngày: <span className="font-semibold text-slate-800">17/05/2026</span> - Đến ngày:{' '}
        <span className="font-semibold text-slate-800">17/05/2026</span>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {[0, 1].map((side) => (
          <div key={side}>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <Icon name="chevron_left" className="text-[16px]" />
              </button>
              <p className="text-lg text-slate-700">Tháng 5 2026</p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-1 text-slate-500"
              >
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center text-sm text-slate-400">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={`${side}-${d}`}>{d}</span>
              ))}
              {(side === 0
                ? [27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                : [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7]
              ).map((day) => (
                <span
                  key={`${side}-${day}`}
                  className={
                    side === 0
                      ? day < 4
                        ? 'text-slate-300'
                        : 'text-slate-700'
                      : day < 8
                        ? 'text-slate-700'
                        : 'text-slate-400'
                  }
                >
                  {day}
                </span>
              ))}
              <span className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-blue-600 font-bold text-white">
                17
              </span>
            </div>
          </div>
        ))}
      </div>
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
        <div key={col.title}>
          <p className="mb-2 text-sm font-bold text-slate-800">{col.title}</p>
          <div className="flex flex-col gap-2">
            {col.options.map((opt) => (
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

const ImageUploader = ({
  images,
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
              key={img.id}
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
                {f.availableAttributes.map((item, aidx) => (
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
              price: Number(e.target.value.replaceAll(',', '')) || 0,
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
              <span className="text-[14px] font-medium text-gray-700">{unit.convertValue}</span>
              <span className="text-[14px] font-semibold text-gray-700">{unit.convertFrom}</span>
            </div>
            <div className="min-w-[20px] flex-1" />
            <div className="min-w-[100px] text-right">
              <span className="text-[14px] text-gray-600">
                {(() => {
                  const base = Number(f.form.baseUnit?.price) || 0;
                  const unitsByName = (f.form.conversionUnits || []).reduce((acc, u) => {
                    acc[u.name] = u;
                    return acc;
                  }, {});
                  const computeMultiplierForUnit = (uName, visited = new Set()) => {
                    if (!uName || visited.has(uName)) return null;
                    if (uName === f.form.baseUnit?.name) return 1;
                    const uu = unitsByName[uName];
                    if (!uu) return null;
                    visited.add(uName);
                    if (uu.convertFrom === f.form.baseUnit?.name) return uu.convertValue;
                    const pm = computeMultiplierForUnit(uu.convertFrom, visited);
                    return pm == null ? null : uu.convertValue * pm;
                  };
                  const mult = computeMultiplierForUnit(unit.name);
                  const price = mult && base ? base * mult : unit.calculatedPrice || 0;
                  return price ? fmtMoney(price) : '-';
                })()}
              </span>
            </div>
            <div className="flex flex-none items-center space-x-2">
              <input
                type="checkbox"
                checked={unit.directSale || false}
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
const ModalWrapper = ({ children, onClose }) => (
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

const CreateGroupModal = ({
  open,
  groups,
  newGroupName,
  setNewGroupName,
  newGroupParent,
  setNewGroupParent,
  onClose,
  onSave,
}) => {
  if (!open) return null;
  const handleKey = (e) => {
    if (e.key === 'Enter' && (newGroupName || '').trim()) {
      e.preventDefault();
      onSave?.();
    }
  };
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo nhóm hàng</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="mb-2 block text-sm text-gray-700">
            Tên nhóm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={handleKey}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-700">Nhóm cha</label>
          <select
            value={newGroupParent}
            onChange={(e) => setNewGroupParent(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Chọn nhóm hàng</option>
            {(Array.isArray(groups) ? groups : []).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} />
    </ModalWrapper>
  );
};

const CreateBrandModal = ({ open, newBrandName, setNewBrandName, onClose, onSave }) => {
  if (!open) return null;
  const handleKey = (e) => {
    if (e.key === 'Enter' && (newBrandName || '').trim()) {
      e.preventDefault();
      onSave?.();
    }
  };
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo thương hiệu</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">
          Tên thương hiệu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          onKeyDown={handleKey}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} />
    </ModalWrapper>
  );
};

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
  const base = Number(form.baseUnit?.price) || 0;
  const cv = Number(newConversionUnit.convertValue) || 0;
  const from = newConversionUnit.convertFrom;
  const unitsByName = (form.conversionUnits || []).reduce((acc, u) => {
    acc[u.name] = u;
    return acc;
  }, {});
  const computeMultiplierPreview = (fromName, visited = new Set()) => {
    if (!fromName || visited.has(fromName)) return null;
    if (!form.baseUnit?.name || fromName === form.baseUnit.name) return 1;
    const u = unitsByName[fromName];
    if (!u) return null;
    visited.add(fromName);
    if (u.convertFrom === form.baseUnit.name) return u.convertValue;
    const pm = computeMultiplierPreview(u.convertFrom, visited);
    return pm == null ? null : u.convertValue * pm;
  };
  const previewMultiplier = from
    ? from === form.baseUnit?.name
      ? cv
      : (() => {
          const pm = computeMultiplierPreview(from);
          return pm == null ? null : cv * pm;
        })()
    : null;
  const previewPrice = previewMultiplier && base ? base * previewMultiplier : 0;
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
            value={newConversionUnit.name}
            onChange={(e) => setNewConversionUnit({ ...newConversionUnit, name: e.target.value })}
            placeholder="Ví dụ: lốc, thùng"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm font-medium text-blue-900">Công thức quy đổi:</div>
          <div className="mt-2 text-base">
            <span className="font-semibold">1 {newConversionUnit.name || '[tên đơn vị]'}</span>
            <span className="mx-2">=</span>
            <span className="font-semibold">{newConversionUnit.convertValue || '?'}</span>
            <span className="ml-2">{newConversionUnit.convertFrom || '[đơn vị gốc]'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-700">Giá trị quy đổi</label>
            <input
              type="number"
              value={newConversionUnit.convertValue}
              onChange={(e) =>
                setNewConversionUnit({ ...newConversionUnit, convertValue: e.target.value })
              }
              placeholder="Ví dụ: 4, 20"
              min="1"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-700">Đơn vị quy đổi từ</label>
            <select
              value={newConversionUnit.convertFrom}
              onChange={(e) =>
                setNewConversionUnit({ ...newConversionUnit, convertFrom: e.target.value })
              }
              className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Chọn đơn vị</option>
              {form.baseUnit?.name && (
                <option value={form.baseUnit.name}>{form.baseUnit.name}</option>
              )}
              {(form.conversionUnits || []).map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-700">Giá bán (tự tính)</label>
          <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-right text-sm text-gray-700">
            {previewPrice ? fm(previewPrice) : '-'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="direct-sell-conv"
            checked={newConversionUnit.directSale}
            onChange={(e) =>
              setNewConversionUnit({ ...newConversionUnit, directSale: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-[#1E6BB8]"
          />
          <label htmlFor="direct-sell-conv" className="text-sm text-gray-700">
            Cho phép bán đơn vị này
          </label>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Thêm" />
    </ModalWrapper>
  );
};

/* ==================== PRODUCT DETAIL PANEL ==================== */
const SummaryBar = ({ row }) => {
  const items = [
    { label: 'Mã SP', value: row.productCode || row.id },
    { label: 'Tên SP', value: row.name || row.productName },
    { label: 'Giá bán', value: `${fmtMoney(row.salePrice)} đ` },
    { label: 'Giá vốn', value: `${fmtMoney(row.costPrice)} đ` },
    { label: 'Tồn kho', value: row.actualStock ?? row.stock },
    { label: 'Trạng thái', value: row.isActive ? 'Đang bán' : 'Ngừng bán' },
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
            alt={row.name}
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
          ['Mã vạch', row.barcode],
          ['Tồn thực tế', row.actualStock ?? row.stock],
          ['Tồn khả dụng', row.availableStock ?? row.stock],
          ['Giá vốn', `${fmtMoney(row.costPrice)} đ`],
          ['Giá bán', `${fmtMoney(row.salePrice)} đ`],
          ['Thương hiệu', row.brandName || row.brand || 'Chưa có'],
          ['Vị trí', row.shelfLocation || row.location || 'Chưa có'],
          ['Trọng lượng', row.weight ? `${row.weight} ${row.weightUnit}` : 'Chưa có'],
          ['Kích thước', row.specificationDetail || 'Chưa có'],
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
            onDelete?.(row.productId || row.id);
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
                {row.isActive !== false ? 'Ngừng kinh doanh' : 'Mở bán lại'}
              </button>
            </div>
          )}
        </div>
      </div>
      <StatusToggleModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        isActive={row.isActive}
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
  useEffect(() => {
    setFullData((prev) => ({
      ...prev,
      ...row,
      productName: row.name || prev.productName,
      productCode: row.productCode || row.id || prev.productCode,
      actualStock: row.stock ?? prev.actualStock,
      availableStock: row.availableStock ?? row.stock ?? prev.availableStock,
      isActive: row.isActive !== undefined ? row.isActive : prev.isActive,
      salePrice: row.salePrice ?? prev.salePrice,
      costPrice: row.costPrice ?? prev.costPrice,
    }));
    const fetchDetail = async () => {
      const currentId = row?.productId || row?.id;
      if (!currentId) return;
      if (!fullData?.productName) setLoading(true);
      try {
        const res = await getProduct(currentId);
        if (res?.success && res?.data) setFullData((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error('Lỗi tải chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);
  useEffect(() => {
    setFullData((prev) => ({ ...prev, ...row }));
  }, [row]);
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
    ['Mã hàng', 'id', 'w-[140px]'],
    ['Tên hàng', 'name', 'w-[240px]'],
    ['Đơn vị', 'unit', 'w-[90px]'],
    ['Thương hiệu', 'brand', 'w-[130px]'],
    ['Giá bán', 'salePrice', 'w-[110px]'],
    ['Giá vốn', 'costPrice', 'w-[110px]'],
    ['Tồn kho', 'stock', 'w-[110px]'],
    ['Vị trí kho', 'location', 'w-[110px]'],
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
          const isExpanded = expandedId === row.id;
          const currentId = row.productId || row.id;
          const isSelected = selectedIds.includes(currentId);
          return (
            <Fragment key={row.id}>
              <tr
                className={`group cursor-pointer transition-colors hover:bg-blue-50 ${isExpanded || isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => onToggleExpand?.(row.id)}
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
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.name}
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
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-700">{row.name}</td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.unit || '---'}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-600">
                  {row.brand || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                  {fmtMoney(row.salePrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                  {fmtMoney(row.costPrice)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                  {row.stock}
                </td>
                <td className="truncate whitespace-nowrap px-4 py-3 text-slate-500">
                  {row.location || '---'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={
                        row.isActive === true ||
                        row.productStatus === 'active' ||
                        row.status === 'active'
                      }
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleStatus?.(row.id || row.productId, row.isActive);
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
  const triToggle = (val, set) => (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
      {['all', 'yes', 'no'].map((v) => (
        <button
          key={v}
          type="button"
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${val === v ? 'bg-blue-600 font-bold text-white' : 'text-slate-600'}`}
          onClick={() => set(v)}
        >
          {v === 'all' ? 'Tất cả' : v === 'yes' ? 'Có' : 'Không'}
        </button>
      ))}
    </div>
  );
  const {
    groupKeyword,
    setGroupKeyword,
    stockFilter,
    setStockFilter,
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
    locationKeyword,
    setLocationKeyword,
    itemTypeKeyword,
    setItemTypeKeyword,
    directSaleFilter,
    setDirectSaleFilter,
    salesChannelFilter,
    setSalesChannelFilter,
    productStatusFilter,
    setProductStatusFilter,
    statusDropdownOpen,
    setStatusDropdownOpen,
    statusDropdownRef,
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
              setStockFilter('all');
              setEstimatedStockOutFilter('allTime');
              setEstimatedSelectedLabel('Toàn thời gian');
              setCreatedTimeFilter('allTime');
              setCreatedSelectedLabel('Toàn thời gian');
              setSupplierKeyword('');
              setLocationKeyword('');
              setItemTypeKeyword('');
              setDirectSaleFilter('all');
              setSalesChannelFilter('all');
              setProductStatusFilter('active');
            }}
          >
            <Icon name="cached" size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setProductStatusFilter('draft')}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
        >
          <Icon name="description" size={16} /> Bản nháp
        </button>
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhóm hàng</h3>
          <button
            type="button"
            onClick={() => alert('Tính năng đang phát triển')}
            className="text-xs font-bold text-blue-900 hover:underline"
          >
            Tạo mới
          </button>
        </div>
        <input
          className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Chọn nhóm hàng"
          value={groupKeyword}
          onChange={(e) => setGroupKeyword(e.target.value)}
        />
        <div className="mb-6 mt-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Tồn kho</p>
          <select
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="inStock">Còn hàng</option>
            <option value="outStock">Hết hàng</option>
          </select>
        </div>
        <div className="relative mb-6 space-y-2" ref={estimatedRef}>
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
                setEstimatedSelectedLabel('17/05/2026 - 17/05/2026');
                setEstimatedStockOutFilter('custom');
                setEstimatedCustomOpen(false);
              }}
            />
          )}
        </div>
        <div className="relative mb-6 space-y-2" ref={createdRef}>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
              Thời gian tạo
            </p>
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
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
              label:
                createdSelectedLabel === 'Toàn thời gian'
                  ? '17/05/2026 - 17/05/2026'
                  : createdSelectedLabel,
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
                setCreatedSelectedLabel('17/05/2026 - 17/05/2026');
                setCreatedTimeFilter('custom');
                setCreatedCustomOpen(false);
              }}
            />
          )}
        </div>
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Nhà cung cấp</p>
          <select
            className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            value={supplierKeyword}
            onChange={(e) => setSupplierKeyword(e.target.value)}
          >
            <option value="">Tất cả nhà cung cấp</option>
          </select>
        </div>
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Vị trí</p>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
            placeholder="Chọn vị trí"
            value={locationKeyword}
            onChange={(e) => setLocationKeyword(e.target.value)}
          />
        </div>
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Loại hàng</p>
          <input
            className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm"
            placeholder="Chọn loại hàng"
            value={itemTypeKeyword}
            onChange={(e) => setItemTypeKeyword(e.target.value)}
          />
        </div>
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">Bán trực tiếp</p>
          {triToggle(directSaleFilter, setDirectSaleFilter)}
        </div>
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Liên kết kênh bán
          </p>
          {triToggle(salesChannelFilter, setSalesChannelFilter)}
        </div>
        <div className="relative space-y-2" ref={statusDropdownRef}>
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700">
            Trạng thái hàng hóa
          </p>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-800"
            onClick={() => setStatusDropdownOpen((p) => !p)}
          >
            <span>{statusOptions.find((o) => o.value === productStatusFilter)?.label}</span>
            <Icon
              name={statusDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              className="text-[18px]"
            />
          </button>
          {statusDropdownOpen && (
            <div className="absolute left-0 right-0 top-[58px] z-30 rounded-lg border border-slate-200 bg-white py-2 shadow-2xl">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                  onClick={() => {
                    setProductStatusFilter(opt.value);
                    setStatusDropdownOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {productStatusFilter === opt.value && (
                    <Icon name="check" className="text-[18px] text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
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
                      <label className="text-label-md text-on-surface-variant">Mã hàng</label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                        type="text"
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
                    <label className="text-label-md text-on-surface-variant">Tên hàng</label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-semibold focus:ring-0"
                      type="text"
                      value={f.form.name || ''}
                      onChange={(e) => f.handleChange('name', e.target.value)}
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md text-on-surface-variant">
                          Nhóm hàng / Danh mục
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            f.setNewGroupName('');
                            f.setNewGroupParent('');
                            f.setCreateGroupModalOpen(true);
                          }}
                          className="text-label-sm font-semibold text-primary hover:underline"
                        >
                          Tạo mới
                        </button>
                      </div>
                      <select
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                        value={f.form.group || ''}
                        onChange={(e) => f.handleChange('group', e.target.value)}
                      >
                        <option value="">Chọn danh mục</option>
                        {(Array.isArray(f.groups) ? f.groups : []).map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md text-on-surface-variant">Thương hiệu</label>
                        <button
                          type="button"
                          onClick={() => {
                            f.setNewBrandName('');
                            f.setCreateBrandModalOpen(true);
                          }}
                          className="text-label-sm font-semibold text-primary hover:underline"
                        >
                          Tạo mới
                        </button>
                      </div>
                      <select
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                        value={f.form.brand || ''}
                        onChange={(e) => f.handleChange('brand', e.target.value)}
                      >
                        <option value="">Chọn thương hiệu</option>
                        {(Array.isArray(f.brands) ? f.brands : []).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
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
              <Section title="Tồn kho" subtitle="Quản lý số lượng tồn kho và định mức." defaultOpen>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">
                      Tồn kho hiện tại
                    </label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right font-semibold focus:ring-0"
                      type="number"
                      min="0"
                      value={f.form.stock !== '' ? f.form.stock : '0'}
                      onChange={(e) => f.handleChange('stock', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">
                      Định mức tồn thấp nhất
                    </label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
                      type="number"
                      min="0"
                      value={f.form.minimumStock !== '' ? f.form.minimumStock : '0'}
                      onChange={(e) => f.handleChange('minimumStock', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">
                      Định mức tồn cao nhất
                    </label>
                    <input
                      className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
                      type="number"
                      min="0"
                      value={f.form.stockMax !== '' ? f.form.stockMax : '0'}
                      onChange={(e) => f.handleChange('stockMax', e.target.value)}
                    />
                  </div>
                </div>
              </Section>
              <Section title="Giá vốn, giá bán" defaultOpen>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {[
                    ['Giá vốn', 'costPrice'],
                    ['Giá bán', 'salePrice'],
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
                          onBlur={(e) => {
                            const raw = e.target.value.replace(/\./g, '');
                            if (raw !== '' && !Number.isNaN(Number(raw)))
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
                    <div className="relative">
                      <select
                        className="text-body-md w-full appearance-none rounded-[8px] border border-outline-variant bg-surface-container-lowest px-3 py-2.5 pr-9 focus:ring-0"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            f.addLocation(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Chọn vị trí có sẵn hoặc tạo mới...</option>
                        {(Array.isArray(f.locations) ? f.locations : [])
                          .filter((loc) => !(f.form.locations || []).includes(loc))
                          .map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon name="expand_more" size={16} />
                      </span>
                    </div>
                    {(Array.isArray(f.form.locations) ? f.form.locations : []).length > 0 && (
                      <div className="flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-[8px] border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[15px]">
                        {(Array.isArray(f.form.locations) ? f.form.locations : []).map((loc) => (
                          <div
                            key={loc}
                            className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-800"
                          >
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => f.removeLocation(loc)}
                              className="font-bold text-gray-600 hover:text-gray-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                <div className="space-y-2">
                  <label className="text-label-md text-on-surface-variant">Kích thước</label>
                  <div className="max-w-lg">
                    <div className="inline-flex w-full items-stretch overflow-hidden rounded-lg border border-[#dcdfe6] bg-white">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Rộng"
                        value={f.form.width ?? ''}
                        onChange={(e) => f.handleChange('width', e.target.value)}
                        className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Dài"
                        value={f.form.length ?? ''}
                        onChange={(e) => f.handleChange('length', e.target.value)}
                        className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
                      />
                      <div className="relative w-1/3">
                        <select
                          value={
                            ['mm', 'cm', 'm'].includes(f.form.sizeUnit) ? f.form.sizeUnit : 'mm'
                          }
                          onChange={(e) => f.handleChange('sizeUnit', e.target.value)}
                          className="w-full appearance-none bg-white px-3 py-2 pr-7 text-left text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="mm">mm</option>
                          <option value="cm">cm</option>
                          <option value="m">m</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                          <Icon name="expand_more" size={16} />
                        </span>
                      </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Mô tả</span>
                    <select className="rounded border bg-transparent px-2 py-1 text-sm text-gray-700">
                      <option>Format</option>
                    </select>
                  </div>
                  <div className="mx-2 h-5 w-px bg-gray-300" />
                  {['B', 'I', 'U'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-gray-600 hover:bg-gray-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <textarea
                  className="min-h-[160px] w-full resize-none bg-white p-4 text-[15px] leading-[1.4] outline-none"
                  placeholder="Nhập mô tả sản phẩm"
                  value={f?.form?.description ?? ''}
                  onChange={(e) => f?.handleChange?.('description', e.target.value)}
                />
              </div>
              <div className="mt-4 overflow-hidden rounded-md border border-[#dcdfe6]">
                <div className="bg-[#f5f6f7] px-4 py-3 text-sm font-semibold text-gray-700">
                  Mẫu ghi chú (hoá đơn, đặt hàng)
                </div>
                <textarea
                  className="min-h-[120px] w-full resize-none border-none p-4 outline-none"
                  placeholder="Nhập ghi chú"
                  value={f?.form?.notes ?? ''}
                  onChange={(e) => f?.handleChange?.('notes', e.target.value)}
                />
              </div>
            </div>
          )}
        </main>
        <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <input
              checked={!!f.form.directSale}
              type="checkbox"
              id="footer-sell-direct"
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              onChange={(e) => f.handleChange('directSale', e.target.checked)}
            />
            <label
              className="flex cursor-pointer items-center text-sm font-semibold text-gray-700"
              htmlFor="footer-sell-direct"
            >
              Bán trực tiếp
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
      <CreateGroupModal
        open={f.createGroupModalOpen}
        groups={f.groups}
        newGroupName={f.newGroupName}
        setNewGroupName={f.setNewGroupName}
        newGroupParent={f.newGroupParent}
        setNewGroupParent={f.setNewGroupParent}
        onClose={() => f.setCreateGroupModalOpen(false)}
        onSave={() => {
          f.saveNewGroup(f.newGroupName);
          f.setCreateGroupModalOpen(false);
          f.setNewGroupName('');
          f.setNewGroupParent('');
        }}
      />
      <CreateBrandModal
        open={f.createBrandModalOpen}
        newBrandName={f.newBrandName}
        setNewBrandName={f.setNewBrandName}
        onClose={() => f.setCreateBrandModalOpen(false)}
        onSave={() => {
          f.saveNewBrand(f.newBrandName);
          f.setCreateBrandModalOpen(false);
          f.setNewBrandName('');
        }}
      />
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
      getProduct(props.product.productId || props.product.id)
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
  const [productToEdit, setProductToEdit] = useState(null);
  const [initialEditTab, setInitialEditTab] = useState('info');
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    if (searchParams.get('status') === 'draft') filters.setProductStatusFilter('draft');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    estimatedRef,
    setEstimatedQuickOpen,
    setEstimatedCustomOpen,
    createdRef,
    setCreatedQuickOpen,
    setCreatedCustomOpen,
    statusDropdownRef,
    setStatusDropdownOpen,
  } = filters;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (estimatedRef.current && !estimatedRef.current.contains(e.target)) {
        setEstimatedQuickOpen(false);
        setEstimatedCustomOpen(false);
      }
      if (createdRef.current && !createdRef.current.contains(e.target)) {
        setCreatedQuickOpen(false);
        setCreatedCustomOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
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
    statusDropdownRef,
    setStatusDropdownOpen,
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
      filters.setCurrentPage(1);
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
    if (isChecked) setSelectedIds(currentRows.map((row) => row.productId || row.id));
    else setSelectedIds([]);
  };

  return (
    <div className="mt-2 w-full space-y-4 text-slate-800">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hàng hóa</h1>
        <p className="mt-1 text-gray-600">Quản lý danh sách hàng hóa và tồn kho</p>
      </div>

      <div className="flex w-full">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${apiStatus.isMock ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
        >
          {apiStatus.loading
            ? 'Đang đồng bộ dữ liệu API...'
            : apiStatus.isMock
              ? '⚠ Hiển thị dữ liệu mẫu (chưa kết nối được API)'
              : 'Đã đồng bộ dữ liệu sản phẩm từ API'}
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
            <div className="animate-fade-in flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm transition-all">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Icon name="check_circle" size={20} /> Đã chọn {selectedIds.length} hàng hóa trên
                trang này
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  onClick={async () => {
                    if (
                      window.confirm(`Bạn muốn MỞ BÁN lại ${selectedIds.length} sản phẩm đã chọn?`)
                    ) {
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
                    if (
                      window.confirm(
                        `Bạn muốn NGỪNG KINH DOANH ${selectedIds.length} sản phẩm đã chọn?`
                      )
                    ) {
                      const ok = await handleBulkToggleStatus(selectedIds, false);
                      if (ok) setSelectedIds([]);
                    }
                  }}
                >
                  <Icon name="block" size={18} /> Ngừng bán
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-1 gap-3">
              <div className="flex min-w-[240px] max-w-sm flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                <Icon name="search" className="mr-2 text-slate-400" />
                <input
                  className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
                  placeholder="Theo mã, tên hàng..."
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
                className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
                onClick={() => {
                  setProductToEdit(null);
                  setEditModalOpen(true);
                }}
              >
                <Icon name="add" className="text-sm" /> Tạo mới
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <Icon name="upload_file" className="text-sm" /> Import file
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <Icon name="download" className="text-sm" /> Xuất file
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
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary focus:ring-primary"
                  >
                    <option value={10}>10 dòng</option>
                    <option value={15}>15 dòng</option>
                    <option value={30}>30 dòng</option>
                    <option value={50}>50 dòng</option>
                  </select>
                </div>
                <span>{`${startRowNum} - ${endRowNum} trong tổng số ${totalCount} hàng hóa`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={filters.currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          key={productToEdit?.productId || productToEdit?.productCode || productToEdit?.id || 'new'}
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
    </div>
  );
};

export default ProductManagement;
