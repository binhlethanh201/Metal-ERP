import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import EditProductModal from '../components/product/EditProductModal';
import ProductFilterSidebar from '../components/product/ProductFilterSidebar';
import ProductTable from '../components/product/ProductTable';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProductList } from '../hooks/useProductList';

export const ProductManagement = () => {
  const [expandedId, setExpandedId] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [initialEditTab, setInitialEditTab] = useState('info');
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);

  // Khởi tạo Filters và gọi API List
  const filters = useProductFilters();
  const {
    products,
    paginationMeta,
    apiStatus,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleStatus,
    handleBulkToggleStatus,
    refetch,
  } = useProductList(filters.queryParams);

  useEffect(() => {
    if (searchParams.get('status') === 'draft') {
      filters.setProductStatusFilter('draft');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    estimatedRef,
    setEstimatedQuickOpen,
    setEstimatedCustomOpen,
    createdRef,
    setCreatedQuickOpen,
    setCreatedCustomOpen,
    statusDropdownRef,
    setStatusDropdownOpen,
  } = filters;

  // Khử click outside cho các dropdown bộ lọc ngày/trạng thái
  useEffect(() => {
    const onClickOutside = (e) => {
      if (estimatedRef.current && !estimatedRef.current.contains(e.target)) {
        setEstimatedQuickOpen(false);
        setEstimatedCustomOpen(false);
      }
      if (createdRef.current && !createdRef.current.contains(e.target)) {
        setCreatedQuickOpen(false);
        setCreatedCustomOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [
    estimatedRef,
    setEstimatedQuickOpen,
    setEstimatedCustomOpen,
    createdRef,
    setCreatedQuickOpen,
    setCreatedCustomOpen,
    statusDropdownRef,
    setStatusDropdownOpen,
  ]);

  // Phân trang dữ liệu lấy từ API
  const { currentPage, setCurrentPage, pageSize } = filters;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalCount = paginationMeta?.totalCount || 0;
  const startRowNum = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRowNum = Math.min(currentPage * pageSize, totalCount);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const handleSave = (updated) => {
    handleSaveProduct(updated, productToEdit, () => {
      filters.setCurrentPage(1);
      setEditModalOpen(false);
      setProductToEdit(null);
      refetch();
      filters.setCurrentPage(1);
    });
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [products]);

  // Hàm xử lý chọn 1 dòng
  const handleSelectRow = (id, isChecked) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Hàm xử lý chọn tất cả trên trang hiện tại
  const handleSelectAll = (isChecked, currentRows) => {
    if (isChecked) {
      setSelectedIds(currentRows.map((row) => row.productId || row.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="mt-2 w-full space-y-4 text-slate-800">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hàng hóa</h1>
        <p className="mt-1 text-gray-600">Quản lý danh sách hàng hóa và tồn kho</p>
      </div>

      {/* Thanh trạng thái API đồng bộ */}
      <div className="flex w-full">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
            apiStatus.error
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {apiStatus.loading
            ? 'Đang đồng bộ dữ liệu API...'
            : apiStatus.error || 'Đã đồng bộ dữ liệu sản phẩm từ API'}
        </div>
      </div>

      {/* Khu vực xử lý nghiệp vụ chính: Sidebar lọc + Bảng dữ liệu */}
      <div className="relative flex w-full min-w-0 items-start gap-6 pb-6 pt-2">
        <ProductFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filters}
        />

        {/* Khối bên phải chứa bộ lọc tìm kiếm và bảng dữ liệu */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {/* THANH CÔNG CỤ BULK ACTION (Chỉ hiện ra khi có item được tick chọn) */}
          {selectedIds.length > 0 && (
            <div className="animate-fade-in flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm transition-all">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Icon name="check_circle" size={20} />
                Đã chọn {selectedIds.length} hàng hóa trên trang này
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Bạn muốn MỞ BÁN lại ${selectedIds.length} sản phẩm đã chọn?`
                    );
                    if (confirmed) {
                      const success = await handleBulkToggleStatus(selectedIds, true);
                      if (success) setSelectedIds([]); // Reset checkbox sau khi thành công
                    }
                  }}
                >
                  <Icon name="play_circle" size={18} />
                  Mở bán
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Bạn muốn NGỪNG KINH DOANH ${selectedIds.length} sản phẩm đã chọn?`
                    );
                    if (confirmed) {
                      const success = await handleBulkToggleStatus(selectedIds, false);
                      if (success) setSelectedIds([]);
                    }
                  }}
                >
                  <Icon name="block" size={18} />
                  Ngừng bán
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
          {/* Thanh Search nội bộ & Nhóm nút Thao tác nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-[240px] max-w-lg flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <Icon name="search" className="mr-2 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
                placeholder="Theo mã, tên hàng"
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
              />
              <Icon name="tune" className="ml-2 cursor-pointer text-slate-400" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
                onClick={() => {
                  setProductToEdit(null);
                  setEditModalOpen(true);
                }}
              >
                <Icon name="add" className="text-sm" />
                <span>Tạo mới</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <Icon name="upload_file" className="text-sm" />
                <span>Import file</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <Icon name="download" className="text-sm" />
                <span>Xuất file</span>
              </button>
            </div>
          </div>

          {/* Bảng dữ liệu hàng hóa & Phân trang */}
          <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <ProductTable
                rows={products}
                sortConfig={filters.sortConfig}
                getSortIcon={filters.getSortIcon}
                onToggleSort={filters.toggleSort}
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

            {/* Footer phân trang */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={filters.pageSize}
                    onChange={(e) => filters.handlePageSizeChange(Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary focus:ring-primary"
                  >
                    <option value={10}>10 dòng</option>
                    <option value={15}>15 dòng</option>
                    <option value={30}>30 dòng</option>
                    <option value={50}>50 dòng</option>
                  </select>
                </div>
                <span>{`${startRowNum} - ${endRowNum} trong tổng số ${totalCount} hàng hóa`}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={filters.currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {filters.currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => filters.setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={filters.currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa hàng hóa */}
      {editModalOpen && (
        <EditProductModal
          key={productToEdit?.productId || productToEdit?.productCode || productToEdit?.id || 'new'}
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
    </div>
  );
};

export default ProductManagement;
