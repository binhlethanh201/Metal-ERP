import { useState, useEffect, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProductList } from '../hooks/useProductList';

import { ProductFilterDrawer } from '../components/product/ProductFilterDrawer';
import { ProductTable } from '../components/product/ProductTable';
import { CategoryBrandManagerModal } from '../components/product/CategoryBrandManagerModal';
import { LocationAttributeModal } from '../components/product/LocationAttributeModal';
import { EditProductModal } from '../components/product/EditProductModal';
import { ProductImportModal } from '../components/product/ProductImportModal';

export const ProductManagement = () => {
  const [expandedId, setExpandedId] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [locationAttrModalOpen, setLocationAttrModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [initialEditTab, setInitialEditTab] = useState('info');
  const [selectedIds, setSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Đếm số filter đang thực sự áp dụng, hiện badge trên nút "Bộ lọc"
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.groupKeyword?.trim()) count += 1;
    if (filters.brandKeyword?.trim()) count += 1;
    if (filters.supplierKeyword?.trim()) count += 1;
    if (filters.productStatusFilter && filters.productStatusFilter !== 'all') count += 1;
    return count;
  }, [
    filters.groupKeyword,
    filters.brandKeyword,
    filters.supplierKeyword,
    filters.productStatusFilter,
  ]);

  const { currentPage, setCurrentPage, pageSize } = filters;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalCount = paginationMeta?.totalCount || 0;
  const startRowNum = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRowNum = Math.min(currentPage * pageSize, totalCount);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage, setCurrentPage]);

  // Tự động ẩn thông báo thành công sau 2.5s
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 2500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleSave = (updated) => {
    const isUpdate = Boolean(
      productToEdit?.id && !productToEdit.id.toString().startsWith('SP-DRAFT')
    );
    handleSaveProduct(updated, productToEdit, () => {
      filters.setCurrentPage(1);
      setEditModalOpen(false);
      setProductToEdit(null);
      refetch();
      setSuccessMsg(isUpdate ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
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
    if (isChecked) setSelectedIds(currentRows.map((row) => row.id || row.productId));
    else setSelectedIds([]);
  };

  return (
    <div className="mt-2 w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* Toast thông báo thành công */}
      {successMsg && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {successMsg}
        </div>
      )}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Hàng hóa</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-[#b3b3b3]">Quản lý kho hàng hóa</p>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
            apiStatus.error
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
              : apiStatus.loading
                ? 'border-slate-200 bg-slate-50 text-slate-600 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#b3b3b3]'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
          }`}
        >
          {apiStatus.loading
            ? 'Đang tải danh sách hàng hóa...'
            : apiStatus.error
              ? '⚠ ' + apiStatus.error
              : '✔ Đã đồng bộ dữ liệu'}
        </div>
      </div>

      {/* Error banner */}
      {apiStatus.error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{apiStatus.error}</p>
          </div>
        </div>
      )}

      {/* Không còn sidebar cố định — bảng full-width, filter mở qua Drawer */}
      <div className="flex w-full flex-col gap-4 pb-6 pt-2">
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
              <Icon name="check_circle" size={20} /> Đã chọn {selectedIds.length} hàng hóa
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-[#1a1a1a] dark:text-blue-400 dark:hover:bg-[#333333]"
                onClick={async () => {
                  if (window.confirm(`Mở bán ${selectedIds.length} sản phẩm?`)) {
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
                  if (window.confirm(`Ngừng bán ${selectedIds.length} sản phẩm?`)) {
                    const ok = await handleBulkToggleStatus(selectedIds, false);
                    if (ok) setSelectedIds([]);
                  }
                }}
              >
                <Icon name="Ban" size={18} /> Ngừng bán
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: search + Bộ lọc (mở Drawer) + các nút thao tác */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="flex flex-1 gap-3">
            <div className="flex min-w-[240px] max-w-sm flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1 dark:border-[#333333] dark:bg-[#1a1a1a]">
              <Icon name="search" className="mr-2 text-slate-400 dark:text-[#808080]" />
              <input
                className="w-full border-none bg-transparent text-sm outline-none focus:ring-0 dark:text-[#e5e5e5]"
                placeholder="Tìm theo mã, tên hàng, mã vạch..."
                value={filters.search}
                onChange={(e) => {
                  filters.setSearch(e.target.value);
                  filters.setCurrentPage(1);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="relative flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="Layers" size={16} className="text-slate-500 dark:text-[#999999]" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              onClick={() => setCategoryModalOpen(true)}
            >
              <Icon name="Bookmark" className="text-sm text-slate-500 dark:text-[#999999]" />
              Nhóm hàng & Thương hiệu
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              onClick={() => setLocationAttrModalOpen(true)}
            >
              <Icon name="location_on" className="text-sm text-slate-500 dark:text-[#999999]" />
              Vị trí & Thuộc tính
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-[#1a1a1a] dark:text-emerald-400 dark:hover:bg-[#333333]"
              onClick={() => setImportModalOpen(true)}
            >
              <Icon name="upload_file" className="text-sm" /> Nhập từ Excel
            </button>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-black"
              onClick={() => {
                setProductToEdit(null);
                setEditModalOpen(true);
              }}
            >
              <Icon name="add" className="text-sm" /> Thêm mới
            </button>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="w-full overflow-x-auto">
            <ProductTable
              rows={products}
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
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={filters.pageSize}
                  onChange={(e) => filters.handlePageSizeChange(Number(e.target.value))}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                >
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>{`${startRowNum} - ${endRowNum} trong tổng số ${totalCount} hàng hóa`}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => filters.setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={filters.currentPage <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {filters.currentPage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => filters.setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={filters.currentPage >= totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
      />

      {editModalOpen && (
        <EditProductModal
          key={productToEdit?.id || productToEdit?.productId || 'new'}
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

      <CategoryBrandManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <LocationAttributeModal
        open={locationAttrModalOpen}
        onClose={() => setLocationAttrModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <ProductImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessMsg(msg);
          refetch();
        }}
      />
    </div>
  );
};

export default ProductManagement;
