/**
 * Hook lọc sản phẩm POS theo danh mục + từ khóa tìm kiếm (tên, SKU).
 * Trả về filteredProducts (memoized).
 */
import { useMemo } from 'react';

export const usePosProducts = (products, selectedCategory, search) => {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, search]);

  return { filteredProducts };
};
