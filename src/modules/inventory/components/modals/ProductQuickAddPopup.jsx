/**
 * ProductQuickAddPopup - Popup Thêm mới Hàng hóa nhanh từ phiếu nhập kho.
 */
import { useEffect, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import { useProductQuickAdd } from '../../hooks/useProductQuickAdd';
import ProductBasicTab from './quickadd/ProductBasicTab';
import ProductExtraTab from './quickadd/ProductExtraTab';
import ProductWarehouseTab from './quickadd/ProductWarehouseTab';

const TABS = [
  { key: 'basic', label: 'Thông tin cơ bản' },
  { key: 'extra', label: 'Thông tin bổ sung' },
  { key: 'warehouse', label: 'Thông tin kho' },
];

const ProductQuickAddPopup = ({ isOpen, onClose, onSave }) => {
  const overlayRef = useRef(null);
  const p = useProductQuickAdd(onSave);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto py-4">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose?.();
        }}
      />
      <div className="relative z-10 flex max-h-[95vh] w-full max-w-[1300px] flex-col rounded-xl bg-white shadow-2xl dark:bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b-2 border-slate-200 px-6 py-4 dark:border-[#333333]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">Thêm mới hàng hóa</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            onClick={onClose}
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-0 border-b border-slate-200 bg-slate-50 px-6 dark:border-[#333333] dark:bg-[#1a1a1a]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${p.activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-[#999999] dark:hover:text-[#b3b3b3]'}`}
              onClick={() => p.setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {p.activeTab === 'basic' && <ProductBasicTab p={p} />}
          {p.activeTab === 'extra' && <ProductExtraTab p={p} />}
          {p.activeTab === 'warehouse' && <ProductWarehouseTab p={p} />}
        </div>

        {/* Modals */}
        {p.addConversionUnitModal && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => {
                p.setAddConversionUnitModal(false);
                p.setNewConversionUnit({
                  name: '',
                  convertValue: '',
                  convertFrom: '',
                  directSale: false,
                });
              }}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">Thêm đơn vị quy đổi</h3>
                <button
                  onClick={() => {
                    p.setAddConversionUnitModal(false);
                    p.setNewConversionUnit({
                      name: '',
                      convertValue: '',
                      convertFrom: '',
                      directSale: false,
                    });
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm text-slate-700">Tên đơn vị</label>
                  <input
                    type="text"
                    value={p.newConversionUnit.name}
                    onChange={(e) =>
                      p.setNewConversionUnit({ ...p.newConversionUnit, name: e.target.value })
                    }
                    placeholder="Ví dụ: lốc, thùng"
                    className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-900">Công thức quy đổi:</div>
                  <div className="mt-2 text-base">
                    <span className="font-semibold">
                      1 {p.newConversionUnit.name || '[tên đơn vị]'}
                    </span>
                    <span className="mx-2">=</span>
                    <span className="font-semibold">{p.newConversionUnit.convertValue || '?'}</span>
                    <span className="ml-2">
                      {p.newConversionUnit.convertFrom || '[đơn vị gốc]'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-700">Giá trị quy đổi</label>
                    <input
                      type="number"
                      value={p.newConversionUnit.convertValue}
                      onChange={(e) =>
                        p.setNewConversionUnit({
                          ...p.newConversionUnit,
                          convertValue: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: 4, 20"
                      min="1"
                      className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-700">Đơn vị quy đổi từ</label>
                    <select
                      value={p.newConversionUnit.convertFrom}
                      onChange={(e) =>
                        p.setNewConversionUnit({
                          ...p.newConversionUnit,
                          convertFrom: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">Chọn đơn vị</option>
                      {p.baseUnit.name && (
                        <option value={p.baseUnit.name}>{p.baseUnit.name}</option>
                      )}
                      {p.conversionUnits.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-700">Giá bán (tự tính)</label>
                  <div className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-right text-sm text-slate-700">
                    {(() => {
                      const base = Number(p.baseUnit.price) || 0;
                      const cv = Number(p.newConversionUnit.convertValue) || 0;
                      const from = p.newConversionUnit.convertFrom;
                      const unitsByName = p.conversionUnits.reduce((acc, u) => {
                        acc[u.name] = u;
                        return acc;
                      }, {});
                      const computeP = (uName, visited = new Set()) => {
                        if (!uName || visited.has(uName)) return null;
                        if (uName === p.baseUnit.name) return 1;
                        const u = unitsByName[uName];
                        if (!u) return null;
                        visited.add(uName);
                        if (u.convertFrom === p.baseUnit.name) return u.convertValue;
                        const pm = computeP(u.convertFrom, visited);
                        return pm == null ? null : u.convertValue * pm;
                      };
                      const pm = from === p.baseUnit.name ? 1 : computeP(from);
                      const previewPrice = pm && base && cv ? base * cv * pm : 0;
                      return previewPrice ? p.formatMoney(previewPrice) : '-';
                    })()}
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary"
                    checked={p.newConversionUnit.directSale}
                    onChange={(e) =>
                      p.setNewConversionUnit({
                        ...p.newConversionUnit,
                        directSale: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm text-slate-700">Cho phép bán đơn vị này</span>
                </label>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    p.setAddConversionUnitModal(false);
                    p.setNewConversionUnit({
                      name: '',
                      convertValue: '',
                      convertFrom: '',
                      directSale: false,
                    });
                  }}
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={p.addConversionUnit}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {p.createAttrModalOpen && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => {
                p.setCreateAttrModalOpen(false);
                p.setEditingAttrId(null);
              }}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900">Tạo thuộc tính mới</h3>
              <p className="mt-1 text-sm text-slate-500">Nhập tên thuộc tính</p>
              <input
                type="text"
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                value={p.newAttrName}
                onChange={(e) => p.setNewAttrName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') p.handleCreateAttribute();
                }}
                placeholder="VD: Màu sắc, Dung tích..."
                autoFocus
              />
              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    p.setCreateAttrModalOpen(false);
                    p.setEditingAttrId(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={p.handleCreateAttribute}
                >
                  Tạo
                </button>
              </div>
            </div>
          </div>
        )}

        {p.editAttrModalOpen && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => p.setEditAttrModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900">Sửa thuộc tính</h3>
              <p className="mt-1 text-sm text-slate-500">Đổi tên thuộc tính hoặc xóa</p>
              <input
                type="text"
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                value={p.editAttrValue}
                onChange={(e) => p.setEditAttrValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') p.handleEditAttribute();
                }}
                autoFocus
              />
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="text-sm font-semibold text-red-500 hover:text-red-700"
                  onClick={() => p.handleDeleteAttribute(p.editAttrIndex)}
                >
                  Xóa thuộc tính
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => p.setEditAttrModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                    onClick={p.handleEditAttribute}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {p.quickAddModal.open && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => p.setQuickAddModal({ open: false, type: '', name: '' })}
            />
            <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900">
                {p.quickAddModal.type === 'group'
                  ? 'Thêm nhóm hàng hóa'
                  : p.quickAddModal.type === 'brand'
                    ? 'Thêm thương hiệu'
                    : 'Thêm đơn vị tính'}
              </h3>
              <input
                type="text"
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                value={p.quickAddModal.name}
                onChange={(e) => p.setQuickAddModal({ ...p.quickAddModal, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') p.handleQuickAdd();
                }}
                placeholder="Nhập tên..."
                autoFocus
              />
              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => p.setQuickAddModal({ open: false, type: '', name: '' })}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                  onClick={p.handleQuickAdd}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between rounded-b-xl border-t-2 border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={() => {
                p.handleSave('draft');
              }}
              disabled={p.saving}
            >
              Lưu nháp
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={() => p.handleSave('addNew')}
              disabled={p.saving}
            >
              Lưu và thêm mới
            </button>
            <button
              type="button"
              className="rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-blue-50"
              onClick={() => p.handleSave('duplicate')}
              disabled={p.saving}
            >
              Lưu và nhân bản
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003566] disabled:opacity-50"
              onClick={() => p.handleSave('save')}
              disabled={p.saving}
            >
              {p.saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickAddPopup;
