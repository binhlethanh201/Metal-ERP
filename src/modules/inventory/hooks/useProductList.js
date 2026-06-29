import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '../services/productService';
import { normalizeProduct } from '../utils/productUtils';
import { mockProducts, mockPagination } from '../data/productMockData';

// Lọc dữ liệu mẫu dựa trên queryParams để bộ lọc sidebar hoạt động
const filterMockProducts = (params) => {
  if (!params) return mockProducts;
  let filtered = [...mockProducts];

  if (params.SearchTerm) {
    const kw = params.SearchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.productCode || '').toLowerCase().includes(kw) ||
        (p.productName || '').toLowerCase().includes(kw) ||
        (p.name || '').toLowerCase().includes(kw)
    );
  }
  if (params.CategoryName) {
    const cat = params.CategoryName.toLowerCase();
    filtered = filtered.filter((p) => (p.categoryName || '').toLowerCase().includes(cat));
  }
  if (params.Status === 'active') filtered = filtered.filter((p) => p.isActive !== false);
  if (params.Status === 'inactive') filtered = filtered.filter((p) => p.isActive === false);
  // 'draft' status: mock không có draft nên trả về rỗng, thêm 1 số mẫu để test
  if (params.Status === 'draft') {
    filtered = filtered.filter((p) => p.productStatus === 'draft');
    if (filtered.length === 0) {
      filtered = mockProducts
        .slice(0, 2)
        .map((p) => ({ ...p, isActive: true, productStatus: 'draft', id: `DRAFT-${p.id}` }));
    }
  }
  return filtered;
};

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
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '', isMock: false });
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
          setApiStatus({ loading: false, error: '', isMock: false });
        } else {
          // API có response nhưng success=false (lỗi backend) → fallback mock
          const filtered = filterMockProducts(queryParams);
          setProducts(filtered.map(normalizeProduct));
          setPaginationMeta({
            ...mockPagination,
            totalCount: filtered.length,
            totalPages: Math.ceil(filtered.length / (queryParams?.PageSize || 10)),
          });
          setApiStatus({ loading: false, error: '', isMock: true });
        }
      } catch (error) {
        if (!active) return;
        // API không gọi được (network/auth) → fallback mock
        const filtered = filterMockProducts(queryParams);
        setProducts(filtered.map(normalizeProduct));
        setPaginationMeta({
          ...mockPagination,
          totalCount: filtered.length,
          totalPages: Math.ceil(filtered.length / (queryParams?.PageSize || 10)),
        });
        setApiStatus({ loading: false, error: '', isMock: true });
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
    // Cập nhật local ngay lập tức (kể cả khi dùng mock data)
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === id || p.id === id
          ? { ...p, isActive: newStatus, productStatus: newStatus ? 'active' : 'inactive' }
          : p
      )
    );
    try {
      await toggleProductStatus(id, newStatus);
    } catch {
      // API chưa sẵn sàng → vẫn giữ trạng thái local
    }
  };

  // Đổi trạng thái hàng loạt
  const handleBulkToggleStatus = async (selectedIds, targetStatus) => {
    // Cập nhật local ngay lập tức
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.productId || p.id)
          ? { ...p, isActive: targetStatus, productStatus: targetStatus ? 'active' : 'inactive' }
          : p
      )
    );
    try {
      await Promise.all(selectedIds.map((id) => toggleProductStatus(id, targetStatus)));
    } catch {
      // API chưa sẵn sàng → giữ trạng thái local
    }
    return true;
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

      const safeMinimumStock = Number(prepared.minimumStock ?? prepared.stockMin) || 0;
      const safeMaximumStock = Number(prepared.stockMax) || 0;
      const safeWeight = Number(prepared.weight) || 0;
      const safeWidth = Number(prepared.width) || 0;
      const safeLength = Number(prepared.length) || 0;
      const safeHeight = Number(prepared.height) || 0;
      const safeActualStock = Number(prepared.stock) || 0;
      const safeAvailableStock = Number(prepared.availableStock) || safeActualStock || 0;
      const safeReservedStock = Number(prepared.reservedStock) || 0;
      const safeShelfLocation =
        prepared.locations && prepared.locations.length > 0
          ? prepared.locations[0]
          : prepared.shelfLocation || '';
      const safeLocations = Array.isArray(prepared.locations) ? prepared.locations : [];

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
        actualStock: safeActualStock,
        availableStock: safeAvailableStock,
        reservedStock: safeReservedStock,
        minimumStock: safeMinimumStock,
        maximumStock: safeMaximumStock,

        // Kích thước & Media
        shelfLocation: safeShelfLocation,
        shelfLocations: safeLocations,
        weight: safeWeight,
        weightUnit: prepared.weightUnit || 'g',
        width: safeWidth,
        length: safeLength,
        height: safeHeight,
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

      // Gửi kèm key PascalCase để tương thích backend C# dùng JsonPropertyName/PascalCase binding
      payload.Id = payload.id;
      payload.ProductId = payload.productId;
      payload.ProductCode = payload.productCode;
      payload.ProductName = payload.productName;
      payload.Barcode = payload.barcode;
      payload.Unit = payload.unit;
      payload.BrandName = payload.brandName;
      payload.CategoryName = payload.categoryName;
      payload.SupplierId = payload.supplierId;
      payload.ItemType = payload.itemType;
      payload.CostPrice = payload.costPrice;
      payload.SellPrice = payload.salePrice;
      payload.ActualStock = payload.actualStock;
      payload.AvailableStock = payload.availableStock;
      payload.ReservedStock = payload.reservedStock;
      payload.MinimumStock = payload.minimumStock;
      payload.MaximumStock = payload.maximumStock;
      payload.ShelfLocation = payload.shelfLocation;
      payload.ShelfLocations = payload.shelfLocations;
      payload.Weight = payload.weight;
      payload.WeightUnit = payload.weightUnit;
      payload.Width = payload.width;
      payload.Length = payload.length;
      payload.Height = payload.height;
      payload.SizeUnit = payload.sizeUnit;
      payload.Specification = payload.specification;
      payload.ImageUrl = payload.imageUrl;
      payload.Images = payload.images;
      payload.IsActive = payload.isActive;
      payload.DirectSale = payload.directSale;
      payload.Attributes = payload.attributes;
      payload.ConversionUnits = payload.conversionUnits;

      // 4. Gọi API (fallback local nếu API chưa sẵn sàng)
      try {
        if (productKey && !productKey.startsWith('SP-DRAFT')) {
          await updateProduct(productKey, payload);
        } else {
          await createProduct(payload);
        }
      } catch {
        // API chưa sẵn sàng → cập nhật local
        const normalized = normalizeProduct(payload);
        setProducts((prev) => {
          if (productKey && !productKey.startsWith('SP-DRAFT')) {
            return prev.map((p) =>
              p.productId === productKey || p.id === productKey ? { ...p, ...normalized } : p
            );
          }
          return [...prev, { ...normalized, id: `SP-${Date.now()}` }];
        });
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
    setProducts((prev) => prev.filter((item) => item.productId !== id && item.id !== id));
    try {
      await deleteProduct(id);
    } catch {
      // API chưa sẵn sàng → giữ trạng thái local
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
