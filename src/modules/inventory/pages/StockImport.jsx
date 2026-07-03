import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  createInwardInventory,
  confirmInwardInventory,
  getInwardInventories,
  getProducts,
} from '../services/inventoryService';
import { getSuppliers } from '../services/supplierService';

// Import các sub-components đã tách
import { ImportItemsTable } from '../components/stock/ImportItemsTable';
import { ImportTicketForm } from '../components/stock/ImportTicketForm';
import { InventoryHistoryCard } from '../components/stock/InventoryHistoryCard';

const fallbackProducts = [
  {
    id: 'prod-001',
    productCode: 'SP-001',
    productName: 'Thép tấm 10mm',
    unitName: 'Tấm',
    costPrice: 50000,
  },
  {
    id: 'prod-002',
    productCode: 'SP-002',
    productName: 'Inox 304 tấm 1.5mm',
    unitName: 'Tấm',
    costPrice: 76000,
  },
];

const fallbackSuppliers = [
  { id: 'sup-001', name: 'Công ty Hòa Phát', phone: '0901234567' },
  { id: 'sup-002', name: 'Công ty Nam Kim', phone: '0912345678' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val || 0));

const extractList = (res) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const normalizeInwardRow = (item, index) => {
  const itemsList = Array.isArray(item?.items) ? item.items : [];
  const totalQty = itemsList.reduce((acc, curr) => acc + Number(curr?.quantity || 0), 0);
  const firstProduct = itemsList[0]?.productName || 'Hàng hóa nhập kho';

  return {
    id: item?.stockTicketId || item?.id || `IMP-${index + 1}`,
    stockTicketId: item?.stockTicketId || item?.id,
    ticketCode: item?.ticketCode || `PN-${index + 1}`,
    productName:
      itemsList.length > 1 ? `${firstProduct} (...và ${itemsList.length - 1} khác)` : firstProduct,
    quantity: totalQty || item?.quantity || 0,
    date: item?.createdAt || item?.Date || '',
    reason: item?.reason || item?.note || '',
    status: item?.status || 'COMPLETED',
    cancelReason: item?.cancelReason || '',
  };
};

export const StockImport = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const [suppliers, setSuppliers] = useState(fallbackSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState(fallbackSuppliers[0]);
  const [items, setItems] = useState([{ ...fallbackProducts[0], quantity: 10 }]);
  const [inwardType, setInwardType] = useState(1);
  const [note, setNote] = useState('Nhập hàng định kỳ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State lịch sử phiếu nhập
  const [inwardsList, setInwardsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadInwardHistory = useCallback(async (filterParams = {}) => {
    setIsLoadingHistory(true);
    try {
      const queryParams = {
        pageNumber: 1,
        pageSize: 20,
        ...filterParams,
      };
      const res = await getInwardInventories(queryParams);
      setInwardsList(extractList(res).map(normalizeInwardRow).filter(Boolean));
    } catch {
      setInwardsList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [prodRes, supRes] = await Promise.all([
          getProducts({ pageNumber: 1, pageSize: 50 }),
          getSuppliers({ pageNumber: 1, pageSize: 50 }),
        ]);
        const pList = extractList(prodRes);
        const sList = extractList(supRes);
        if (pList.length > 0) setProducts(pList);
        if (sList.length > 0) {
          setSuppliers(sList);
          setSelectedSupplier(sList[0]);
        }
        setStatus({ type: 'success', message: 'Đã tải dữ liệu hệ thống' });
      } catch {
        setStatus({ type: 'info', message: 'Đang dùng dữ liệu cục bộ' });
      } finally {
        setIsLoadingData(false);
        loadInwardHistory();
      }
    };
    loadInitData();
  }, [loadInwardHistory]);

  const addProductToTicket = useCallback((product) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === product.id);
      if (existing) {
        return current.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...current, { ...product, quantity: 1, costPrice: product.costPrice || 0 }];
    });
    setStatus({ type: 'success', message: `Đã thêm/tăng số lượng cho ${product.productName}` });
  }, []);

  const updateItem = (id, field, value) => {
    setItems((curr) =>
      curr.map((item) => (item.id === id ? { ...item, [field]: Number(value || 0) } : item))
    );
  };

  const removeItem = (id) => {
    setItems((curr) => curr.filter((i) => i.id !== id));
  };

  const totals = useMemo(
    () => ({
      totalLines: items.length,
      totalQuantity: items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
      totalAmount: items.reduce(
        (sum, i) => sum + Number(i.quantity || 0) * Number(i.costPrice || 0),
        0
      ),
    }),
    [items]
  );

  const handleFinish = async (isDraft = false) => {
    if (!items.length) {
      setStatus({ type: 'error', message: 'Vui lòng chọn ít nhất 1 sản phẩm trước khi hoàn tất' });
      return;
    }

    const parseGuid = (val) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val))
        ? String(val)
        : null;

    const payload = {
      inwardType,
      supplierId: parseGuid(selectedSupplier?.id),
      reason: note || 'Nhập kho',
      note,
      items: items.map((i) => ({
        id: parseGuid(i.id),
        quantity: Number(i.quantity || 0),
        costPrice: Number(i.costPrice || 0),
        note: '',
      })),
    };

    setIsSubmitting(true);
    setStatus({
      type: 'info',
      message: isDraft ? 'Đang tạo phiếu nháp...' : 'Đang tạo và duyệt phiếu kho...',
    });

    try {
      // Bước 1: Tạo phiếu PENDING
      const res = await createInwardInventory(payload);
      const ticketId = res?.data?.ticketId || res?.data?.stockTicketId;

      // Bước 2: NẾU KHÔNG PHẢI LƯU NHÁP -> Gọi tiếp API confirm để cộng kho
      if (!isDraft && ticketId) {
        setStatus({ type: 'info', message: 'Đang xác nhận cộng tồn kho thực tế...' });
        await confirmInwardInventory(ticketId);
        setStatus({
          type: 'success',
          message: `Đã hoàn tất & cộng kho! Mã phiếu: ${res?.data?.ticketCode || ticketId}`,
        });
      } else {
        // Trường hợp lưu nháp (PENDING)
        setStatus({
          type: 'success',
          message: `Đã lưu nháp phiếu ${res?.data?.ticketCode || ticketId}. Tồn kho chưa thay đổi.`,
        });
      }

      setItems([]);
      loadInwardHistory(); // Tải lại bảng lịch sử
    } catch (error) {
      const errList = error?.response?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(' | ')
        : error?.message || 'Lỗi khi tạo phiếu';
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in mt-8 w-full space-y-6 duration-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nhập kho</h1>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
          {isLoadingData ? 'Đang tải dữ liệu...' : 'Sẵn sàng tạo phiếu'}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[7fr_3fr]">
        <ImportItemsTable
          items={items}
          products={products}
          onAddProduct={addProductToTicket}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onAddSample={() => addProductToTicket(products[0] || fallbackProducts[0])}
          formatCurrency={formatCurrency}
        />

        <ImportTicketForm
          inwardType={inwardType}
          onChangeInwardType={setInwardType}
          suppliers={suppliers}
          selectedSupplier={selectedSupplier}
          onSelectSupplier={setSelectedSupplier}
          note={note}
          onChangeNote={setNote}
          totals={totals}
          status={status}
          isSubmitting={isSubmitting}
          onSubmit={handleFinish}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Lịch sử nhập kho kèm nút Hủy chuẩn API */}
      <InventoryHistoryCard
        title="Lịch sử phiếu nhập kho gần đây"
        type="INWARD"
        tickets={inwardsList}
        isLoading={isLoadingHistory}
        onReload={loadInwardHistory}
        onNotify={(noti) => setStatus({ type: noti.type, message: noti.message })}
      />
    </div>
  );
};

export default StockImport;
