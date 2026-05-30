/**
 * ProductDrawer - Drawer trượt từ phải sang để Thêm mới / Sửa hàng hóa.
 * 4 Tabs: Thông tin chung | Đơn vị chuyển đổi | Thiết lập định mức | Mô tả
 */
import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const TABS = [
  { key: 'info', label: 'Thông tin chung' },
  { key: 'convert', label: 'Đơn vị chuyển đổi' },
  { key: 'limit', label: 'Thiết lập định mức' },
  { key: 'desc', label: 'Mô tả' },
];

const ProductDrawer = ({ isOpen, onClose, product, onSave }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [isActive, setIsActive] = useState(true);
  const [form, setForm] = useState({
    code: '',
    name: '',
    group: '',
    unit: 'Cái',
    costPrice: '',
    salePrice: '',
    barcode: '',
    weight: '',
    volume: '',
    vat: '0',
    minStock: '',
    maxStock: '',
    defaultLocation: '',
    description: '',
    conversions: [],
    images: [],
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        code: product.productCode || product.code || '',
        name: product.name || product.productName || '',
        group: product.group || '',
        unit: product.unit || 'Cái',
        costPrice: product.costPrice || product.importPrice || '',
        salePrice: product.salePrice || product.price || '',
        barcode: product.barcode || '',
        weight: product.weight || '',
        volume: product.volume || '',
        vat: product.vat || '0',
        minStock: product.minStock || '',
        maxStock: product.maxStock || '',
        defaultLocation: product.defaultLocation || '',
        description: product.description || '',
        conversions: product.conversions || [],
        images: product.images || [],
      });
    } else {
      setForm({
        code: '',
        name: '',
        group: '',
        unit: 'Cái',
        costPrice: '',
        salePrice: '',
        barcode: '',
        weight: '',
        volume: '',
        vat: '0',
        minStock: '',
        maxStock: '',
        defaultLocation: '',
        description: '',
        conversions: [],
        images: [],
      });
    }
    setActiveTab('info');
    setIsActive(true);
    setIsDirty(false);
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setIsDirty(true);
  };

  const handleAddConversion = () => {
    setForm((p) => ({
      ...p,
      conversions: [
        ...p.conversions,
        { id: Date.now(), unit: '', rate: 1, salePrice: '', costPrice: '', barcode: '' },
      ],
    }));
    setIsDirty(true);
  };

  const handleConversionChange = (id, field, value) => {
    setForm((p) => ({
      ...p,
      conversions: p.conversions.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
    setIsDirty(true);
  };

  const handleRemoveConversion = (id) => {
    setForm((p) => ({ ...p, conversions: p.conversions.filter((c) => c.id !== id) }));
    setIsDirty(true);
  };

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm('Dữ liệu chưa được lưu. Bạn có chắc chắn muốn thoát?')) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên hàng hóa');
      return;
    }
    onSave(form);
    setIsDirty(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="animate-slide-in-right relative z-10 flex h-full w-[65%] min-w-[700px] max-w-[900px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {product ? 'Sửa hàng hóa' : 'Thêm mới hàng hóa'}
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-sm text-slate-600">Đang kinh doanh</span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                />
              </button>
            </label>
            <button
              type="button"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              onClick={handleClose}
            >
              <Icon name="close" size={22} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Tab 1: Thông tin chung */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-blue-400 hover:text-blue-500">
                  <Icon name="image" size={32} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ảnh đại diện</p>
                  <p className="text-xs text-slate-400">Kéo thả hoặc click để tải lên</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Mã hàng hóa
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Bỏ trống hệ thống tự sinh"
                    value={form.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Tên hàng hóa <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Nhập tên hàng hóa"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Nhóm hàng hóa
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.group}
                    onChange={(e) => handleChange('group', e.target.value)}
                  >
                    <option value="">-- Chọn nhóm --</option>
                    <option value="Nguyên vật liệu">Nguyên vật liệu</option>
                    <option value="Thành phẩm">Thành phẩm</option>
                    <option value="Hàng hóa">Hàng hóa</option>
                    <option value="Dịch vụ">Dịch vụ</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Đơn vị tính <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      value={form.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
                    >
                      <option>Cái</option>
                      <option>Hộp</option>
                      <option>Chiếc</option>
                      <option>Kg</option>
                      <option>Thùng</option>
                      <option>Lon</option>
                      <option>Cây</option>
                      <option>Cuộn</option>
                    </select>
                    <button
                      type="button"
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Giá vốn
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Giá bán
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.salePrice}
                    onChange={(e) => handleChange('salePrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Mã vạch
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Thuế suất VAT
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.vat}
                    onChange={(e) => handleChange('vat', e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Trọng lượng (g)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Thể tích
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.volume}
                    onChange={(e) => handleChange('volume', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Đơn vị chuyển đổi */}
          {activeTab === 'convert' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Thiết lập tỷ lệ quy đổi giữa các đơn vị tính (VD: 1 Thùng = 24 Lon)
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">
                        Đơn vị chuyển đổi
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-500">
                        Tỷ lệ quy đổi
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-bold uppercase text-slate-500">
                        Giá bán
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-bold uppercase text-slate-500">
                        Giá vốn
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-500">
                        Mã vạch
                      </th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.conversions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                          Chưa có đơn vị chuyển đổi
                        </td>
                      </tr>
                    ) : (
                      form.conversions.map((c) => (
                        <tr key={c.id}>
                          <td className="px-3 py-2">
                            <select
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                              value={c.unit}
                              onChange={(e) => handleConversionChange(c.id, 'unit', e.target.value)}
                            >
                              <option value="">-- Chọn --</option>
                              <option>Thùng</option>
                              <option>Hộp</option>
                              <option>Lon</option>
                              <option>Kg</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">1 {form.unit} =</span>
                              <input
                                type="number"
                                className="w-20 rounded border border-slate-200 px-2 py-1.5 text-center text-sm outline-none focus:border-blue-400"
                                value={c.rate}
                                onChange={(e) =>
                                  handleConversionChange(c.id, 'rate', e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-400"
                              value={c.salePrice}
                              onChange={(e) =>
                                handleConversionChange(c.id, 'salePrice', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-sm outline-none focus:border-blue-400"
                              value={c.costPrice}
                              onChange={(e) =>
                                handleConversionChange(c.id, 'costPrice', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                              value={c.barcode}
                              onChange={(e) =>
                                handleConversionChange(c.id, 'barcode', e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              className="rounded p-1 text-slate-400 hover:text-red-500"
                              onClick={() => handleRemoveConversion(c.id)}
                            >
                              <Icon name="delete" size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                onClick={handleAddConversion}
              >
                <Icon name="add" size={16} /> Thêm đơn vị chuyển đổi
              </button>
            </div>
          )}

          {/* Tab 3: Thiết lập định mức */}
          {activeTab === 'limit' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-500">
                Cấu hình định mức tồn kho để hệ thống tự động cảnh báo
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Tồn kho tối thiểu
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.minStock}
                    onChange={(e) => handleChange('minStock', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Tồn kho tối đa
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.maxStock}
                    onChange={(e) => handleChange('maxStock', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Vị trí lưu kho mặc định
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={form.defaultLocation}
                    onChange={(e) => handleChange('defaultLocation', e.target.value)}
                  >
                    <option value="">-- Chọn vị trí --</option>
                    <option>Khu A - Kệ 1</option>
                    <option>Khu A - Kệ 2</option>
                    <option>Khu B - Kệ 1</option>
                    <option>Kho Trung Chuyển</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Mô tả */}
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Mô tả chi tiết sản phẩm</p>
              <div className="mb-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
                {['B', 'I', 'U', 'list', 'link', 'image'].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    className="rounded p-1.5 text-slate-600 hover:bg-slate-200"
                  >
                    <span className="text-xs font-bold">
                      {btn === 'B' ? (
                        <b>B</b>
                      ) : btn === 'I' ? (
                        <i>I</i>
                      ) : btn === 'U' ? (
                        <u>U</u>
                      ) : btn === 'list' ? (
                        '≡'
                      ) : btn === 'link' ? (
                        '🔗'
                      ) : (
                        '🖼'
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <textarea
                className="min-h-[200px] w-full rounded-lg border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                placeholder="Nhập mô tả sản phẩm..."
                value={form.description}
                onChange={(e) => handleChange('desc', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer (Sticky) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <span className="text-xs text-slate-400">Nhấn Ctrl+S để lưu nhanh</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#004785] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003566] active:scale-95"
              onClick={handleSave}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDrawer;
