import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Card } from '../../../../shared/components/Card';
import Icon from '../../../../shared/components/Icon';
import { Badge } from '../../../../shared/components/Badge';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { getPosProducts } from '../../services/posService';
import BarcodeScannerModal from '../cart/BarcodeScannerModal';

const CheckPriceTool = ({ isOpen, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setSelected(null);
    try {
      const res = await getPosProducts({ search: keyword.trim() });
      const items = res?.items || res || [];
      setProducts(items);
      if (items.length === 1) {
        setSelected(items[0]);
      }
    } catch {
      setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (product) => {
    setLoading(true);
    setSelected(null);
    try {
      // TODO (FE): gọi API lấy chi tiết giá
      await new Promise((r) => setTimeout(r, 200));
      setSelected({ ...product });
    } catch {
      setError('Không tìm thấy thông tin giá của sản phẩm này.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKeyword('');
    setProducts([]);
    setSelected(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tra cứu giá sản phẩm"
      size="md"
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              label="Tìm sản phẩm"
              placeholder="Nhập tên, mã SP hoặc barcode..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={<Icon name="search" size={16} />}
            />
            <button
              type="button"
              onClick={() => setShowCameraScanner(true)}
              title="Quét mã vạch bằng camera"
              className="absolute right-2 top-[38px] flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/50"
            >
              <Icon name="barcode_scanner" size={16} />
            </button>
          </div>
          <div className="flex items-end pb-1">
            <Button variant="primary" onClick={handleSearch} loading={loading}>
              Tìm kiếm
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
            <Icon name="error" size={16} className="flex-shrink-0 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {products.length > 0 && !selected && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-[#999999]">{products.length} sản phẩm được tìm thấy</p>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-2">
              {products.map((p) => (
                <div
                  key={p.productId || p.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-2 hover:bg-gray-50 dark:hover:bg-[#272727]"
                  onClick={() => handleSelectProduct(p)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#e5e5e5]">{p.productName || p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-[#999999]">{p.productCode || p.sku}</p>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-gray-400 dark:text-[#808080]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-lg bg-blue-50 p-2">
                <Icon name="local_offer" size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-[#e5e5e5]">
                  {selected.productName || selected.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#999999]">{selected.productCode || selected.sku}</p>
                {selected.barcode && (
                  <p className="text-xs text-gray-400 dark:text-[#808080]">Barcode: {selected.barcode}</p>
                )}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#999999]">Giá bán lẻ:</span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatCurrency(selected.retailPrice ?? selected.salePrice ?? 0)}
                    </span>
                  </div>
                  {selected.floorPrice != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#999999]">Giá sàn (tối thiểu):</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-[#b3b3b3]">
                        {formatCurrency(selected.floorPrice)}
                      </span>
                    </div>
                  )}
                  {selected.unit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-[#999999]">Đơn vị:</span>
                      <Badge variant="info">{selected.unit}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-3 text-xs text-blue-600 hover:underline"
            >
              ← Chọn sản phẩm khác
            </button>
          </Card>
        )}

        {!loading && !selected && products.length === 0 && !error && (
          <div className="py-8 text-center text-gray-400 dark:text-[#808080]">
            <Icon name="search" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nhập tên sản phẩm và nhấn Tìm kiếm</p>
          </div>
        )}
      </div>
    </Modal>

    <BarcodeScannerModal
      isOpen={showCameraScanner}
      onClose={() => setShowCameraScanner(false)}
      resultTitle="Quét barcode tra cứu giá"
      onScanComplete={(barcode) => {
        setKeyword(barcode);
        setShowCameraScanner(false);
        setTimeout(() => handleSearch(), 300);
      }}
    />
  );
};

export default CheckPriceTool;
