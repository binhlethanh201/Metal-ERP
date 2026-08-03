import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Card from '../../../../shared/components/Card';
import Input from '../../../../shared/components/Input';
import Textarea from '../../../../shared/components/Textarea';
import Toggle from '../../../../shared/components/Toggle';
import Button from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { getProduct } from '../../services/productService';
import { useEditProductForm } from '../../hooks/useEditProductForm';
import { formatMoney } from '../../utils/productUtils';

const fmtMoney = (v) => formatMoney(v);

const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  const header = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-[#e5e5e5]">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-[#999999]">{subtitle}</p>}
      </div>
      <IconButton
        icon={({ size }) => (
          <Icon
            name="expand_more"
            size={size}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          />
        )}
        variant="ghost"
        onClick={() => setOpen((s) => !s)}
      />
    </div>
  );

  return (
    <Card
      header={header}
      padding={open ? 'p-5' : 'p-0 h-0 overflow-hidden border-none'}
      className="mb-6"
    >
      {open && children}
    </Card>
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
    <div className="relative w-full space-y-2">
      <div className="relative">
        <Input
          label={label}
          value={value || ''}
          placeholder={placeholder || 'Chọn hoặc nhập mới...'}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 top-[34px] text-slate-400 hover:text-slate-600 dark:text-[#808080] dark:hover:text-[#b3b3b3]"
        >
          <Icon name="expand_more" size={18} />
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-[#333333] dark:bg-[#1a1a1a]">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="cursor-pointer px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#004785] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
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
        <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="aspect-square w-full">
            {images?.length > 0 ? (
              <img
                src={images[0].url}
                alt={productName || 'Product'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center py-8 text-slate-400 dark:text-[#808080]">
                <button
                  type="button"
                  onClick={onOpenFilePicker}
                  className="flex flex-col items-center gap-2"
                >
                  <Icon name="add" className="text-slate-400 dark:text-[#808080]" size={28} />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </div>
            )}
          </div>
          {images?.length > 0 && (
            <div className="absolute left-2 top-2 z-20 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
              Main
            </div>
          )}
        </div>
        <div className="flex w-20 flex-col items-center gap-3">
          {images.length < maxImages ? (
            <button
              onClick={onOpenFilePicker}
              type="button"
              className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-500 transition-all hover:border-[#004785] hover:bg-blue-50 hover:text-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:border-[#004785] dark:hover:bg-[#333333]"
            >
              <Icon name="add" size={20} />
            </button>
          ) : (
            <div className="h-20 w-20" />
          )}
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]"
            >
              <button
                type="button"
                onClick={() => onPinImage(idx)}
                className="absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                title="Đặt làm ảnh đại diện"
              >
                <Icon
                  name="push_pin"
                  className={idx === 0 ? 'text-[#004785]' : 'text-slate-600 dark:text-[#b3b3b3]'}
                  size={14}
                />
              </button>
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute bottom-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                title="Xóa ảnh"
              >
                <Icon name="delete" className="text-red-500" size={14} />
              </button>
              <img
                src={img.url}
                alt={`thumb-${idx}`}
                className={`h-full w-full object-cover ${idx === 0 ? 'ring-2 ring-[#004785]' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full items-end gap-2">
        <div className="flex-1">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            placeholder="Dán link ảnh (https://...)"
          />
        </div>
        <Button
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="mb-0"
        >
          Thêm
        </Button>
      </div>
    </div>
  );
};

const AttributeEditor = ({ f }) => (
  <>
    <h4 className="mb-1 text-lg font-semibold text-slate-800 dark:text-[#e5e5e5]">Thuộc tính</h4>
    <p className="mb-5 text-sm text-slate-500 dark:text-[#999999]">Thêm đặc điểm thuộc tính của sản phẩm</p>
    <div className="space-y-3">
      {(f.form.attributes || []).map((attr) => (
        <div
          key={attr.id}
          className="grid items-center gap-3"
          style={{ gridTemplateColumns: '230px 1fr 52px' }}
        >
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                f.setOpenDropdownId(f.openDropdownId === attr.id ? null : attr.id);
              }}
              className={`h-[42px] w-full border bg-white px-4 text-left ${f.openDropdownId === attr.id ? 'border-[#004785] ring-1 ring-[#004785]' : 'border-slate-200 dark:border-[#404040]'} flex items-center justify-between rounded-lg dark:bg-[#1a1a1a]`}
            >
              <span className={`truncate ${attr.name ? 'text-slate-800 dark:text-[#e5e5e5]' : 'text-slate-500 dark:text-[#999999]'}`}>
                {attr.name || 'Chọn thuộc tính'}
              </span>
              <Icon name="expand_more" size={16} className="text-slate-500 dark:text-[#999999]" />
            </button>
            {f.openDropdownId === attr.id && (
              <div className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#333333] dark:bg-[#1a1a1a]">
                {(f.availableAttributes || []).map((item, aidx) => (
                  <div
                    key={item + aidx}
                    onClick={() => {
                      f.updateAttr(attr.id, 'name', item);
                      f.setOpenDropdownId(null);
                    }}
                    className={`flex h-10 cursor-pointer items-center justify-between px-4 ${attr.name === item ? 'bg-blue-50 text-[#004785] dark:bg-[#272727]' : 'hover:bg-slate-100 dark:hover:bg-[#333333]'}`}
                  >
                    <span className="flex-1 text-sm dark:text-[#d4d4d4]">{item}</span>
                    <IconButton
                      icon={({ size }) => <Icon name="edit" size={size} />}
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        f.setEditAttrIndex(aidx);
                        f.setEditAttrValue(item);
                        f.setEditAttrModalOpen(true);
                        f.setOpenDropdownId(null);
                      }}
                    />
                  </div>
                ))}
                <div
                  onClick={() => {
                    f.setEditingAttrId(attr.id);
                    f.setNewAttrName('');
                    f.setCreateAttrModalOpen(true);
                    f.setOpenDropdownId(null);
                  }}
                  className="flex h-10 cursor-pointer items-center px-4 hover:bg-slate-100 dark:hover:bg-[#333333]"
                >
                  <span className="text-sm font-medium text-[#004785]">+ Tạo thuộc tính mới</span>
                </div>
              </div>
            )}
          </div>
          <Input
            placeholder="Nhập giá trị thuộc tính"
            value={attr.value || ''}
            onChange={(e) => f.updateAttr(attr.id, 'value', e.target.value)}
          />
          <button
            type="button"
            onClick={() => f.removeAttr(attr.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="Xóa thuộc tính"
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      ))}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            f.addAttrRow();
          }}
          className="mt-2 flex items-center gap-1"
        >
          <Icon name="add" size={16} /> Thêm thuộc tính
        </Button>
      </div>
    </div>
  </>
);

const UnitManagement = ({ f }) => (
  <div className="mb-8">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <Icon name="inventory_2" size={20} />
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Đơn vị tính</h4>
        <p className="text-sm text-slate-500 dark:text-[#999999]">
          Quản lý đơn vị cơ bản và đơn vị quy đổi để bán hàng linh hoạt
        </p>
      </div>
    </div>

    {/* Đơn vị cơ bản */}
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            1
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Đơn vị cơ bản</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Tên đơn vị"
              placeholder="Ví dụ: Cái, Chai, Kg"
              value={f.form.baseUnit?.name || ''}
              onChange={(e) =>
                f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), name: e.target.value })
              }
            />
          </div>
          <div className="w-48">
            <Input
              label="Giá bán"
              className="text-right"
              value={fmtMoney(f.form.baseUnit?.price || 0)}
              onChange={(e) =>
                f.handleChange('baseUnit', {
                  ...(f.form.baseUnit || {}),
                  price: Number(e.target.value.replaceAll('.', '').replaceAll(',', '')) || 0,
                })
              }
            />
          </div>
          <div className="flex items-center gap-2 pb-3">
            <Toggle
              checked={!!f.form.baseUnit?.directSale}
              onChange={(checked) =>
                f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), directSale: checked })
              }
            />
            <label className="cursor-pointer text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Cho phép bán lẻ
            </label>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-[#808080]">
          Đây là đơn vị nhỏ nhất, dùng để quy đổi các đơn vị khác (ví dụ: 1 thùng = 12 cái)
        </p>
      </div>
    </div>

    {/* Đơn vị quy đổi */}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            2
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">Đơn vị quy đổi</span>
          {(f.form.conversionUnits || []).length > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {f.form.conversionUnits.length} đơn vị
            </span>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => f.setAddConversionUnitModal(true)}
          className="flex items-center gap-1.5"
        >
          <Icon name="add" size={16} /> Thêm đơn vị
        </Button>
      </div>

      <div className="p-5">
        {(f.form.conversionUnits || []).length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#333333]">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Đơn vị
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Quy đổi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Giá bán
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Bán
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                    Xóa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                {(f.form.conversionUnits || []).map((unit) => (
                  <tr key={unit.id} className="transition-colors hover:bg-blue-50/50 dark:hover:bg-[#333333]/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800 dark:bg-[#272727] dark:text-[#e5e5e5]">
                        {unit.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#999999]">
                      1 <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">{unit.name}</span>
                      <span className="mx-1.5 text-slate-300 dark:text-[#666666]">=</span>
                      <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
                        {unit.rate || unit.convertValue}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-[#999999]">{f.form.baseUnit?.name || 'Cái'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
                        {unit.price
                          ? fmtMoney(unit.price)
                          : fmtMoney(
                              (Number(f.form.baseUnit?.price) || 0) *
                                (Number(unit.rate || unit.convertValue) || 1)
                            )}
                      </span>
                      <span className="ml-0.5 text-slate-400 dark:text-[#808080]">₫</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <Toggle
                          checked={unit.directSale !== false}
                          onChange={(checked) =>
                            f.updateConversionUnit(unit.id, 'directSale', checked)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Xóa đơn vị "${unit.name}"?`)) {
                            f.removeConversionUnit(unit.id);
                          }
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title={`Xóa đơn vị ${unit.name}`}
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#272727]">
              <Icon name="add" size={24} className="text-slate-300 dark:text-[#808080]" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-[#b3b3b3]">Chưa có đơn vị quy đổi</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-[#808080]">
              Thêm đơn vị như thùng, lốc, bộ để bán theo nhiều quy cách
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => f.setAddConversionUnitModal(true)}
              className="mt-4 flex items-center gap-1.5"
            >
              <Icon name="add" size={14} /> Thêm đơn vị đầu tiên
            </Button>
          </div>
        )}
      </div>
    </div>

    {/* Modal thêm đơn vị quy đổi */}
    <Modal
      isOpen={f.addConversionUnitModal}
      onClose={() => f.setAddConversionUnitModal(false)}
      title="Thêm đơn vị quy đổi"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={() => f.setAddConversionUnitModal(false)}>
            Bỏ qua
          </Button>
          <Button variant="primary" onClick={f.addConversionUnitHandler}>
            Thêm
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Tên đơn vị */}
        <Input
          label="Tên đơn vị"
          placeholder="Ví dụ: lốc, thùng"
          value={f.newConversionUnit.name || ''}
          onChange={(e) => f.setNewConversionUnit({ ...f.newConversionUnit, name: e.target.value })}
          autoFocus
        />

        {/* Preview công thức */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Công thức quy đổi:</p>
          <p className="mt-1 text-base">
            <span className="font-semibold">1 {f.newConversionUnit.name || '[tên đơn vị]'}</span>
            <span className="mx-2">=</span>
            <span className="font-semibold">{f.newConversionUnit.convertValue || '?'}</span>
            <span className="ml-2">
              {f.newConversionUnit.convertFrom || f.form.baseUnit?.name || '[đơn vị gốc]'}
            </span>
          </p>
        </div>

        {/* Giá trị quy đổi + Đơn vị gốc */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá trị quy đổi"
            placeholder={`Ví dụ: 4, 20`}
            type="text"
            inputMode="numeric"
            value={f.newConversionUnit.convertValue || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              f.setNewConversionUnit({
                ...f.newConversionUnit,
                convertValue: raw,
                rate: raw,
              });
            }}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Đơn vị quy đổi từ
            </label>
            <select
              value={f.newConversionUnit.convertFrom || ''}
              onChange={(e) =>
                f.setNewConversionUnit({ ...f.newConversionUnit, convertFrom: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            >
              <option value="">Chọn đơn vị</option>
              {f.form.baseUnit?.name && (
                <option value={f.form.baseUnit.name}>{f.form.baseUnit.name}</option>
              )}
              {(f.form.conversionUnits || []).map((u) => (
                <option key={u.id || u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Giá bán */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Giá bán</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={f.newConversionUnit.price ? fmtMoney(Number(f.newConversionUnit.price)) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                f.setNewConversionUnit({
                  ...f.newConversionUnit,
                  price: raw ? Number(raw) : '',
                });
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-8 text-right text-base font-semibold text-slate-900 transition-colors placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:placeholder:text-[#808080]"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-[#808080]">
              ₫
            </span>
          </div>
          {/* Giá đề xuất tự tính */}
          {(() => {
            const base = Number(f.form.baseUnit?.price) || 0;
            const cv = Number(f.newConversionUnit.convertValue) || 0;
            const from = f.newConversionUnit.convertFrom || f.form.baseUnit?.name || '';
            if (!base || !cv || !from) return null;
            const unitsByName = (f.form.conversionUnits || []).reduce((acc, u) => {
              acc[u.name] = u;
              return acc;
            }, {});
            const computeMul = (un, visited = new Set()) => {
              if (!un || visited.has(un)) return null;
              if (un === f.form.baseUnit?.name) return 1;
              const u = unitsByName[un];
              if (!u) return null;
              visited.add(un);
              const pm = computeMul(u.convertFrom, visited);
              return pm == null ? null : Number(u.convertValue) * pm;
            };
            const mult =
              from === f.form.baseUnit?.name
                ? cv
                : (() => {
                    const pm = computeMul(from);
                    return pm == null ? null : cv * pm;
                  })();
            if (!mult) return null;
            const suggestPrice = base * mult;
            return (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                ✦ Giá đề xuất: <span className="font-semibold">{fmtMoney(suggestPrice)}</span>
                <span className="ml-0.5">₫</span>
              </p>
            );
          })()}
        </div>

        {/* Checkbox bán */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="direct-sell"
            checked={f.newConversionUnit.directSale || false}
            onChange={(e) =>
              f.setNewConversionUnit({ ...f.newConversionUnit, directSale: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#404040]"
          />
          <label htmlFor="direct-sell" className="cursor-pointer text-sm text-slate-700 dark:text-[#b3b3b3]">
            Cho phép bán đơn vị này
          </label>
        </div>
      </div>
    </Modal>
  </div>
);

const EditProductModalContent = ({ onClose, product, onSave, title, productList, initialTab }) => {
  const f = useEditProductForm({ product, onSave, onClose, productList, initialTab });

  const footerContent = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center space-x-3">
        <Toggle checked={f.form.productStatus !== 'inactive'} disabled />
        <label className="flex items-center text-sm font-semibold text-slate-500 dark:text-[#999999]">
          Đang hoạt động{' '}
          <span className="ml-2 hidden text-xs font-normal text-slate-400 dark:text-[#808080] sm:inline">
            — đổi trạng thái ở danh sách
          </span>
        </label>
      </div>
      <div className="flex space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Bỏ qua
        </Button>
        <Button variant="primary" onClick={f.handleSubmit}>
          Lưu dữ liệu
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={title || (product ? 'Sửa hàng hóa' : 'Thêm hàng hóa')}
        size="6xl"
        footer={footerContent}
      >
        <div className="-mx-6 -mt-4 mb-4 flex gap-4 border-b border-slate-200 px-6 dark:border-[#333333]">
          {['info', 'description'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => f.setActiveTab(tab)}
              className={`flex h-12 items-center text-sm font-medium tracking-wider ${f.activeTab === tab ? 'border-b-2 border-[#004785] text-[#004785]' : 'text-slate-500 hover:text-slate-700 dark:text-[#999999] dark:hover:text-[#b3b3b3]'}`}
            >
              {tab === 'info' ? 'Thông tin' : 'Mô tả'}
            </button>
          ))}
        </div>

        {f.activeTab === 'info' ? (
          <div className="space-y-6">
            <section className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-5 lg:col-span-9">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Input
                    label="Mã hàng (Duy nhất)"
                    disabled={!!product}
                    value={f.form.productCode || f.form.id || ''}
                    onChange={(e) => f.handleChange('productCode', e.target.value)}
                  />
                  <Input
                    label="Mã vạch"
                    placeholder="Nhập mã vạch"
                    value={f.form.barcode || ''}
                    onChange={(e) => f.handleChange('barcode', e.target.value)}
                  />
                </div>
                <Input
                  label="Tên hàng"
                  required
                  className="font-semibold"
                  value={f.form.name || ''}
                  onChange={(e) => f.handleChange('name', e.target.value)}
                />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <AutocompleteInput
                    label="Nhóm hàng / Danh mục"
                    value={f.form.group}
                    onChange={(val) => f.handleChange('group', val)}
                    options={f.groups}
                  />
                  <AutocompleteInput
                    label="Thương hiệu"
                    value={f.form.brand}
                    onChange={(val) => f.handleChange('brand', val)}
                    options={f.brands}
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
              title="Tồn kho"
              subtitle="Chỉ hiển thị số lượng tồn kho hệ thống và ngưỡng cảnh báo."
              defaultOpen
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Tồn kho"
                  type="number"
                  min="0"
                  className="text-right font-semibold"
                  value={f.form.stock !== '' ? f.form.stock : '0'}
                  readOnly
                  disabled
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d+$/.test(v)) f.handleChange('stock', v);
                  }}
                />
                <Input
                  label="Tồn kho tối thiểu (cảnh báo)"
                  type="number"
                  min="0"
                  className="text-right font-semibold text-amber-600"
                  value={f.form.minimumStock !== '' ? f.form.minimumStock : '0'}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d+$/.test(v)) f.handleChange('minimumStock', v);
                  }}
                  onKeyDown={(e) => {
                    if (
                      [
                        'Backspace',
                        'Delete',
                        'Tab',
                        'Escape',
                        'Enter',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                        'Home',
                        'End',
                      ].includes(e.key)
                    )
                      return;
                    if (!/^\d$/.test(e.key)) e.preventDefault();
                  }}
                />
              </div>
            </Section>

            <Section title="Giá vốn, giá bán" defaultOpen>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  ['Giá vốn (*)', 'costPrice'],
                  ['Giá bán (*)', 'salePrice'],
                ].map(([label, field]) => (
                  <div key={field} className="relative">
                    <Input
                      label={label}
                      className="pr-8 text-right font-bold text-[#004785]"
                      type="text"
                      inputMode="numeric"
                      value={
                        f.form[field] != null && f.form[field] !== '' ? fmtMoney(f.form[field]) : ''
                      }
                      onChange={(e) => f.handleChange(field, e.target.value.replace(/\./g, ''))}
                    />
                    <span className="absolute bottom-2.5 right-3 font-medium text-slate-500 dark:text-[#999999]">
                      đ
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Vị trí, trọng lượng, kích thước" defaultOpen>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <AutocompleteInput
                      label="Vị trí Kệ/Tủ"
                      value={f.form.shelfLocation || ''}
                      onChange={(val) => f.handleChange('shelfLocation', val)}
                      options={Array.isArray(f.locations) ? f.locations : []}
                      placeholder="Tìm hoặc chọn vị trí..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        f.setNewLocationName('');
                        f.setCreateLocationModalOpen(true);
                      }}
                      className="mt-1 text-sm font-semibold text-[#004785] hover:underline"
                    >
                      + Tạo vị trí mới
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                      Trọng lượng
                    </label>
                    <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-[#004785] dark:border-[#333333] dark:bg-[#1a1a1a]">
                      <input
                        className="flex-1 border-none bg-transparent px-3 py-2 text-right focus:outline-none dark:text-[#e5e5e5]"
                        type="number"
                        min="0"
                        step="any"
                        value={f.form.weight ?? ''}
                        onChange={(e) => f.handleChange('weight', e.target.value)}
                      />
                      <select
                        className="border-l border-slate-200 bg-slate-50 px-3 py-2 font-medium focus:outline-none dark:border-[#333333] dark:bg-[#272727] dark:text-[#b3b3b3]"
                        value={['g', 'kg'].includes(f.form.weightUnit) ? f.form.weightUnit : 'g'}
                        onChange={(e) => f.handleChange('weightUnit', e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                    Kích thước (Dài × Rộng × Cao)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      className="w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Dài"
                      value={f.form.length ?? ''}
                      onChange={(e) => f.handleChange('length', e.target.value)}
                    />
                    <span className="font-bold text-slate-400 dark:text-[#808080]">×</span>
                    <input
                      className="w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Rộng"
                      value={f.form.width ?? ''}
                      onChange={(e) => f.handleChange('width', e.target.value)}
                    />
                    <span className="font-bold text-slate-400 dark:text-[#808080]">×</span>
                    <input
                      className="w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Cao"
                      value={f.form.height ?? ''}
                      onChange={(e) => f.handleChange('height', e.target.value)}
                    />
                    <select
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium focus:outline-none dark:border-[#333333] dark:bg-[#272727] dark:text-[#b3b3b3]"
                      value={['mm', 'cm', 'm'].includes(f.form.sizeUnit) ? f.form.sizeUnit : 'mm'}
                      onChange={(e) => f.handleChange('sizeUnit', e.target.value)}
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Quản lý theo đơn vị tính và thuộc tính" defaultOpen>
              <UnitManagement f={f} />
              <div className="border-t border-slate-200 pt-6 dark:border-[#333333]">
                <AttributeEditor f={f} />
              </div>
            </Section>
          </div>
        ) : (
          <div className="h-full">
            <Card padding="p-0" header="Mô tả kỹ thuật (Specification)">
              <Textarea
                rows={8}
                className="rounded-none border-none focus:border-transparent"
                placeholder="Nhập mô tả sản phẩm / thông số kỹ thuật"
                value={f?.form?.specification ?? f?.form?.description ?? ''}
                onChange={(e) => f?.handleChange?.('specification', e.target.value)}
              />
            </Card>
          </div>
        )}
      </Modal>

      {/* Sub-Modals */}
      <Modal
        isOpen={f.createLocationModalOpen}
        onClose={() => f.setCreateLocationModalOpen(false)}
        title="Tạo vị trí"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => f.setCreateLocationModalOpen(false)}>
              Bỏ qua
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await f.saveNewLocation(f.newLocationName);
                f.setCreateLocationModalOpen(false);
                f.setNewLocationName('');
              }}
            >
              Lưu
            </Button>
          </>
        }
      >
        <Input
          label="Vị trí"
          required
          value={f.newLocationName}
          onChange={(e) => f.setNewLocationName(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await f.saveNewLocation(f.newLocationName);
              f.setCreateLocationModalOpen(false);
              f.setNewLocationName('');
            }
          }}
          autoFocus
        />
      </Modal>

      <Modal
        isOpen={f.createAttrModalOpen}
        onClose={() => {
          f.setCreateAttrModalOpen(false);
          f.setEditingAttrId(null);
        }}
        title="Tạo thuộc tính"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                f.setCreateAttrModalOpen(false);
                f.setEditingAttrId(null);
              }}
            >
              Bỏ qua
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                const name = (f.newAttrName || '').trim();
                if (name) {
                  await f.addAvailableAttribute(name);
                  if (f.editingAttrId) f.updateAttr(f.editingAttrId, 'name', name);
                }
                f.setCreateAttrModalOpen(false);
                f.setEditingAttrId(null);
              }}
            >
              Xong
            </Button>
          </>
        }
      >
        <Input
          label="Tên thuộc tính"
          placeholder="Hương vị, Dung tích..."
          value={f.newAttrName}
          onChange={(e) => f.setNewAttrName(e.target.value)}
        />
      </Modal>

      <Modal
        isOpen={f.editAttrModalOpen}
        onClose={() => {
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
        title="Sửa thuộc tính"
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button
              variant="danger"
              onClick={() => {
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
            >
              Xóa
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  f.setEditAttrModalOpen(false);
                  f.setEditAttrIndex(null);
                }}
              >
                Bỏ qua
              </Button>
              <Button
                variant="primary"
                onClick={() => {
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
              >
                Xong
              </Button>
            </div>
          </div>
        }
      >
        <Input
          label="Tên thuộc tính"
          value={f.editAttrValue}
          onChange={(e) => f.setEditAttrValue(e.target.value)}
        />
      </Modal>
    </>
  );
};

export const EditProductModal = (props) => {
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(!!props.product);

  useEffect(() => {
    if (props.open && props.product) {
      setLoading(true);
      getProduct(props.product.id || props.product.productId)
        .then((res) =>
          setFullProduct(
            res?.success && res?.data ? { ...props.product, ...res.data } : props.product
          )
        )
        .catch(() => setFullProduct(props.product))
        .finally(() => setLoading(false));
    } else {
      setFullProduct(null);
      setLoading(false);
    }
  }, [props.open, props.product]);

  if (!props.open) return null;

  if (loading) {
    return (
      <Modal isOpen={true} onClose={props.onClose} size="sm">
        <div className="flex h-32 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#004785]">
            <Icon name="sync" className="animate-spin text-3xl" />
            <span className="text-sm font-bold text-slate-600 dark:text-[#b3b3b3]">Đang tải dữ liệu...</span>
          </div>
        </div>
      </Modal>
    );
  }

  return <EditProductModalContent {...props} product={fullProduct} />;
};

export default EditProductModal;
