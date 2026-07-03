/**
 * Trang Xuất kho - Form tạo phiếu xuất kho & Tích hợp Lịch sử có thao tác Hủy chuẩn API mới.
 */
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import {
  createOutwardInventory,
  confirmOutwardInventory,
  getOutwardInventories,
  getProducts,
} from '../services/inventoryService';
import { InventoryHistoryCard } from '../components/stock/InventoryHistoryCard';

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.items)) return response.result.items;
  return [];
};

// Chuẩn hóa dữ liệu đảm bảo truyền đủ stockTicketId và cancelReason cho thao tác Hủy
const normalizeExportRow = (item, index) => {
  const itemsList = Array.isArray(item?.items) ? item.items : [];
  const totalQuantity = itemsList.reduce((acc, curr) => acc + Number(curr?.quantity || 0), 0);
  const firstProductName = itemsList[0]?.productName || 'Sản phẩm xuất kho';

  return {
    id: item?.stockTicketId || item?.id || `EXP-${index + 1}`,
    stockTicketId: item?.stockTicketId || item?.id,
    ticketCode: item?.ticketCode || `EX-${index + 1}`,
    productName:
      itemsList.length > 1
        ? `${firstProductName} (...và ${itemsList.length - 1} khác)`
        : firstProductName,
    quantity: totalQuantity || item?.quantity || 0,
    date: item?.createdAt || item?.Date || '',
    reason: item?.reason || item?.Reason || '',
    status: item?.status || 'COMPLETED',
    cancelReason: item?.cancelReason || '',
  };
};

export const StockExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exports, setExports] = useState([]);
  const [products, setProducts] = useState([]);
  const [isRemoteData, setIsRemoteData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [form, setForm] = useState({
    outwardType: 1, // 1 = ReturnToSupplier, 2 = WriteOff, 3 = Transfer
    branchProductId: '',
    productName: '',
    quantity: '',
    reason: '',
    note: '',
  });

  // Hàm loadData nhận filterParams
  const loadData = async (filterParams = {}) => {
    setIsLoading(true);
    try {
      const queryParams = {
        pageNumber: 1,
        pageSize: 50,
        ...filterParams, // Nối bộ lọc người dùng chọn vào query
      };

      const [exportsResponse, productsResponse] = await Promise.all([
        getOutwardInventories(queryParams),
        getProducts({ pageNumber: 1, pageSize: 100 }),
      ]);

      const exportItems = extractList(exportsResponse).map(normalizeExportRow).filter(Boolean);
      const productItems = extractList(productsResponse);

      setExports(exportItems);
      setProducts(productItems);
      setIsRemoteData(true);
      setStatusMessage('Đã đồng bộ dữ liệu xuất kho từ API');
    } catch (error) {
      setExports([]);
      setProducts([]);
      setIsRemoteData(false);
      setStatusMessage(
        error?.status === 401 ? 'API xuất kho yêu cầu JWT' : 'Đang dùng dữ liệu cục bộ'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalQuantity = exports.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return {
      totalExports: exports.length,
      totalQuantity,
      monthlyCount: exports.length,
    };
  }, [exports]);

  // Luồng 2 bước: Tạo phiếu (PENDING) -> Xác nhận (Trừ kho)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    if (!form.branchProductId && isRemoteData) {
      setStatusMessage('Lỗi: Vui lòng chọn một sản phẩm từ danh sách');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isRemoteData) {
        const payload = {
          outwardType: Number(form.outwardType),
          reason: form.reason || 'Xuất kho',
          note: form.note || form.reason || '',
          items: [
            {
              branchProductId: form.branchProductId,
              quantity: Number(form.quantity || 0),
            },
          ],
        };

        setStatusMessage('Đang tạo phiếu xuất kho (Trạng thái chờ)...');
        const createRes = await createOutwardInventory(payload);
        const ticketId = createRes?.data?.ticketId || createRes?.data?.stockTicketId;

        if (ticketId) {
          setStatusMessage('Đang xác nhận để trừ tồn kho...');
          await confirmOutwardInventory(ticketId);
          setStatusMessage('Xuất kho thành công! Đã trừ tồn kho.');
        } else {
          setStatusMessage('Tạo phiếu thành công.');
        }

        await loadData();
      } else {
        const nextRow = {
          id: `EXP-${Date.now()}`,
          stockTicketId: `EXP-${Date.now()}`,
          ticketCode: `EX-${exports.length + 1}`,
          productName: form.productName || 'Sản phẩm cục bộ',
          quantity: Number(form.quantity || 0),
          date: new Date().toISOString(),
          reason: form.reason || '',
          status: 'COMPLETED',
        };
        setExports((prev) => [nextRow, ...prev]);
        setStatusMessage('Đã lưu phiếu xuất kho cục bộ');
      }

      setForm({
        outwardType: 1,
        branchProductId: '',
        productName: '',
        quantity: '',
        reason: '',
        note: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      const errorMsgList = error?.response?.data?.errors;
      const fallbackMessage = Array.isArray(errorMsgList)
        ? errorMsgList.join(' | ')
        : error?.message || 'Không thể tạo hoặc xác nhận phiếu xuất kho';
      setStatusMessage(`Lỗi: ${fallbackMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xuất kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận và quản lý các phiếu xuất từ kho</p>
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

      <div
        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${
          statusMessage.includes('Lỗi:')
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        {isLoading
          ? 'Đang tải dữ liệu xuất kho...'
          : statusMessage || 'Sẵn sàng tạo phiếu xuất mới'}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.totalExports}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng phiếu xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.totalQuantity}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{summary.monthlyCount}</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      {/*  INVENTORY HISTORY CARD */}
      <InventoryHistoryCard
        title="Lịch sử phiếu xuất kho"
        type="OUTWARD"
        tickets={exports}
        isLoading={isLoading}
        onReload={loadData}
        onNotify={(notifyObj) => setStatusMessage(notifyObj.message)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo phiếu xuất kho"
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Loại xuất kho</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              value={form.outwardType}
              onChange={(event) =>
                setForm((curr) => ({ ...curr, outwardType: Number(event.target.value) }))
              }
            >
              <option value={1}>Trả hàng cho Nhà cung cấp (ReturnToSupplier)</option>
              <option value={2}>Xuất hủy / Hao hụt (WriteOff)</option>
              <option value={3}>Xuất sử dụng nội bộ / Điều chuyển (Transfer)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Chọn sản phẩm xuất *</label>
            <select
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              value={form.branchProductId}
              onChange={(event) => {
                const targetId = event.target.value;
                const selectedProduct = products.find(
                  (p) => String(p.branchProductId || p.id || p.Id) === targetId
                );
                setForm((current) => ({
                  ...current,
                  branchProductId: targetId,
                  productName:
                    selectedProduct?.productName ||
                    selectedProduct?.ProductName ||
                    current.productName,
                }));
              }}
            >
              <option value="">-- Chọn sản phẩm từ chi nhánh --</option>
              {products.map((product) => {
                const idValue = product.branchProductId || product.id || product.Id;
                return (
                  <option key={idValue} value={idValue}>
                    {product.productName || product.ProductName} (Mã: {product.productCode || 'N/A'}
                    )
                  </option>
                );
              })}
            </select>
          </div>

          <Input
            label="Số lượng xuất *"
            type="number"
            placeholder="Nhập số lượng > 0"
            min="1"
            required
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({ ...current, quantity: event.target.value }))
            }
          />

          <Input
            label="Lý do xuất kho *"
            placeholder="VD: Trả lô hàng hết hạn lô 001 cho NCC"
            required
            value={form.reason}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          />

          <Input
            label="Ghi chú thêm"
            placeholder="Ghi chú chi tiết (không bắt buộc)"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xuất kho'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockExport;
