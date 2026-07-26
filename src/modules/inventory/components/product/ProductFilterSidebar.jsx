import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getCategories, getBrands } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';

export const ProductFilterSidebar = ({ isCollapsed, onToggleCollapse, filters }) => {
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

  // Tải danh sách nhóm hàng & thương hiệu từ API
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

  // Tải danh sách nhà cung cấp từ API — hiển thị tên, gửi GUID (id) lên server
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
        // API suppliers chưa sẵn sàng — im lặng, không hiện lỗi
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
    <>
      {/* Nút mở sidebar khi đã thu gọn */}
      <button
        type="button"
        className={`fixed left-[260px] top-[148px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all duration-300 hover:scale-110 ${isCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => onToggleCollapse(false)}
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>

      <aside
        className={`relative shrink-0 space-y-5 self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-[#333333] dark:bg-[#1a1a1a] ${isCollapsed ? '-ml-[280px] w-[280px] -translate-x-5 opacity-0' : 'w-[280px]'}`}
      >
        {/* Nút thu gọn sidebar */}
        <button
          type="button"
          className="absolute -right-3.5 top-24 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-500 shadow-md transition-all hover:scale-110"
          onClick={() => onToggleCollapse(true)}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>

        {/* Header bộ lọc */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#333333]">
          <h3 className="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-[#b3b3b3]">Bộ lọc</h3>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
            onClick={handleReset}
            title="Đặt lại tất cả bộ lọc"
          >
            <Icon name="cached" size={16} />
          </button>
        </div>

        {/* Trạng thái hàng hóa — mặc định "Tất cả" */}
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-[#b3b3b3]">
            Trạng thái hàng hóa
          </p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            value={productStatusFilter}
            onChange={(e) => setProductStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        {/* Nhóm hàng — dùng select từ API, đảm bảo gửi đúng tên (API lọc equals) */}
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-[#b3b3b3]">Nhóm hàng</p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none disabled:opacity-60 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
          {loadingMeta && <p className="text-[11px] text-slate-400 dark:text-[#808080]">Đang tải...</p>}
        </div>

        {/* Thương hiệu — dùng select từ API */}
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-[#b3b3b3]">Thương hiệu</p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none disabled:opacity-60 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
        </div>

        {/* Nhà cung cấp — hiển thị tên, gửi GUID (supplierId) lên API */}
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-tight text-slate-700 dark:text-[#b3b3b3]">Nhà cung cấp</p>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none disabled:opacity-60 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
            <p className="text-[11px] text-slate-400 dark:text-[#808080]">Đang tải danh sách nhà cung cấp...</p>
          )}
          {!loadingSuppliers && supplierOptions.length === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-[#808080]">
              Chưa có nhà cung cấp nào hoặc API chưa sẵn sàng.
            </p>
          )}
        </div>
      </aside>
    </>
  );
};

export default ProductFilterSidebar;
