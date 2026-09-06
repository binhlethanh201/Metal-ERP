import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Table } from '../../../../shared/components/Table';
import Icon from '../../../../shared/components/Icon';
import { getPosProducts } from '../../services/posService';
import BarcodeScannerModal from '../cart/BarcodeScannerModal';

const CheckStockTool = ({ isOpen, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stock, setStock] = useState(null);
  const [error, setError] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setSelected(null);
    setStock(null);
    try {
      const res = await getPosProducts({ search: keyword.trim() });
      const items = res?.items || res || [];
      setProducts(items);
      if (items.length === 1) {
        setSelected(items[0]);
        await loadStock(items[0]);
      }
    } catch {
      setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadStock = async (product) => {
    setLoading(true);
    setStock(null);
    try {
      // TODO (FE): gọi API lấy thông tin tồn kho
      await new Promise((r) => setTimeout(r, 200));
      setStock({
        availableStock: product.availableStock || product.stock || 0,
        locations: [
          { name: 'Kho trung tâm', quantity: product.availableStock || product.stock || 0 }
        ]
      });
    } catch {
      setError('Không tìm thấy thông tin tồn kho của sản phẩm này.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (product) => {
    setSelected(product);
    await loadStock(product);
  };

  const handleClose = () => {
    setKeyword('');
    setProducts([]);
    setSelected(null);
    setStock(null);
    setError('');
    onClose();
  };

  const columns = [
    {
      key: 'branchName',
      header: 'Chi nhánh',
      render: (_, row) => <span className="font-medium">{row.branchName || '—'}</span>,
    },
    {
      key: 'availableStock',
      header: 'Còn trong kho',
      render: (_, row) => {
        const val = Number(row.availableStock || 0);
        return (
          <span className={`font-semibold ${val <= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {val.toFixed(0)}
          </span>
        );
      },
    },
    {
      key: 'inTransitStock',
      header: 'Đang chuyển',
      render: (_, row) => (
        <span className="text-amber-600 font-medium">{Number(row.inTransitStock || 0).toFixed(0)}</span>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tra cứu tồn kho"
      size="lg"
      footer={
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search */}
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:border-red-800">
            <Icon name="error" size={16} className="text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Product List */}
        {products.length > 0 && !selected && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-[#999999]">{products.length} sản phẩm được tìm thấy</p>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {products.map((p) => (
                <div
                  key={p.productId || p.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer border dark:hover:bg-[#272727]"
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

        {/* Stock Result */}
        {selected && stock && (
          <div className="space-y-3">
            {/* Header Summary */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="inventory_2" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-[#e5e5e5]">{selected.productName || selected.name}</p>
                <p className="text-xs text-gray-500 dark:text-[#999999]">
                  {selected.productCode || selected.sku} — Tổng: {Number(stock.inStockQty || 0).toFixed(0)} sản phẩm
                </p>
              </div>
              <div className="ml-auto flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-[#999999]">Còn kho</p>
                  <p className="text-lg font-bold text-green-600">{Number(stock.inStockQty || 0).toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-[#999999]">Đang chuyển</p>
                  <p className="text-lg font-bold text-amber-600">{Number(stock.inTransitQty || 0).toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Per-branch Table */}
            <Table
              columns={columns}
              data={(stock.byBranch || []).map((b, i) => ({ ...b, key: b.branchId || i }))}
              loading={loading}
              emptyMessage="Không có dữ liệu tồn kho theo chi nhánh."
            />

            <button
              type="button"
              onClick={() => { setSelected(null); setStock(null); }}
              className="text-xs text-blue-600 hover:underline"
            >
              ← Chọn sản phẩm khác
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !selected && products.length === 0 && !error && (
          <div className="text-center py-8 text-gray-400 dark:text-[#808080]">
            <Icon name="inventory_2" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nhập tên sản phẩm và nhấn Tìm kiếm</p>
          </div>
        )}
      </div>
    </Modal>

    <BarcodeScannerModal
      isOpen={showCameraScanner}
      onClose={() => setShowCameraScanner(false)}
      resultTitle="Quét barcode tra cứu tồn kho"
      onScanComplete={(barcode) => {
        setKeyword(barcode);
        setShowCameraScanner(false);
        setTimeout(() => handleSearch(), 300);
      }}
    />
  );
};

export default CheckStockTool;
