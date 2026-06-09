import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductManagement from './InventoryProduct';

const sampleProducts = [
  {
    id: 'p1',
    productId: 'p1',
    productCode: 'P001',
    name: 'Sản phẩm A',
    salePrice: 120000,
    costPrice: 90000,
    stock: 10,
    status: 'available',
  },
  {
    id: 'p2',
    productId: 'p2',
    productCode: 'P002',
    name: 'Sản phẩm B',
    salePrice: 85000,
    costPrice: 65000,
    stock: 5,
    status: 'draft',
  },
];

const mockHandleSaveProduct = jest.fn();
const mockHandleDeleteProduct = jest.fn();
const mockSetCurrentPage = jest.fn();
const mockSetProductStatusFilter = jest.fn();
const mockSetSearch = jest.fn();
const mockSetEstimatedQuickOpen = jest.fn();
const mockSetEstimatedCustomOpen = jest.fn();
const mockSetCreatedQuickOpen = jest.fn();
const mockSetCreatedCustomOpen = jest.fn();
const mockSetStatusDropdownOpen = jest.fn();

jest.mock('../../../shared/router', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('../components/product/EditProductModal', () => {
  return function MockEditProductModal({ open }) {
    if (!open) return null;
    return <div data-testid="mock-edit-product-modal" data-open="true" />;
  };
});

jest.mock('../components/product/ProductFilterSidebar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-product-filter-sidebar" />),
}));

jest.mock('../components/product/ProductTable', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-product-table" />),
}));

jest.mock('../hooks/useProductList', () => ({
  useProductList: jest.fn(),
}));

jest.mock('../hooks/useProductFilters', () => ({
  useProductFilters: jest.fn(),
}));

const { useProductList } = require('../hooks/useProductList');
const { useProductFilters } = require('../hooks/useProductFilters');
const { useSearchParams } = require('../../../shared/router');
const mockProductFilterSidebar = require('../components/product/ProductFilterSidebar').default;
const mockProductTable = require('../components/product/ProductTable').default;

const defaultFilters = {
  currentPage: 1,
  pageSize: 15,
  filteredRows: sampleProducts,
  search: '',
  setSearch: mockSetSearch,
  setCurrentPage: mockSetCurrentPage,
  setProductStatusFilter: mockSetProductStatusFilter,
  handlePageSizeChange: jest.fn(),
  sortConfig: { key: 'name', direction: 'asc' },
  getSortIcon: jest.fn(),
  toggleSort: jest.fn(),
  estimatedRef: { current: null },
  setEstimatedQuickOpen: mockSetEstimatedQuickOpen,
  setEstimatedCustomOpen: mockSetEstimatedCustomOpen,
  createdRef: { current: null },
  setCreatedQuickOpen: mockSetCreatedQuickOpen,
  setCreatedCustomOpen: mockSetCreatedCustomOpen,
  statusDropdownRef: { current: null },
  setStatusDropdownOpen: mockSetStatusDropdownOpen,
};

const mockSearchParams = {
  get: jest.fn(() => null),
};

const renderProductManagement = (apiStatus = { loading: false, error: null }) => {
  useProductList.mockReturnValue({
    products: sampleProducts,
    apiStatus,
    handleSaveProduct: mockHandleSaveProduct,
    handleDeleteProduct: mockHandleDeleteProduct,
  });
  useProductFilters.mockReturnValue(defaultFilters);
  useSearchParams.mockReturnValue([mockSearchParams]);

  render(<ProductManagement />);
};

describe('ProductManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Hiển thị tiêu đề trang Hàng hóa và trạng thái đồng bộ dữ liệu từ API thành công', () => {
    renderProductManagement({ loading: false, error: null });

    expect(screen.getByRole('heading', { name: /hàng hóa/i })).toBeInTheDocument();
    expect(screen.getByText(/đã đồng bộ dữ liệu sản phẩm từ api/i)).toBeInTheDocument();

    expect(mockProductFilterSidebar).toHaveBeenCalledTimes(1);
    expect(mockProductFilterSidebar.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        isCollapsed: false,
        onToggleCollapse: expect.any(Function),
        filters: defaultFilters,
      })
    );

    expect(mockProductTable).toHaveBeenCalledTimes(1);
    expect(mockProductTable.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        rows: sampleProducts,
        onDelete: mockHandleDeleteProduct,
        expandedId: 'SP34405804',
      })
    );
  });

  it('Kiểm tra trạng thái tải - Hiển thị thông báo Đang đồng bộ dữ liệu khi trạng thái apiStatus.loading bằng true', () => {
    renderProductManagement({ loading: true, error: null });

    expect(screen.getByText(/đang đồng bộ dữ liệu api/i)).toBeInTheDocument();
  });

  it('Luồng Thêm mới - Nhấp vào nút "Tạo mới" phải kích hoạt mở Modal Thêm hàng hóa (setEditModalOpen thành true)', async () => {
    renderProductManagement();

    // 1. Ban đầu modal chắc chắn KHÔNG nằm trên DOM
    expect(screen.queryByTestId('mock-edit-product-modal')).not.toBeInTheDocument();

    // 2. Tìm nút "Tạo mới" và thực hiện click
    const createButton = screen.getByRole('button', { name: /tạo mới/i });
    await userEvent.click(createButton);

    // 3. Khẳng định: Modal đã xuất hiện trên màn hình một cách chính xác
    const modalAfterClick = screen.getByTestId('mock-edit-product-modal');
    expect(modalAfterClick).toBeInTheDocument();
    expect(modalAfterClick).toHaveAttribute('data-open', 'true');
  });

  it('Luồng Xóa - Xác nhận hàm onDelete (handleDeleteProduct) trong ProductTable được gọi chính xác khi có yêu cầu xóa hàng hóa', () => {
    renderProductManagement();

    // Lấy ra các thuộc tính (props) mà component cha đã truyền xuống cho ProductTable
    const productTableProps = mockProductTable.mock.calls[0][0];

    // Giả lập hành động kích hoạt hàm onDelete từ bên trong bảng sản phẩm
    productTableProps.onDelete(sampleProducts[1]);

    // Khẳng định: Hàm handleDeleteProduct của useProductList phải được gọi trúng sản phẩm đó
    expect(mockHandleDeleteProduct).toHaveBeenCalledWith(sampleProducts[1]);
  });
});
