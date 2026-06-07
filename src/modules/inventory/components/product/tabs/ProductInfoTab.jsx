/**
 * Tab "Thông tin" trong modal sản phẩm - Form đầy đủ: mã hàng, tên, nhóm, thương hiệu,
 * upload ảnh, tồn kho, giá, vị trí/kích thước, đơn vị tính + thuộc tính.
 */
import React from 'react';
import Section from '../form/Section';
import ImageUploader from '../form/ImageUploader';
import UnitManagement from '../form/UnitManagement';
import AttributeEditor from '../form/AttributeEditor';
import Icon from '../../../../../shared/components/Icon';

const ProductInfoTab = ({ f }) => (
  <>
    <section className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-9">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">Mã hàng</label>
            <input
              className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
              type="text"
              value={f.form.id || ''}
              onChange={(e) => f.handleChange('id', e.target.value)}
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
              <label className="text-label-md text-on-surface-variant">Nhóm hàng</label>
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
              <option>Chọn nhóm hàng</option>
              {f.groups.map((g) => (
                <option key={g}>{g}</option>
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
              <option>Chọn thương hiệu</option>
              {f.brands.map((b) => (
                <option key={b}>{b}</option>
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
          productName={f.form.name}
        />
      </div>
    </section>

    <Section
      title="Tồn kho"
      subtitle="Quản lý số lượng tồn kho và định mức tồn. Khi tồn kho chạm đến định mức, bạn sẽ nhận được cảnh báo."
      defaultOpen
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-label-md text-on-surface-variant">Tồn kho hiện tại</label>
          <input
            className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right font-semibold focus:ring-0"
            type="text"
            value={f.form.stock || '0'}
            onChange={(e) => f.handleChange('stock', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-md text-on-surface-variant">Định mức tồn thấp nhất</label>
          <input
            className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
            type="text"
            value={f.form.minimumStock ?? f.form.stockMin ?? '0'}
            onChange={(e) =>
              f.setForm((c) => ({ ...c, minimumStock: e.target.value, stockMin: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-md text-on-surface-variant">Định mức tồn cao nhất</label>
          <input
            className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
            type="text"
            value={f.form.stockMax ?? '0'}
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
            <div className="flex items-center justify-between">
              <label className="text-label-md text-on-surface-variant">{label}</label>
              {field === 'salePrice' && (
                <button
                  type="button"
                  className="text-label-md flex items-center gap-1 font-bold leading-[1.15] text-primary"
                >
                  <Icon name="settings" size={16} />
                  Thiết lập giá
                </button>
              )}
            </div>
            <div className="relative">
              <input
                className="text-body-lg w-full border-b-2 border-l-0 border-r-0 border-t-0 border-outline-variant bg-transparent py-2 pr-8 text-right font-bold leading-[1.2] text-primary focus:border-primary"
                type="text"
                inputMode="numeric"
                value={
                  f.form[field] != null && f.form[field] !== '' ? f.formatMoney(f.form[field]) : ''
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, '');
                  f.handleChange(field, raw);
                }}
                onBlur={(e) => {
                  const raw = e.target.value.replace(/\./g, '');
                  if (raw !== '' && !Number.isNaN(Number(raw))) {
                    f.handleChange(field, raw);
                  }
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

    <Section
      title="Vị trí, trọng lượng, kích thước"
      subtitle="Quản lý việc sắp xếp kho, vị trí bán hàng hoặc quy cách giao hàng"
      defaultOpen
    >
      <div className="mb-5 grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-label-md text-on-surface-variant">Vị trí</label>
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
          <div className="relative flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-[8px] border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[15px]">
            {(f.form.locations || []).map((loc) => (
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
        </div>
        <div className="space-y-2">
          <label className="text-label-md text-on-surface-variant">Trọng lượng</label>
          <div className="flex items-center overflow-hidden rounded-[8px] border border-outline-variant bg-surface-container-lowest">
            <input
              className="flex-1 border-none bg-transparent px-3 py-2 text-right text-[15px] font-semibold leading-[1.35] focus:ring-0"
              type="text"
              value={f.form.weight || ''}
              onChange={(e) => f.handleChange('weight', e.target.value)}
            />
            <select
              className="text-label-sm cursor-pointer border-l border-outline-variant bg-surface-container-low px-2 py-2 font-bold leading-[1.15] text-primary focus:ring-0"
              value={f.form.weightUnit || 'g'}
              onChange={(e) => f.handleChange('weightUnit', e.target.value)}
            >
              <option>g</option>
              <option>kg</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-label-md text-on-surface-variant">Kích thước</label>
        <div className="max-w-lg">
          <div className="inline-flex w-full items-stretch overflow-hidden rounded-lg border border-[#dcdfe6] bg-white">
            <input
              type="text"
              placeholder="Rộng"
              value={f.form.width || ''}
              onChange={(e) => f.handleChange('width', e.target.value)}
              className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Dài"
              value={f.form.length || ''}
              onChange={(e) => f.handleChange('length', e.target.value)}
              className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
            />
            <div className="relative w-1/3">
              <select
                value={f.form.sizeUnit || ''}
                onChange={(e) => f.handleChange('sizeUnit', e.target.value)}
                className="w-full appearance-none bg-white px-3 py-2 text-left text-[15px] focus:outline-none"
              >
                <option value="">mm</option>
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
  </>
);

export default ProductInfoTab;
