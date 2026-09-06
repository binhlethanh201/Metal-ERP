/**
 * Hook lấy danh sách sản phẩm cho POS từ API /pos/products
 * Backend: http://localhost:5100/api/pos/products
 */
import { useState, useEffect, useCallback } from 'react';
import { getPosProducts } from '../services/posService';

// Removed MOCK_POS_PRODUCTS

const normalizePosProduct = (p) => {
  try {
    // API trả PascalCase - hỗ trợ cả lowercase
    const rawConvUnits = p.ConversionUnits ?? p.conversionUnits ?? [];
    const rawStock = parseFloat(p.AvailableStock ?? p.availableStock ?? p.quantity ?? p.stock ?? 0);
    const warrantyQty = parseFloat(p.WarrantyQuantity ?? p.warrantyQuantity ?? 0);
    const sellable = Math.max(0, rawStock); // Bỏ qua warrantyQty theo yêu cầu của user
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
  } catch (err) {
    console.error('❌ Error normalizing product:', p, err);
    throw err;
  }
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
      // 1. Lấy sản phẩm từ POS API (gửi search để backend lọc, vì có hơn 5700 sản phẩm)
      // Backend sẽ tìm kiếm trong tên, mã, barcode
      console.log('[usePosProductList] Fetching with search term:', term);
      const response = await getPosProducts(term ? { search: term } : {});
      console.log('[usePosProductList] API response:', response);
      
      const items = Array.isArray(response)
        ? response
        : (response?.Items ?? response?.items ?? response?.data ?? []);
      
      console.log('[usePosProductList] Extracted items count:', items.length);

      let resultList = [];
      if (items.length > 0) {
        console.log('[usePosProductList] Normalizing products...');
        const normalized = items.map(normalizePosProduct);
        console.log('[usePosProductList] Normalized count:', normalized.length);

        // Filter sản phẩm đang hoạt động (dùng productStatus từ POS API)
        resultList = normalized.filter((p) => p.productStatus !== 'inactive' && p.productStatus !== false);
        console.log('[usePosProductList] After filtering inactive, count:', resultList.length);
        
        setProducts(resultList);
        setIsMock(false);
        return resultList;
      } else {
        // API trả về danh sách rỗng (không có sản phẩm nào) -> không fallback về mock data
        console.log('[usePosProductList] API returned empty list');
        setProducts([]);
        setIsMock(false);
        return [];
      }
    } catch (err) {
      console.error('❌ Lỗi lấy sản phẩm POS:', err);
      console.error('[usePosProductList] Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response,
        data: err.data,
      });
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
    }, 200); // Debounce 200ms để tìm kiếm không quá chậm nhưng vẫn tối ưu API calls

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchProducts]);

  // Tự động refetch danh sách sản phẩm khi người dùng quay lại tab/màn hình POS
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts(searchTerm); // Refetch với search term hiện tại
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
