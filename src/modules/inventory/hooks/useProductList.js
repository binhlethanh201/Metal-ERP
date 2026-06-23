import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '../services/inventoryService';
import { normalizeProduct } from '../utils/productUtils';

// Tiện ích chuyển đổi File ảnh thành Base64
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
    totalPages: 1,
    hasNextPage: false,
  });
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '' });
  const { token } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refetch = () => setRefreshTrigger((prev) => prev + 1);

  // Tự động Fetch mỗi khi Token hoặc Query Params đổi
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setApiStatus({ loading: true, error: '' });
      try {
        const response = await getProducts(queryParams);
        if (!active) return;

        if (response?.success && response?.data) {
          const items = response.data.items || [];
          setProducts(items.map(normalizeProduct));

          setPaginationMeta({
            totalCount: response.data.totalCount || 0,
            totalPages: response.data.totalPages || 1,
            hasNextPage: response.data.hasNextPage || false,
          });
        }
        setApiStatus({ loading: false, error: '' });
      } catch (error) {
        if (!active) return;
        setApiStatus({ loading: false, error: 'Lỗi tải dữ liệu từ API.' });
      }
    };

    if (queryParams) loadData();

    return () => {
      active = false;
    };
  }, [token, queryParams, refreshTrigger]);

  // Đổi trạng thái 1 sản phẩm
  const handleToggleStatus = async (id, currentIsActive) => {
    const newStatus = !currentIsActive;
    try {
      await toggleProductStatus(id, newStatus);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === id || p.id === id
            ? { ...p, isActive: newStatus, productStatus: newStatus ? 'active' : 'inactive' }
            : p
        )
      );
    } catch (error) {
      alert('Không thể đổi trạng thái. Vui lòng thử lại!');
    }
  };

  // Đổi trạng thái hàng loạt
  const handleBulkToggleStatus = async (selectedIds, targetStatus) => {
    try {
      const promises = selectedIds.map((id) => toggleProductStatus(id, targetStatus));
      await Promise.all(promises);

      setProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.productId || p.id)
            ? { ...p, isActive: targetStatus, productStatus: targetStatus ? 'active' : 'inactive' }
            : p
        )
      );
      return true;
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật hàng loạt. Vui lòng tải lại trang để kiểm tra!');
      return false;
    }
  };

  // Lưu sản phẩm (Đã thêm bộ lọc chống Crash UUID cho Backend C#)
  const handleSaveProduct = async (updated, productToEdit, onSuccess) => {
    try {
      const isDraft = updated.productStatus === 'draft';
      const prepared = { ...updated, productStatus: isDraft ? 'draft' : 'active' };

      // 1. Dọn dẹp Draft LocalStorage
      if (productToEdit?.id?.startsWith('SP-DRAFT-') && !isDraft) {
        try {
          const drafts = JSON.parse(localStorage.getItem('draftProducts') || '[]');
          const filtered = drafts.filter((d) => d.id !== productToEdit.id);
          localStorage.setItem('draftProducts', JSON.stringify(filtered));
        } catch {}
      }

      // 2. Xử lý Image sang Base64
      if (Array.isArray(prepared.images) && prepared.images.length > 0) {
        const mapped = await Promise.all(
          prepared.images.map(async (it) => {
            if (it?.file) {
              try {
                const data = await fileToDataUrl(it.file);
                return { id: it.id || Date.now(), url: data };
              } catch {
                return { id: it.id || Date.now(), url: it.url || '' };
              }
            }
            return typeof it === 'string'
              ? { id: `${Date.now()}`, url: it }
              : { id: it.id || `${Date.now()}`, url: it.url || '' };
          })
        );
        prepared.images = mapped.slice(0, 10);
        if (!prepared.image && prepared.images.length > 0) prepared.image = prepared.images[0].url;
      }

      // --- BỘ LỌC ÉP KIỂU VÀ CHECK UUID ---
      // Hàm kiểm tra xem ID có phải là UUID chuẩn không
      const isValidUUID = (str) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return typeof str === 'string' && uuidRegex.test(str);
      };

      const safeCostPrice = Number(prepared.costPrice) || 0;
      let safeSalePrice = Number(prepared.salePrice) || 0;
      if (safeSalePrice > 0 && safeSalePrice < safeCostPrice) safeSalePrice = safeCostPrice;
      const productKey = productToEdit?.productId || productToEdit?.id;

      const payload = {
        // Thông tin cơ bản
        id: productKey && !productKey.startsWith('SP-DRAFT') ? productKey : undefined,
        productId: productKey && !productKey.startsWith('SP-DRAFT') ? productKey : undefined,
        productCode: prepared.productCode || prepared.id || `SP${Date.now()}`,
        productName: prepared.name || prepared.productName || 'Chưa đặt tên',
        barcode: prepared.barcode || '',
        unit: prepared.unit || 'Sản phẩm',
        brandName: prepared.brand || '',
        categoryName: prepared.group || '',

        // Tài chính & Kho
        supplierId: prepared.supplierId ? prepared.supplierId : null,
        itemType: prepared.itemType || 'Goods',
        costPrice: safeCostPrice,
        salePrice: safeSalePrice,
        actualStock: Number(prepared.stock) || 0,
        availableStock: Number(prepared.availableStock) || Number(prepared.stock) || 0,
        reservedStock: Number(prepared.reservedStock) || 0,
        minimumStock: Number(prepared.minimumStock ?? prepared.stockMin) || 0,
        maximumStock: Number(prepared.stockMax) || 0,

        // Kích thước & Media
        shelfLocation:
          prepared.locations && prepared.locations.length > 0
            ? prepared.locations[0]
            : prepared.shelfLocation || '',
        shelfLocations: Array.isArray(prepared.locations) ? prepared.locations : [],
        weight: Number(prepared.weight) || 0,
        weightUnit: prepared.weightUnit || 'g',
        width: Number(prepared.width) || 0,
        length: Number(prepared.length) || 0,
        height: Number(prepared.height) || 0,
        sizeUnit: prepared.sizeUnit || 'mm',
        specification: prepared.specification || '',
        imageUrl: prepared.image || '',
        images: (prepared.images || [])
          .map((img) => (typeof img === 'string' ? img : img.url))
          .filter(Boolean),

        // Trạng thái
        isActive: prepared.productStatus !== 'draft',
        directSale: prepared.directSale !== false,

        // Mảng con
        attributes: (prepared.attributes || []).map((a) => {
          const item = { name: a.name || '', value: a.value || '' };
          if (isValidUUID(a.id)) item.id = a.id;
          return item;
        }),
        conversionUnits: (prepared.conversionUnits || []).map((u) => {
          const item = {
            name: u.name || '',
            rate: Number(u.rate) || 1,
            convertValue: Number(u.convertValue) || Number(u.rate) || 1,
            convertFrom: u.convertFrom || '',
            price: Number(u.price) || 0,
            directSale: u.directSale !== false,
          };
          if (isValidUUID(u.id)) item.id = u.id;
          return item;
        }),
      };

      // 4. Gọi API
      if (productKey && !productKey.startsWith('SP-DRAFT')) {
        await updateProduct(productKey, payload);
      } else {
        await createProduct(payload);
      }

      // 5. Cache UI Data
      try {
        const brandName = payload.brandName.trim();
        if (brandName) {
          const raw = localStorage.getItem('productBrands');
          const arr = raw ? JSON.parse(raw) : [];
          if (!arr.includes(brandName))
            localStorage.setItem('productBrands', JSON.stringify([...arr, brandName]));
        }
      } catch {}

      // 6. Refetch Data
      onSuccess?.();
    } catch (error) {
      console.error('🚨 API Error Detail:', error?.data || error);
      const errorMsg = error?.data?.message || error?.message || 'Không thể lưu sản phẩm.';
      const detailMsg = Array.isArray(error?.data?.errors)
        ? `\nChi tiết: ${error.data.errors[0]}`
        : '';
      alert(errorMsg + detailMsg);
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hàng hóa này?');
    if (!confirmed) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.productId !== id && item.id !== id));
    } catch (error) {
      alert('Không thể xóa hàng hóa');
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
