/** Grid sản phẩm POS - Hỗ trợ dạng lưới (mặc định) và 1 cột ngang (singleColumn). */
import ProductCard from './ProductCard';
import Icon from '../../../../shared/components/Icon';

const ProductGrid = ({
  products,
  onAddToCart,
  onOpenUnitSelector,
  loading,
  error,
  singleColumn,
}) => {
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <Icon name="error" size={40} className="mb-3 text-red-400" />
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
        <Icon name="inventory_2" size={40} className="mb-3 text-gray-300" />
        <p className="text-sm font-semibold text-gray-400">Không có sản phẩm nào</p>
      </div>
    );
  }

  if (singleColumn) {
    return (
      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onOpenUnitSelector={onOpenUnitSelector}
            horizontal
          />
        ))}
      </div>
    );
  }

  return (
    <div className="custom-scrollbar grid flex-1 grid-cols-1 items-start gap-4 overflow-y-auto pb-6 pr-2 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onOpenUnitSelector={onOpenUnitSelector}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
