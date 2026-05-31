/**
 * ProductBasicTab - Tab Thông tin cơ bản trong popup Thêm mới Hàng hóa.
 */
import Icon from '../../../../../shared/components/Icon';
import UnitConversionSection from './UnitConversionSection';

const TAX_OPTIONS = ['KCT', '0%', '5%', '8%', '10%'];

const MOCK_SUPPLIERS = [
  { id: 'NCC001', name: 'Công ty Hòa Phát' },
  { id: 'NCC002', name: 'Thép Việt Nhật' },
  { id: 'NCC003', name: 'Kim khí Sài Gòn' },
  { id: 'NCC004', name: 'Tôn Hoa Sen' },
];

const ProductBasicTab = ({ p }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-6">
      {/* Cột trái - Thông tin sản phẩm */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Thông tin sản phẩm
        </h3>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Tên hàng hóa <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
            value={p.form.name}
            onChange={(e) => p.handleChange('name', e.target.value)}
            placeholder="Nhập tên hàng hóa"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Nhóm hàng hóa</span>
          <div className="mt-1 flex gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.groupId}
              onChange={(e) => {
                const g = p.groupList.find((x) => x.id === e.target.value);
                p.handleChange('groupId', e.target.value);
                if (g) p.handleChange('groupName', g.name);
              }}
            >
              <option value="">-- Chọn nhóm --</option>
              {p.groupList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
              onClick={() => p.openQuickAdd('group')}
            >
              <Icon name="add" size={18} />
            </button>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Thương hiệu</span>
          <div className="mt-1 flex gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.brandId}
              onChange={(e) => {
                const b = p.brandList.find((x) => x.id === e.target.value);
                p.handleChange('brandId', e.target.value);
                if (b) p.handleChange('brandName', b.name);
              }}
            >
              <option value="">-- Chọn thương hiệu --</option>
              {p.brandList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
              onClick={() => p.openQuickAdd('brand')}
            >
              <Icon name="add" size={18} />
            </button>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Mã SKU</span>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.sku}
              onChange={(e) => p.handleChange('sku', e.target.value)}
              placeholder="Hệ thống tự sinh khi bỏ trống"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Mã vạch (Barcode)</span>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.barcode}
              onChange={(e) => p.handleChange('barcode', e.target.value)}
              placeholder="Hệ thống tự sinh khi bỏ trống"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Giá mua</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-right text-sm outline-none focus:border-primary"
              value={p.form.purchasePrice || ''}
              min={0}
              onChange={(e) => p.handleChange('purchasePrice', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Thuế suất GTGT</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.taxRate}
              onChange={(e) => p.handleChange('taxRate', e.target.value)}
            >
              {TAX_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Giá bán (Trước thuế)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-right text-sm outline-none focus:border-primary"
              value={p.form.salePriceBeforeTax || ''}
              min={0}
              onChange={(e) => p.handleChange('salePriceBeforeTax', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Giá bán (Sau thuế)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-right text-sm outline-none"
              value={p.form.salePriceAfterTax || ''}
              readOnly
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Đơn vị tính cơ bản</span>
          <div className="mt-1 flex gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
              value={p.form.unit}
              onChange={(e) => p.handleChange('unit', e.target.value)}
            >
              {p.unitList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
              onClick={() => p.openQuickAdd('unit')}
            >
              <Icon name="add" size={18} />
            </button>
          </div>
        </label>
      </div>

      {/* Cột phải - Thông tin nhập kho */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Thông tin nhập kho
        </h3>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Số lượng nhập</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-right text-sm outline-none focus:border-primary"
            value={p.form.importQuantity || ''}
            min={0}
            onChange={(e) => p.handleChange('importQuantity', e.target.value)}
          />
        </label>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="text-sm font-semibold text-slate-700">Quản lý hàng hóa theo</span>
          <div className="mt-3 space-y-2.5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                checked={p.form.manageByLot}
                onChange={(e) => p.handleChange('manageByLot', e.target.checked)}
              />
              <span className="text-sm text-slate-600">Lô / Hạn sử dụng</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                checked={p.form.manageBySerial}
                onChange={(e) => p.handleChange('manageBySerial', e.target.checked)}
              />
              <span className="text-sm text-slate-600">Serial / IMEI</span>
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <span className="text-sm font-semibold text-slate-700">Nhà cung cấp mặc định</span>
          <div className="mt-2 max-h-[160px] space-y-1 overflow-y-auto">
            {MOCK_SUPPLIERS.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-primary"
                  checked={p.supplierIds.includes(s.id)}
                  onChange={() => p.toggleSupplier(s.id)}
                />
                <span className="text-sm text-slate-600">{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Đơn vị tính + quy đổi */}
    <UnitConversionSection p={p} />

    {/* Ảnh sản phẩm */}
    <div className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h4 className="text-sm font-bold uppercase text-slate-500">Ảnh sản phẩm</h4>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {p.images.map((img) => (
            <div
              key={img.id}
              className={`group relative h-24 w-24 overflow-hidden rounded-lg border-2 ${img.isMain ? 'border-primary' : 'border-slate-200'}`}
            >
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white opacity-0 hover:bg-red-500 group-hover:opacity-100"
                onClick={() => p.handleRemoveImage(img.id)}
              >
                <Icon name="close" size={12} />
              </button>
              {!img.isMain && (
                <button
                  type="button"
                  className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] text-white opacity-0 group-hover:opacity-100"
                  onClick={() => p.handleSetMainImage(img.id)}
                >
                  Đặt ảnh chính
                </button>
              )}
              {img.isMain && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary py-0.5 text-center text-[9px] font-semibold text-white">
                  Ảnh chính
                </span>
              )}
            </div>
          ))}
          {p.images.length < 10 && (
            <button
              type="button"
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary"
              onClick={() => p.fileInputRef.current?.click()}
            >
              <Icon name="image" size={22} />
              <span className="text-[10px] font-semibold">Thêm hình ảnh</span>
              <span className="text-[9px] text-slate-400">({p.images.length}/10)</span>
            </button>
          )}
        </div>
        <input
          ref={p.fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files.length) {
              p.handleImagesChange(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <p className="mt-2 text-xs text-slate-400">
          Hỗ trợ jpg, jpeg, png, gif - Tối đa 2MB/ảnh, 10 ảnh
        </p>
      </div>
    </div>

    {/* Hiển thị trên POS */}
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        checked={p.form.showInPos}
        onChange={(e) => p.handleChange('showInPos', e.target.checked)}
      />
      <span className="text-sm font-semibold text-slate-700">Hiển thị trên màn hình bán hàng</span>
    </label>

    {/* Thuộc tính sản phẩm */}
    <div className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h4 className="text-sm font-bold uppercase text-slate-500">Thuộc tính</h4>
      </div>
      <div className="p-4">
        <p className="mb-4 text-[13px] text-slate-500">
          Thêm đặc điểm như hương vị, dung tích, màu sắc
        </p>
        <div className="space-y-3">
          {p.attributes.map((attr) => (
            <div
              key={attr.id}
              className="grid items-center"
              style={{ gridTemplateColumns: '230px 1fr 52px', gap: '12px' }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.setOpenDropdownId(p.openDropdownId === attr.id ? null : attr.id);
                  }}
                  className={`flex h-11 w-full items-center justify-between rounded-[10px] border bg-white px-4 text-left text-sm ${p.openDropdownId === attr.id ? 'border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-slate-300'}`}
                >
                  <span className={`truncate ${attr.name ? 'text-slate-800' : 'text-slate-500'}`}>
                    {attr.name || 'Chọn thuộc tính'}
                  </span>
                  <Icon name="expand_more" size={16} className="text-slate-500" />
                </button>
                {p.openDropdownId === attr.id && (
                  <div
                    className="absolute bottom-full left-0 z-50 mb-1 w-full rounded-lg bg-white shadow-lg"
                    style={{ padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  >
                    {p.availableAttributes.map((item, aidx) => (
                      <div
                        key={item + aidx}
                        onClick={() => {
                          p.updateAttr(attr.id, 'name', item);
                          p.setOpenDropdownId(null);
                        }}
                        className={`flex h-10 cursor-pointer items-center justify-between px-4 text-sm ${attr.name === item ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100'}`}
                      >
                        <span className="flex-1">{item}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            p.setEditAttrIndex(aidx);
                            p.setEditAttrValue(item);
                            p.setEditAttrModalOpen(true);
                            p.setOpenDropdownId(null);
                          }}
                          className="ml-2 text-slate-400 hover:text-slate-600"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        p.setEditingAttrId(attr.id);
                        p.setNewAttrName('');
                        p.setCreateAttrModalOpen(true);
                        p.setOpenDropdownId(null);
                      }}
                      className="flex h-10 cursor-pointer items-center px-4 text-sm hover:bg-slate-100"
                    >
                      <span className="font-medium text-primary">+ Tạo thuộc tính mới</span>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Nhập giá trị thuộc tính"
                value={attr.value || ''}
                onChange={(e) => p.updateAttr(attr.id, 'value', e.target.value)}
                className="h-11 rounded-[10px] bg-slate-100 px-4 text-sm placeholder-slate-400 focus:border focus:border-primary focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => p.removeAttr(attr.id)}
                className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-300 bg-white text-slate-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="delete" size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={p.addAttrRow}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Icon name="add" size={16} />
            <span>Thêm thuộc tính</span>
          </button>
        </div>
      </div>
    </div>

    {/* Quản lý mã vạch theo đơn vị tính */}
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        checked={p.form.manageBarcodeByUnit}
        onChange={(e) => p.handleChange('manageBarcodeByUnit', e.target.checked)}
      />
      <span className="text-sm font-semibold text-slate-700">
        Quản lý mã vạch theo từng đơn vị tính
      </span>
    </label>
  </div>
);

export default ProductBasicTab;
