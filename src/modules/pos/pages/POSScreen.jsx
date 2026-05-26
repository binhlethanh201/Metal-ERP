/**
 * Trang Bán hàng chính - Container: PosSidebar + PosHeader + CategoryTabs + ProductGrid +
 * PosCartPanel + PosFooter. Kết nối usePosCart (giỏ hàng) + usePosProducts (lọc sản phẩm).
 */
import { useState, useRef, useCallback } from 'react';
import PosSidebar from '../components/PosSidebar';
import PosHeader from '../components/PosHeader';
import PosCartPanel from '../components/PosCartPanel';
import PosFooter from '../components/PosFooter';
import CategoryTabs from '../components/CategoryTabs';
import ProductGrid from '../components/ProductGrid';
import { usePosCart } from '../hooks/usePosCart';
import { usePosProducts } from '../hooks/usePosProducts';
import { posCategories, posProducts, initialCart } from '../data/posMockData';

const WAREHOUSE = '/inventory/dashboard';

const safeNavigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

const POSScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeMenu, setActiveMenu] = useState('Bán hàng');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  }, []);

  const cart = usePosCart(initialCart);
  const { filteredProducts } = usePosProducts(posProducts, selectedCategory, search);

  const handleMenuSelect = (label) => {
    setActiveMenu(label);
    showNotice(`${label} đang ở giao diện demo`);
  };

  const handleAddToCart = (product) => {
    cart.addToCart(product);
    showNotice(`Đã thêm: ${product.name}`);
  };

  const handleClearCart = () => {
    cart.clearCart();
    showNotice('Đã xóa giỏ hàng');
  };

  const handleApplyVoucher = () => {
    const ok = cart.applyVoucher();
    showNotice(ok ? 'Đã áp dụng mã giảm giá' : 'Vui lòng nhập mã giảm giá');
  };

  const handlePay = () => {
    if (cart.cart.length === 0) {
      showNotice('Giỏ hàng đang trống');
      return;
    }
    showNotice(`Thanh toán ${cart.total.toLocaleString('vi-VN')}đ bằng ${cart.paymentMethod}`);
  };

  const handleSaveDraft = () => {
    if (cart.cart.length === 0) {
      showNotice('Không có sản phẩm để lưu nháp');
      return;
    }
    showNotice('Đã lưu đơn hàng nháp');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-900">
      {notice && (
        <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {notice}
        </div>
      )}

      <PosSidebar
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onNavigateWarehouse={() => safeNavigate(WAREHOUSE)}
      />

      <PosHeader
        search={search}
        onSearchChange={setSearch}
        onBarcodeScan={() => showNotice('Đang mở chế độ quét mã')}
        onHistory={() => showNotice('Đang mở lịch sử đơn hàng')}
        onQuickAdd={() => showNotice('Đang mở thêm sản phẩm nhanh')}
      />

      <main className="fixed bottom-12 left-[260px] right-[400px] top-16 flex flex-col overflow-hidden bg-[#f7f9fc] p-6">
        <CategoryTabs
          categories={posCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
      </main>

      <PosCartPanel
        cart={cart.cart}
        voucher={cart.voucher}
        onVoucherChange={cart.setVoucher}
        onApplyVoucher={handleApplyVoucher}
        paymentMethod={cart.paymentMethod}
        onPaymentMethodChange={cart.setPaymentMethod}
        subtotal={cart.subtotal}
        discount={cart.discount}
        vat={cart.vat}
        total={cart.total}
        onClearCart={handleClearCart}
        onPay={handlePay}
        onSaveDraft={handleSaveDraft}
        onQtyChange={cart.changeQty}
        onRemoveItem={cart.removeItem}
      />

      <PosFooter />
    </div>
  );
};

export default POSScreen;
