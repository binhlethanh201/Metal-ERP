/**
 * Hook lọc sản phẩm POS theo danh mục.
 * Backend đã lọc theo search term rồi, frontend chỉ lọc thêm theo category.
 * Trả về filteredProducts (memoized).
 */
import { useMemo } from 'react';

export const usePosProducts = (products, selectedCategory, search) => {
  const filteredProducts = useMemo(() => {
    // Backend đã lọc theo search term, frontend chỉ cần lọc theo category
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      return matchCategory;
    });
  }, [products, selectedCategory]);

  return { filteredProducts };
};
