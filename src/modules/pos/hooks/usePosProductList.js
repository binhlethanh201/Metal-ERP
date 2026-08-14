/**
 * Hook lấy danh sách sản phẩm cho POS từ API /pos/products
 * Kết hợp với Inventory API để lọc sản phẩm đã ngừng hoạt động.
 * Backend: http://localhost:5100/api/pos/products
 */
import { useState, useEffect, useCallback } from 'react';
import { getPosProducts } from '../services/posService';
import { getProducts } from '../../../modules/inventory/services/productService';

// Removed MOCK_POS_PRODUCTS

const normalizePosProduct = (p) => {
  // API trả PascalCase - hỗ trợ cả lowercase
  const rawConvUnits = p.ConversionUnits ?? p.conversionUnits ?? [];
  const rawStock = parseFloat(p.AvailableStock ?? p.availableStock ?? p.quantity ?? p.stock ?? 0);
  const warrantyQty = parseFloat(p.WarrantyQuantity ?? p.warrantyQuantity ?? 0);
  const sellable = Math.max(0, rawStock - warrantyQty);
  return {
    productId: p.ProductId ?? p.productId ?? p.id ?? '',
    productCode: p.ProductCode ?? p.productCode ?? '',
    productName: p.ProductName ?? p.productName ?? p.name ?? '',
    barcode: p.Barcode ?? p.barcode ?? '',
    unit: p.Unit ?? p.unit ?? 'Cái',
    retailPrice: parseFloat(
      p.RetailPrice ?? p.retailPrice ?? p.unitPrice ?? p.salePrice ?? p.price ?? 0
    ),
    // ĐÈ LẠI stock = sellableQuantity để toàn bộ UI (ProductCard, Cart, CheckStock) dùng chung
    availableStock: sellable,
    warrantyQuantity: warrantyQty,
    sellableQuantity: sellable,
    categoryName: p.CategoryName ?? p.categoryName ?? p.category ?? '',
    image: p.ImageUrl ?? p.imageUrl ?? p.image ?? '',
    productStatus:
      p.ProductStatus ??
      p.productStatus ??
      p.IsActive ??
      p.isActive ??
      p.Status ??
      p.status ??
      'active',
    status: sellable > 0 ? 'Còn hàng' : 'Hết hàng',
    // UOM: đơn vị quy đổi - map sang lowercase cho FE
    conversionUnits: rawConvUnits.map((u) => ({
      unitName: u.UnitName ?? u.unitName ?? u.name ?? '',
      convertValue: u.ConvertValue ?? u.convertValue ?? 1,
      price: u.Price ?? u.price ?? 0,
    })),
    hasMultipleUnits: rawConvUnits.length > 0,
    directSale: p.DirectSale ?? p.directSale ?? true,
  };
};

export const usePosProductList = (searchTerm = '') => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const fetchProducts = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy sản phẩm từ POS API
      const response = await getPosProducts(term ? { search: term } : {});
      const items = Array.isArray(response)
        ? response
        : (response?.Items ?? response?.items ?? response?.data ?? []);

      let resultList = [];
      if (items.length > 0) {
        const normalized = items.map(normalizePosProduct);

        // 2. Lấy danh sách ID sản phẩm còn hoạt động từ Inventory API
        try {
          const invResponse = await getProducts({ pageSize: 1000, status: 'active' });
          const invItems =
            invResponse?.data?.items ??
            invResponse?.Items ??
            invResponse?.items ??
            invResponse?.data ??
            [];
          const activeIds = new Set(
            (Array.isArray(invItems) ? invItems : [])
              .filter((p) => {
                const s =
                  p.productStatus ??
                  p.ProductStatus ??
                  p.status ??
                  p.Status ??
                  p.isActive ??
                  p.IsActive ??
                  'active';
                return String(s) !== 'inactive' && String(s) !== 'false' && s !== false;
              })
              .map((p) => String(p.id ?? p.productId ?? p.ProductId ?? ''))
              .filter(Boolean)
          );

          if (activeIds.size > 0) {
            resultList = normalized.filter((p) => activeIds.has(String(p.productId)));
          } else {
            resultList = normalized.filter((p) => p.productStatus !== 'inactive');
          }
        } catch (e) {
          console.warn('Không thể lấy trạng thái từ Inventory, dùng filter mặc định:', e);
          resultList = normalized.filter((p) => p.productStatus !== 'inactive');
        }
        setProducts(resultList);
        setIsMock(false);
        return resultList;
      } else {
        // API trả về danh sách rỗng (không có sản phẩm nào) -> không fallback về mock data
        setProducts([]);
        setIsMock(false);
        return [];
      }
    } catch (err) {
      console.error('Lỗi lấy sản phẩm POS:', err);
      setError(err.message || 'Không thể tải sản phẩm');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchProducts]);

  // Tự động refetch danh sách sản phẩm khi người dùng quay lại tab/màn hình POS
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts(searchTerm);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [fetchProducts, searchTerm]);

  return {
    products,
    loading,
    error,
    isMock,
    refetch: fetchProducts,
  };
};

export default usePosProductList;
