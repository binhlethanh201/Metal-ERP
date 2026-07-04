/**
 * Hook lấy danh sách sản phẩm cho POS từ API /pos/products
 * Backend: http://localhost:5100/api/pos/products
 */
import { useState, useEffect, useCallback } from 'react';
import { getPosProducts } from '../services/posService';

// Mock data fallback khi API không hoạt động
const MOCK_POS_PRODUCTS = [
  {
    productId: '1',
    productCode: 'SP001',
    productName: 'Búa sắt cán gỗ 500g',
    barcode: '8934001',
    unit: 'Cái',
    retailPrice: 120000,
    availableStock: 50,
    categoryName: 'Dụng cụ cầm tay',
  },
  {
    productId: '2',
    productCode: 'SP002',
    productName: 'Tua vít 6pcs đa năng',
    barcode: '8934002',
    unit: 'Bộ',
    retailPrice: 85000,
    availableStock: 30,
    categoryName: 'Dụng cụ cầm tay',
  },
  {
    productId: '3',
    productCode: 'SP003',
    productName: 'Kìm cắt 6 inch',
    barcode: '8934003',
    unit: 'Cái',
    retailPrice: 65000,
    availableStock: 25,
    categoryName: 'Dụng cụ cầm tay',
  },
  {
    productId: '4',
    productCode: 'SP004',
    productName: 'Thước kéo 5m',
    barcode: '8934007',
    unit: 'Cái',
    retailPrice: 80000,
    availableStock: 40,
    categoryName: 'Dụng cụ đo lường',
  },
  {
    productId: '5',
    productCode: 'SP005',
    productName: 'Ống nước PVC 34mm',
    barcode: '8934018',
    unit: 'Cây',
    retailPrice: 95000,
    availableStock: 100,
    categoryName: 'Ống và phụ kiện',
  },
];

const normalizePosProduct = (p) => ({
  productId: p.productId || p.id || '',
  productCode: p.productCode || '',
  productName: p.productName || p.name || '',
  barcode: p.barcode || '',
  unit: p.unit || 'Cái',
  retailPrice: parseFloat(p.retailPrice || p.unitPrice || p.salePrice || p.price || 0),
  availableStock: parseFloat(p.availableStock || p.quantity || p.stock || 0),
  categoryName: p.categoryName || p.category || '',
  image: p.imageUrl || p.image || '',
  status: (p.availableStock || p.quantity || p.stock || 0) > 0 ? 'Còn hàng' : 'Hết hàng',
});

export const usePosProductList = (searchTerm = '') => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const fetchProducts = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosProducts(term ? { search: term } : {});
      const items = Array.isArray(response) ? response : response?.items || response?.data || [];

      if (items.length > 0) {
        setProducts(items.map(normalizePosProduct));
        setIsMock(false);
      } else {
        setProducts(MOCK_POS_PRODUCTS.map(normalizePosProduct));
        setIsMock(true);
      }
    } catch (err) {
      console.error('Lỗi lấy sản phẩm POS:', err);
      setError(err.message || 'Không thể tải sản phẩm');
      setProducts(MOCK_POS_PRODUCTS.map(normalizePosProduct));
      setIsMock(true);
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

  return {
    products,
    loading,
    error,
    isMock,
    refetch: fetchProducts,
  };
};

export default usePosProductList;
