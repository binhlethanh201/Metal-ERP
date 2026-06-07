/**
 * AddToWarehouseModal - Popup thêm nhanh sản phẩm vào kho.
 * Step 1: chọn SP. Step 2: lưu nháp hoặc chuyển sang hàng hóa chỉnh sửa.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';

const AddToWarehouseModal = ({ isOpen, onClose, products = [] }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const allChecked = products.length > 0 && selected.length === products.length;

  useEffect(() => {
    if (isOpen && products.length > 0) {
      setSelected([...products]);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const toggleAll = () => {
    if (allChecked) {
      setSelected([]);
    } else {
      setSelected([...products]);
    }
  };

  const toggleProduct = (product) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  };

  const saveDraftsToLocalStorage = () => {
    const existing = JSON.parse(localStorage.getItem('draftProducts') || '[]');
    const now = new Date();
    const drafts = selected.map((p) => {
      const allImages = [...(p.images || []), ...(p.detailImages || [])];
      if (p.image && !allImages.includes(p.image)) allImages.unshift(p.image);
      const specs = p.specs || [];
      const attributes =
        specs.length > 0
          ? specs.map((s, i) => ({ id: `attr-${Date.now()}-${i}`, name: s.name, value: s.value }))
          : [];
      return {
        id: `SP-DRAFT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: p.title || p.name,
        unit: p.unit || 'Cái',
        brand: p.brand || '',
        salePrice: '',
        costPrice: '',
        stock: '',
        location: p.location || p.nguonKho || '',
        status: 'Sẵn hàng',
        statusTone: 'green',
        createdAt: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        group: p.danhMuc || p.group || '',
        barcode: p.barcode || '',
        stockLevel: p.stockLevel || '',
        weight: p.weight || '',
        dimension: p.dimension || '',
        supplier: p.supplier || '',
        itemType: p.itemType || 'Hàng hóa thường',
        directSale: false,
        salesChannelLinked: false,
        productStatus: 'draft',
        estimatedOutAt: '',
        images: allImages.slice(0, 10),
        attributes,
        specDetail: '',
        description: p.description || '',
        tags: p.tags || [],
        specifications: specs,
      };
    });
    localStorage.setItem('draftProducts', JSON.stringify([...drafts, ...existing].slice(0, 50)));
  };

  const handleSaveDraft = () => {
    saveDraftsToLocalStorage();
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setStep(1);
      setSelected([]);
      onClose();
    }, 1200);
  };

  const handleGoToInventory = () => {
    saveDraftsToLocalStorage();
    onClose();
    setStep(1);
    setSelected([]);
    setDone(false);
    navigate('/inventory/products?status=draft');
  };

  const handleClose = () => {
    setStep(1);
    setSelected([]);
    setDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            {done
              ? 'Đã lưu nháp!'
              : step === 1
                ? 'Chọn sản phẩm thêm vào kho'
                : 'Xác nhận thêm vào kho'}
          </h3>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Icon name="check_circle" size={36} className="text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">
              Đã lưu {selected.length} sản phẩm vào kho
            </p>
            <p className="text-sm text-slate-500">
              Sản phẩm đã được lưu nháp. Có thể kiểm tra trong Quản lý kho.
            </p>
          </div>
        ) : step === 1 ? (
          <>
            {products.length > 1 && (
              <label className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-[#004785] focus:ring-[#004785]"
                />
                Chọn tất cả ({products.length} sản phẩm)
              </label>
            )}
            <div className="max-h-72 overflow-y-auto">
              {products.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-400">
                  Không có sản phẩm nào
                </p>
              ) : (
                products.map((product) => {
                  const isChecked = !!selected.find((p) => p.id === product.id);
                  const name = product.title || product.name;
                  const price =
                    product.giaBanSi ||
                    product.price ||
                    product.priceRange ||
                    product.salePrice ||
                    product.referencePrice ||
                    '';
                  const img = product.image;
                  return (
                    <label
                      key={product.id}
                      className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 ${isChecked ? 'bg-blue-50/30' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(product)}
                        className="h-4 w-4 rounded border-slate-300 text-[#004785] focus:ring-[#004785]"
                      />
                      {img && (
                        <img
                          alt={name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          src={img}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700">{name}</p>
                        {price && <p className="text-xs text-[#004785]">{price}</p>}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <span className="text-xs text-slate-500">{selected.length} sản phẩm được chọn</span>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selected.length === 0}
                className="rounded-xl bg-[#004785] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiếp tục
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 px-5 py-6">
              <p className="text-sm text-slate-600">
                Đã chọn <span className="font-bold text-slate-800">{selected.length} sản phẩm</span>{' '}
                để thêm vào kho.
              </p>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100">
                {selected.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 border-b border-slate-50 px-4 py-2.5 text-sm text-slate-700 last:border-b-0"
                  >
                    <Icon name="check_circle" size={14} className="text-emerald-500" />
                    <span className="truncate">{p.title || p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
              >
                Lưu nháp vào kho
              </button>
              <button
                type="button"
                onClick={handleGoToInventory}
                className="flex-1 rounded-xl bg-[#004785] py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Chỉnh sửa trong hàng hóa
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToWarehouseModal;
