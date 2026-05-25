/**
 * Trang Quản lý Hàng hóa - Container: kết nối useProductList (API) + useProductFilters (bộ lọc),
 * lắp ghép ProductFilterSidebar + ProductTable + EditProductModal + HubOverlay.
 */
import { useState, useEffect, useMemo } from 'react';
import MaterialIcon from '../components/shared/MaterialIcon';
import EditProductModal from '../components/product/EditProductModal';
import ProductFilterSidebar from '../components/product/ProductFilterSidebar';
import ProductTable from '../components/product/ProductTable';
import HubOverlay from '../components/home/HubOverlay';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProductList } from '../hooks/useProductList';
import { topTabs, hubConfigs } from '../data/inventoryPageData';

export const ProductManagement = () => {
  const [activeHubKey, setActiveHubKey] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [expandedId, setExpandedId] = useState('SP34405804');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const { products, apiStatus, handleSaveProduct, handleDeleteProduct } = useProductList();
  const filters = useProductFilters(products);

  const isHubOpen = Boolean(activeHubKey);
  const activeHubConfig = hubConfigs[activeHubKey] || hubConfigs.inventory;

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isHubOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [isHubOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (filters.estimatedRef.current && !filters.estimatedRef.current.contains(e.target)) {
        filters.setEstimatedQuickOpen(false);
        filters.setEstimatedCustomOpen(false);
      }
      if (filters.createdRef.current && !filters.createdRef.current.contains(e.target)) {
        filters.setCreatedQuickOpen(false);
        filters.setCreatedCustomOpen(false);
      }
      if (
        filters.statusDropdownRef.current &&
        !filters.statusDropdownRef.current.contains(e.target)
      ) {
        filters.setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [filters]);

  const displayedRows = useMemo(() => {
    const start = (filters.currentPage - 1) * filters.pageSize;
    return filters.filteredRows.slice(start, start + filters.pageSize);
  }, [filters.filteredRows, filters.currentPage, filters.pageSize]);

  const totalPages = Math.ceil(filters.filteredRows.length / filters.pageSize);
  const startRowNum =
    filters.filteredRows.length === 0 ? 0 : (filters.currentPage - 1) * filters.pageSize + 1;
  const endRowNum = Math.min(filters.currentPage * filters.pageSize, filters.filteredRows.length);

  useEffect(() => {
    if (totalPages === 0) filters.setCurrentPage(1);
    else if (filters.currentPage > totalPages) filters.setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, filters.currentPage, filters.setCurrentPage]);

  const handleHubSelect = (action) => {
    if (action.path) {
      window.history.pushState({}, '', action.path);
      window.dispatchEvent(new Event('popstate'));
    }
    setActiveHubKey(null);
  };

  const handleSave = (updated) => {
    handleSaveProduct(updated, productToEdit, () => {
      filters.setCurrentPage(1);
      setEditModalOpen(false);
      setProductToEdit(null);
    });
  };

  return (
    <div className="-mt-8 min-h-[calc(100vh-64px)] overflow-x-hidden bg-[#faf9fc]">
      <HubOverlay
        isOpen={isHubOpen}
        config={activeHubConfig}
        onClose={() => setActiveHubKey(null)}
        onSelect={handleHubSelect}
      />

      <div className="flex h-12 items-center bg-[#faf9fc]">
        <nav className="no-scrollbar flex h-10 w-full items-center gap-8 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          {topTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`group relative flex h-full items-center gap-2 px-2 transition-colors ${activeTab === tab.key ? 'font-semibold text-primary' : 'text-slate-600 hover:text-primary'}`}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveHubKey(tab.key);
              }}
            >
              <MaterialIcon name={tab.icon} className="text-[20px]" />
              <span className="whitespace-nowrap text-sm font-medium">{tab.label}</span>
              <span
                className={`absolute bottom-0 left-2 right-2 h-0.5 bg-primary transition-transform duration-200 ${activeTab === tab.key ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
              />
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1600px] px-6 pt-3">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${apiStatus.error ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
        >
          {apiStatus.loading
            ? 'Đang đồng bộ dữ liệu API...'
            : apiStatus.error || 'Đã đồng bộ dữ liệu sản phẩm từ API'}
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1600px] gap-6 px-6 pb-6 pt-4">
        <ProductFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filters}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex max-w-lg flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <MaterialIcon name="search" className="mr-2 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm focus:ring-0"
                placeholder="Theo mã, tên hàng"
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
              />
              <MaterialIcon name="tune" className="ml-2 cursor-pointer text-slate-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                onClick={() => {
                  setProductToEdit(null);
                  setEditModalOpen(true);
                }}
              >
                <MaterialIcon name="add" className="text-sm" />
                <span>Tạo mới</span>
                <MaterialIcon name="keyboard_arrow_down" className="text-sm" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <MaterialIcon name="upload_file" className="text-sm" />
                <span>Import file</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <MaterialIcon name="download" className="text-sm" />
                <span>Xuất file</span>
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <ProductTable
                rows={displayedRows}
                sortConfig={filters.sortConfig}
                getSortIcon={filters.getSortIcon}
                onToggleSort={filters.toggleSort}
                expandedId={expandedId}
                onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? '' : id))}
                onEdit={(row) => {
                  setProductToEdit(row);
                  setEditModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={filters.pageSize}
                    onChange={(e) => filters.handlePageSizeChange(Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value={15}>15 dòng</option>
                    <option value={30}>30 dòng</option>
                    <option value={50}>50 dòng</option>
                  </select>
                </div>
                <span>{`${startRowNum} - ${endRowNum} trong ${filters.filteredRows.length} hàng hóa`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={filters.currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MaterialIcon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {totalPages === 0 ? 1 : filters.currentPage} /{' '}
                  {totalPages === 0 ? 1 : totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={filters.currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MaterialIcon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <EditProductModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setProductToEdit(null);
          }}
          product={productToEdit}
          onSave={handleSave}
          title={productToEdit ? 'Sửa hàng hóa' : 'Thêm hàng hóa'}
        />
      )}
    </div>
  );
};

export default ProductManagement;
