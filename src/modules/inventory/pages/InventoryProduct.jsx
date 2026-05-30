import { useState, useEffect, useMemo } from 'react';
// import { useOutletContext } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import EditProductModal from '../components/product/EditProductModal';
import ProductFilterSidebar from '../components/product/ProductFilterSidebar';
import ProductTable from '../components/product/ProductTable';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProductList } from '../hooks/useProductList';

export const ProductManagement = () => {
  // const { setActiveHubKey } = useOutletContext();

  const [expandedId, setExpandedId] = useState('SP34405804');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [initialEditTab, setInitialEditTab] = useState('info');

  const { products, apiStatus, handleSaveProduct, handleDeleteProduct } = useProductList();
  const filters = useProductFilters(products);

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

  // Phân trang dữ liệu
  const displayedRows = useMemo(() => {
    const start = (filters.currentPage - 1) * filters.pageSize;
    return filters.filteredRows.slice(start, start + filters.pageSize);
  }, [filters.filteredRows, filters.currentPage, filters.pageSize]);

  const { currentPage, setCurrentPage, filteredRows, pageSize } = filters;

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const startRowNum = filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRowNum = Math.min(currentPage * pageSize, filteredRows.length);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const handleSave = (updated) => {
    handleSaveProduct(updated, productToEdit, () => {
      filters.setCurrentPage(1);
      setEditModalOpen(false);
      setProductToEdit(null);
    });
  };

  return (
    // FIX 1: Thay đổi `w-full overflow-hidden` thành `w-full text-slate-800` để component thoải mái dàn trải chiều ngang nếu màn hình rộng
    <div className="mt-2 w-full space-y-4">
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
      {/* FIX 2: Bỏ hoàn toàn `max-w-[1600px]` ở đây để không bóp nghẹt diện tích khi bật sidebar */}
      <div className="relative flex w-full min-w-0 items-start gap-6 pb-6 pt-2">
        <ProductFilterSidebar
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={setIsFilterCollapsed}
          filters={filters}
        />

        {/* Khối bên phải chứa bộ lọc tìm kiếm và bảng dữ liệu */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
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
          {/* FIX 3: Container này quản lý cấu trúc dọc của table + pagination footer */}
          <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* FIX 4: Thẻ DIV trực tiếp bọc ProductTable phải có thuộc tính `overflow-x-auto` độc lập */}
            <div className="w-full overflow-x-auto">
              <ProductTable
                rows={displayedRows}
                sortConfig={filters.sortConfig}
                getSortIcon={filters.getSortIcon}
                onToggleSort={filters.toggleSort}
                expandedId={expandedId}
                onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? '' : id))}
                onEdit={(row, tab) => {
                  setProductToEdit(row);
                  setInitialEditTab(tab || 'info');
                  setEditModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
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
                  <Icon name="chevron_left" className="text-[18px]" />
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
