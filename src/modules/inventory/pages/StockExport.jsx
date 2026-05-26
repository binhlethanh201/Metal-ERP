/**
 * Trang Xuất kho - Form tạo phiếu xuất kho.
 */
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { createExport, getExports, getProducts } from '../services/inventoryService';

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

const normalizeExportRow = (item, index) => ({
  id: item?.id || item?.Id || item?.exportId || item?.ExportId || `EXP-${index + 1}`,
  productName:
    item?.productName ||
    item?.ProductName ||
    item?.product?.name ||
    item?.Product?.ProductName ||
    '',
  quantity: item?.quantity ?? item?.Quantity ?? item?.amount ?? item?.Amount ?? 0,
  date: item?.date || item?.Date || item?.createdAt || item?.CreatedAt || '',
  reason: item?.reason || item?.Reason || item?.note || item?.Note || '',
});

const buildExportPayload = (form) => ({
  ProductId: form.productId || null,
  ProductName: form.productName || '',
  Quantity: Number(form.quantity || 0),
  Date: form.date || new Date().toISOString(),
  Reason: form.reason || '',
});

export const StockExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exports, setExports] = useState([]);
  const [products, setProducts] = useState([]);
  const [isRemoteData, setIsRemoteData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    date: '',
    reason: '',
  });

  const exportColumns = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'productName', header: 'Sản phẩm', width: '30%' },
    { key: 'quantity', header: 'Số lượng', width: '15%' },
    { key: 'date', header: 'Ngày', width: '20%' },
    { key: 'reason', header: 'Lý do', width: '25%' },
  ];

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [exportsResponse, productsResponse] = await Promise.all([
          getExports({ Page: 1, PageSize: 50 }),
          getProducts({ Page: 1, PageSize: 100 }),
        ]);

        if (!active) return;

        const exportItems = extractList(exportsResponse).map(normalizeExportRow).filter(Boolean);
        const productItems = extractList(productsResponse);

        setExports(exportItems);
        setProducts(productItems);
        setIsRemoteData(true);
        setStatusMessage('Đã đồng bộ dữ liệu xuất kho từ API');
      } catch (error) {
        if (!active) return;

        setExports([]);
        setProducts([]);
        setIsRemoteData(false);
        setStatusMessage(
          error?.status === 401 ? 'API xuất kho yêu cầu JWT' : 'Đang dùng dữ liệu cục bộ'
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalQuantity = exports.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return {
      totalExports: exports.length,
      totalQuantity,
      monthlyCount: exports.length,
    };
  }, [exports]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextRow = {
      id: `EXP-${Date.now()}`,
      productName:
        form.productName ||
        products.find((product) => String(product.id || product.Id) === String(form.productId))
          ?.productName ||
        products.find((product) => String(product.id || product.Id) === String(form.productId))
          ?.ProductName ||
        'Sản phẩm chưa đặt tên',
      quantity: Number(form.quantity || 0),
      date: form.date || new Date().toISOString().slice(0, 10),
      reason: form.reason || '',
    };

    try {
      if (isRemoteData) {
        await createExport(buildExportPayload(form));
        const response = await getExports({ Page: 1, PageSize: 50 });
        setExports(extractList(response).map(normalizeExportRow).filter(Boolean));
      } else {
        setExports((prev) => [nextRow, ...prev]);
      }

      setStatusMessage('Đã lưu phiếu xuất kho');
      setForm({ productId: '', productName: '', quantity: '', date: '', reason: '' });
      setIsModalOpen(false);
    } catch (error) {
      setStatusMessage(error?.message || 'Không thể lưu phiếu xuất kho');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xuất kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận hàng xuất từ kho</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setIsModalOpen(true);
            setStatusMessage('');
          }}
        >
          + Xuất hàng
        </Button>
      </div>

      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
        {isLoading
          ? 'Đang tải dữ liệu xuất kho...'
          : statusMessage || 'Sẵn sàng tạo phiếu xuất mới'}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.totalExports}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng lần xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.totalQuantity}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.monthlyCount}</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      <Card header="Lịch sử xuất kho">
        <Table columns={exportColumns} data={exports} emptyMessage="Chưa có lần xuất nào" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Xuất kho" size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Chọn sản phẩm</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              value={form.productId}
              onChange={(event) => {
                const selectedProduct = products.find(
                  (product) => String(product.id || product.Id) === event.target.value
                );
                setForm((current) => ({
                  ...current,
                  productId: event.target.value,
                  productName:
                    selectedProduct?.productName ||
                    selectedProduct?.ProductName ||
                    current.productName,
                }));
              }}
            >
              <option value="">Chọn từ danh sách</option>
              {products.map((product) => (
                <option key={product.id || product.Id} value={product.id || product.Id}>
                  {product.productName || product.ProductName || product.name || product.Name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tên sản phẩm"
            placeholder="Nhập tên nếu chưa có trong danh sách"
            value={form.productName}
            onChange={(event) =>
              setForm((current) => ({ ...current, productName: event.target.value }))
            }
          />
          <Input
            label="Số lượng *"
            type="number"
            placeholder="0"
            min="1"
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({ ...current, quantity: event.target.value }))
            }
          />
          <Input
            label="Ngày xuất *"
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
          <Input
            label="Lý do xuất"
            placeholder="VD: Bán hàng, hư hỏng, mất..."
            value={form.reason}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </button>
            <Button type="submit" variant="primary">
              Lưu phiếu xuất
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockExport;
