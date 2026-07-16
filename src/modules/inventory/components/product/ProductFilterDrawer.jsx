import { useState, useEffect } from 'react';
import Drawer from '../../../../shared/components/Drawer';
import Button from '../../../../shared/components/Button';
import { getCategories, getBrands } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';

// Style select đồng bộ với input trong Input.jsx (border-slate-200, focus:border-[#004785])
const selectClass =
  'w-full min-w-0 max-w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 truncate';

const FilterField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

export const ProductFilterDrawer = ({ isOpen, onClose, filters }) => {
  const {
    groupKeyword,
    setGroupKeyword,
    brandKeyword,
    setBrandKeyword,
    supplierKeyword,
    setSupplierKeyword,
    productStatusFilter,
    setProductStatusFilter,
  } = filters;

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Tải danh sách nhóm hàng & thương hiệu từ API (chỉ tải khi drawer từng mở lần đầu)
  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
        if (!active) return;
        if (catRes?.success && Array.isArray(catRes?.data)) {
          setCategoryOptions(catRes.data.map((item) => item.name).filter(Boolean));
        }
        if (brandRes?.success && Array.isArray(brandRes?.data)) {
          setBrandOptions(brandRes.data.map((item) => item.name).filter(Boolean));
        }
      } catch (err) {
        console.error('Lỗi tải danh sách nhóm hàng/thương hiệu:', err);
      } finally {
        if (active) setLoadingMeta(false);
      }
    };
    loadMeta();
    return () => {
      active = false;
    };
  }, []);

  // Tải danh sách nhà cung cấp — hiển thị tên, gửi GUID (id) lên server
  useEffect(() => {
    let active = true;
    const loadSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const res = await getSuppliers({ pageSize: 1000, status: 'active' });
        if (!active) return;
        const items = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
        if (Array.isArray(items)) {
          setSupplierOptions(
            items.map((s) => ({ id: s.id, name: s.name })).filter((s) => s.id && s.name)
          );
        }
      } catch (err) {
        console.error('Lỗi tải danh sách nhà cung cấp:', err);
      } finally {
        if (active) setLoadingSuppliers(false);
      }
    };
    loadSuppliers();
    return () => {
      active = false;
    };
  }, []);

  const handleReset = () => {
    setGroupKeyword('');
    setBrandKeyword('');
    setSupplierKeyword('');
    setProductStatusFilter('all');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ lọc"
      widthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Áp dụng
          </Button>
        </>
      }
    >
      <div className="space-y-5 overflow-hidden">
        <FilterField label="Trạng thái hàng hóa">
          <select
            className={selectClass}
            value={productStatusFilter}
            onChange={(e) => setProductStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </FilterField>

        <FilterField label="Nhóm hàng">
          <select
            className={selectClass}
            value={groupKeyword}
            onChange={(e) => setGroupKeyword(e.target.value)}
            disabled={loadingMeta}
          >
            <option value="">-- Tất cả nhóm hàng --</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Thương hiệu">
          <select
            className={selectClass}
            value={brandKeyword || ''}
            onChange={(e) => setBrandKeyword(e.target.value)}
            disabled={loadingMeta}
          >
            <option value="">-- Tất cả thương hiệu --</option>
            {brandOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Nhà cung cấp">
          <select
            className={selectClass}
            value={supplierKeyword}
            onChange={(e) => setSupplierKeyword(e.target.value)}
            disabled={loadingSuppliers}
          >
            <option value="">-- Tất cả nhà cung cấp --</option>
            {supplierOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {loadingSuppliers && (
            <p className="text-xs text-slate-400">Đang tải danh sách nhà cung cấp...</p>
          )}
          {!loadingSuppliers && supplierOptions.length === 0 && (
            <p className="text-xs text-slate-400">
              Chưa có nhà cung cấp nào hoặc API chưa sẵn sàng.
            </p>
          )}
        </FilterField>
      </div>
    </Drawer>
  );
};

export default ProductFilterDrawer;
