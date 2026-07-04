/** Grid sản phẩm POS - Layout 3 cột, render ProductCard cho từng sản phẩm đã lọc. */
import ProductCard from './ProductCard';
import Icon from '../../../../shared/components/Icon';

const ProductGrid = ({ products, onAddToCart, loading, error }) => {
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <Icon name="error" size={40} className="text-red-400 mb-3" />
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#004785]" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <Icon name="inventory_2" size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-400">Không có sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar grid flex-1 grid-cols-1 items-start gap-4 overflow-y-auto pb-6 pr-2 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
