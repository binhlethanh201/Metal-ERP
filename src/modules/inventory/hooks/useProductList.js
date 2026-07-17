import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleProductStatusBulk,
} from '../services/productService';
import {
  normalizeProduct,
  createProductPayload,
  updateProductPayload,
} from '../utils/productUtils';
import { mockProducts, mockPagination } from '../data/productMockData';

const filterMockProducts = (params) => {
  if (!params) return mockProducts;
  let filtered = [...mockProducts];

  if (params.searchTerm) {
    const kw = params.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.productCode || '').toLowerCase().includes(kw) ||
        (p.productName || '').toLowerCase().includes(kw)
    );
  }
  if (params.categoryName) {
    const cat = params.categoryName.toLowerCase();
    filtered = filtered.filter((p) => (p.categoryName || '').toLowerCase().includes(cat));
  }
  if (params.status === 'active')
    filtered = filtered.filter((p) => p.isActive !== false && p.productStatus !== 'inactive');
  if (params.status === 'inactive')
    filtered = filtered.filter((p) => p.isActive === false || p.productStatus === 'inactive');
  return filtered;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });

export const useProductList = (queryParams) => {
  const [products, setProducts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1,
    hasNextPage: false,
  });
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '', isMock: false });
  const { token } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setApiStatus({ loading: true, error: '' });
      try {
        const response = await getProducts(queryParams);
        if (!active) return;

        if (response?.success && response?.data) {
          const {
            items = [],
            totalCount = 0,
            pageNumber = 1,
            pageSize = 20,
            totalPages = 1,
            hasNextPage = false,
          } = response.data;
          setProducts(items.map(normalizeProduct));
          setPaginationMeta({ totalCount, pageNumber, pageSize, totalPages, hasNextPage });
          setApiStatus({ loading: false, error: '', isMock: false });
        } else {
          const filtered = filterMockProducts(queryParams);
          setProducts(filtered.map(normalizeProduct));
          setPaginationMeta({
            ...mockPagination,
            totalCount: filtered.length,
            totalPages: Math.ceil(filtered.length / (queryParams?.pageSize || 20)),
          });
          setApiStatus({ loading: false, error: '', isMock: true });
        }
      } catch (error) {
        if (!active) return;
        // 401: JWT hết hạn/không hợp lệ -> không nên âm thầm hiện mock data.
        if (error?.status === 401 || error?.response?.status === 401) {
          setApiStatus({ loading: false, error: 'Phiên đăng nhập đã hết hạn.', isMock: false });
          setProducts([]);
          return;
        }
        const filtered = filterMockProducts(queryParams);
        setProducts(filtered.map(normalizeProduct));
        setPaginationMeta({
          ...mockPagination,
          totalCount: filtered.length,
          totalPages: Math.ceil(filtered.length / (queryParams?.pageSize || 20)),
        });
        setApiStatus({ loading: false, error: '', isMock: true });
      }
    };

    if (queryParams) loadData();
    return () => {
      active = false;
    };
  }, [token, queryParams, refreshTrigger]);

  const handleToggleStatus = async (id, currentIsActive) => {
    const newStatus = !currentIsActive;
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === id || p.id === id
          ? { ...p, isActive: newStatus, productStatus: newStatus ? 'active' : 'inactive' }
          : p
      )
    );
    try {
      await toggleProductStatus(id, newStatus);
    } catch (error) {
      console.error('Toggle status failed:', error);
      alert('Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.');
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === id || p.id === id
            ? {
                ...p,
                isActive: currentIsActive,
                productStatus: currentIsActive ? 'active' : 'inactive',
              }
            : p
        )
      );
    }
  };

  const handleBulkToggleStatus = async (selectedIds, targetStatus) => {
    if (selectedIds.length > 500) {
      alert('Chỉ được thao tác tối đa 500 sản phẩm mỗi lần. Vui lòng chọn ít hơn.');
      return false;
    }
    const previousProducts = [...products];
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.productId || p.id)
          ? { ...p, isActive: targetStatus, productStatus: targetStatus ? 'active' : 'inactive' }
          : p
      )
    );
    try {
      const res = await toggleProductStatusBulk(selectedIds, targetStatus);
      if (res?.data?.notFoundIds?.length) {
        alert(
          `Cập nhật thành công ${res.data.updatedCount} sản phẩm. ${res.data.notFoundIds.length} sản phẩm không thuộc chi nhánh hiện tại nên bị bỏ qua.`
        );
      }
      return true;
    } catch (error) {
      console.error('Bulk toggle failed:', error);
      alert('Không thể cập nhật trạng thái hàng loạt. Vui lòng thử lại.');
      setProducts(previousProducts);
      return false;
    }
  };

  const handleSaveProduct = async (updatedForm, productToEdit, onSuccess) => {
    try {
      const prepared = { ...updatedForm };

      // Chuyển đổi File sang Base64 cho ảnh, và LUÔN đồng bộ ảnh đại diện
      // với ảnh đầu tiên trong danh sách (tránh gửi blob: URL lên server).
      console.log(
        '[DEBUG] handleSaveProduct images before:',
        prepared.images?.length,
        JSON.stringify(
          prepared.images?.map((i) => ({ hasFile: !!i?.file, url: (i?.url || '').slice(0, 60) }))
        )
      );
      if (Array.isArray(prepared.images) && prepared.images.length > 0) {
        const mapped = await Promise.all(
          prepared.images.map(async (it) => {
            if (it?.file) {
              try {
                const data = await fileToDataUrl(it.file);
                console.log('[DEBUG] File converted to data URL, length:', data.length);
                return { url: data };
              } catch {
                console.warn(
                  '[DEBUG] File conversion failed, using existing URL:',
                  it.url?.slice(0, 50)
                );
                return { url: it.url || '' };
              }
            }
            return { url: typeof it === 'string' ? it : it.url || '' };
          })
        );
        prepared.images = mapped;
        // Luôn ghi đè bằng ảnh đầu tiên đã convert xong (không chỉ khi rỗng),
        // vì prepared.image có thể đang là blob: URL từ preview.
        prepared.image = mapped[0]?.url || '';
      } else {
        prepared.image = '';
      }

      const isUpdate = Boolean(
        productToEdit?.id && !productToEdit.id.toString().startsWith('SP-DRAFT')
      );
      const productKey = productToEdit?.productId || productToEdit?.id;

      // Chuẩn hóa payload DTO bằng utility func
      const payload = isUpdate ? updateProductPayload(prepared) : createProductPayload(prepared);

      // Validate phía FE trước khi gọi (khớp theo doc: costPrice/salePrice không âm)
      if (!payload.productName || !payload.unit) {
        alert('Tên sản phẩm và Đơn vị tính là bắt buộc!');
        return;
      }
      if (payload.costPrice < 0 || payload.salePrice < 0) {
        alert('Giá vốn và giá bán không được âm!');
        return;
      }
      if (!isUpdate && payload.costPrice <= 0) {
        alert('Giá vốn khi tạo mới phải lớn hơn 0!');
        return;
      }
      if (payload.salePrice < payload.costPrice) {
        alert('Giá bán phải lớn hơn hoặc bằng giá vốn!');
        return;
      }

      // Gọi API thật - KHÔNG fallback giả khi lỗi, để catch bên ngoài báo lỗi thật cho user
      console.log('[DEBUG] Payload being sent:', {
        imageUrl: (payload.imageUrl || '').slice(0, 80),
        imagesCount: payload.images?.length,
        imagesFirstUrl: (payload.images?.[0] || '').slice(0, 80),
      });
      if (isUpdate) {
        await updateProduct(productKey, payload);
      } else {
        await createProduct(payload);
      }

      // LƯU Ý: KHÔNG tự động gọi PATCH toggle-status ở đây nữa.
      // ProductUpsertDto (POST/PUT) không có field trạng thái kinh doanh,
      // và việc tự PATCH sau PUT đã gây bug "vừa Lưu xong thì tự chuyển Inactive".
      // Đổi trạng thái kinh doanh phải luôn đi qua handleToggleStatus/handleBulkToggleStatus
      // (nút/toggle riêng ngoài danh sách), tách biệt hoàn toàn khỏi luồng Lưu sản phẩm.

      onSuccess?.();
      refetch();
    } catch (error) {
      console.error('🚨 API Error Detail:', error);
      const detail = error?.data?.errors;
      const isValidation = Array.isArray(detail) || error?.data?.message?.includes('không hợp lệ');
      alert(
        isValidation
          ? 'Lỗi tạo sản phẩm, vui lòng thử lại.'
          : error?.data?.message || error?.message || 'Lỗi tạo sản phẩm, vui lòng thử lại.'
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hàng hóa này?');
    if (!confirmed) return;
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((item) => item.productId !== id && item.id !== id));
    try {
      await deleteProduct(id);
      refetch(); // Tải lại dữ liệu từ API sau khi xóa
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
      setProducts(previousProducts);
    }
  };

  return {
    products,
    paginationMeta,
    apiStatus,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleStatus,
    handleBulkToggleStatus,
    refetch,
  };
};
