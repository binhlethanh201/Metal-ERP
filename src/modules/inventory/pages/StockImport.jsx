import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { createImport, getImports, getProducts } from '../services/inventoryService';

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

const normalizeImportRow = (item, index) => ({
  id: item?.id || item?.Id || item?.importId || item?.ImportId || `IMP-${index + 1}`,
  productName:
    item?.productName ||
    item?.ProductName ||
    item?.product?.name ||
    item?.Product?.ProductName ||
    '',
  quantity: item?.quantity ?? item?.Quantity ?? item?.amount ?? item?.Amount ?? 0,
  date: item?.date || item?.Date || item?.createdAt || item?.CreatedAt || '',
  notes: item?.notes || item?.Notes || item?.note || item?.Note || '',
});

const buildImportPayload = (form) => ({
  ProductId: form.productId || null,
  ProductName: form.productName || '',
  Quantity: Number(form.quantity || 0),
  Date: form.date || new Date().toISOString(),
  Note: form.notes || '',
});

export const StockImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imports, setImports] = useState([]);
  const [products, setProducts] = useState([]);
  const [isRemoteData, setIsRemoteData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    date: '',
    notes: '',
  });

  const importColumns = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'productName', header: 'Sản phẩm', width: '30%' },
    { key: 'quantity', header: 'Số lượng', width: '15%' },
    { key: 'date', header: 'Ngày', width: '20%' },
    { key: 'notes', header: 'Ghi chú', width: '25%' },
  ];

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [importsResponse, productsResponse] = await Promise.all([
          getImports({ Page: 1, PageSize: 50 }),
          getProducts({ Page: 1, PageSize: 100 }),
        ]);

        if (!active) return;

        const importItems = extractList(importsResponse).map(normalizeImportRow).filter(Boolean);
        const productItems = extractList(productsResponse);

        setImports(importItems);
        setProducts(productItems);
        setIsRemoteData(true);
        setStatusMessage('Đã đồng bộ dữ liệu nhập kho từ API');
      } catch (error) {
        if (!active) return;

        setImports([]);
        setProducts([]);
        setIsRemoteData(false);
        setStatusMessage(
          error?.status === 401 ? 'API nhập kho yêu cầu JWT' : 'Đang dùng dữ liệu cục bộ'
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
    const totalQuantity = imports.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return {
      totalImports: imports.length,
      totalQuantity,
      monthlyCount: imports.length,
    };
  }, [imports]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextRow = {
      id: `IMP-${Date.now()}`,
      productName:
        form.productName ||
        products.find((product) => String(product.id || product.Id) === String(form.productId))
          ?.productName ||
        products.find((product) => String(product.id || product.Id) === String(form.productId))
          ?.ProductName ||
        'Sản phẩm chưa đặt tên',
      quantity: Number(form.quantity || 0),
      date: form.date || new Date().toISOString().slice(0, 10),
      notes: form.notes || '',
    };

    try {
      if (isRemoteData) {
        await createImport(buildImportPayload(form));
        const response = await getImports({ Page: 1, PageSize: 50 });
        setImports(extractList(response).map(normalizeImportRow).filter(Boolean));
      } else {
        setImports((prev) => [nextRow, ...prev]);
      }

      setStatusMessage('Đã lưu phiếu nhập kho');
      setForm({ productId: '', productName: '', quantity: '', date: '', notes: '' });
      setIsModalOpen(false);
    } catch (error) {
      setStatusMessage(error?.message || 'Không thể lưu phiếu nhập kho');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhập kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận hàng nhập từ nhà cung cấp</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setIsModalOpen(true);
            setStatusMessage('');
          }}
        >
          + Nhập hàng
        </Button>
      </div>

      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
        {isLoading
          ? 'Đang tải dữ liệu nhập kho...'
          : statusMessage || 'Sẵn sàng tạo phiếu nhập mới'}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.totalImports}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng lần nhập</p>
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

      <Card header="Lịch sử nhập kho">
        <Table columns={importColumns} data={imports} emptyMessage="Chưa có lần nhập nào" />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nhập kho" size="lg">
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
            label="Ngày nhập *"
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
          <Input
            label="Ghi chú"
            placeholder="Ghi chú thêm..."
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
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
              Lưu phiếu nhập
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockImport;
