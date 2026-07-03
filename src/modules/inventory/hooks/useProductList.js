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
    } catch {}
  };

  const handleBulkToggleStatus = async (selectedIds, targetStatus) => {
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.productId || p.id)
          ? { ...p, isActive: targetStatus, productStatus: targetStatus ? 'active' : 'inactive' }
          : p
      )
    );
    try {
      await toggleProductStatusBulk(selectedIds, targetStatus);
    } catch (error) {
      console.error('Bulk toggle failed:', error);
    }
    return true;
  };

  const handleSaveProduct = async (updatedForm, productToEdit, onSuccess) => {
    try {
      const prepared = { ...updatedForm };

      // Chuyển đổi File sang Base64 cho ảnh
      if (Array.isArray(prepared.images) && prepared.images.length > 0) {
        const mapped = await Promise.all(
          prepared.images.map(async (it) => {
            if (it?.file) {
              try {
                const data = await fileToDataUrl(it.file);
                return { url: data };
              } catch {
                return { url: it.url || '' };
              }
            }
            return { url: typeof it === 'string' ? it : it.url || '' };
          })
        );
        prepared.images = mapped;
        if (!prepared.image && prepared.images.length > 0) prepared.image = prepared.images[0].url;
      }

      const isUpdate = Boolean(
        productToEdit?.id && !productToEdit.id.toString().startsWith('SP-DRAFT')
      );
      const productKey = productToEdit?.productId || productToEdit?.id;

      // Chuẩn hóa payload DTO bằng utility func
      const payload = isUpdate ? updateProductPayload(prepared) : createProductPayload(prepared);

      // Validate phía FE trước khi gọi
      if (!payload.productName || !payload.unit) {
        alert('Tên sản phẩm và Đơn vị tính là bắt buộc!');
        return;
      }
      if (payload.costPrice <= 0 && !isUpdate) {
        alert('Giá vốn khi tạo mới phải lớn hơn 0!');
        return;
      }
      if (payload.salePrice < payload.costPrice) {
        alert('Giá bán phải lớn hơn hoặc bằng giá vốn!');
        return;
      }

      try {
        if (isUpdate) {
          await updateProduct(productKey, payload);
        } else {
          await createProduct(payload);
        }
      } catch (err) {
        // Fallback local nếu API chưa live
        const normalized = normalizeProduct({ ...payload, id: productKey || `SP-${Date.now()}` });
        setProducts((prev) => {
          if (isUpdate) {
            return prev.map((p) =>
              p.productId === productKey || p.id === productKey ? { ...p, ...normalized } : p
            );
          }
          return [normalized, ...prev];
        });
      }

      onSuccess?.();
      refetch();
    } catch (error) {
      console.error('🚨 API Error Detail:', error);
      const errorMsg = error?.data?.message || error?.message || 'Không thể lưu sản phẩm.';
      alert(errorMsg);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hàng hóa này?');
    if (!confirmed) return;
    setProducts((prev) => prev.filter((item) => item.productId !== id && item.id !== id));
    try {
      await deleteProduct(id);
    } catch {}
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
