import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  createInwardInventory,
  confirmInwardInventory,
  getInwardInventories,
  getProducts,
} from '../services/inventoryService';
import { getSuppliers } from '../services/supplierService';

import { ImportItemsTable } from '../components/stock/ImportItemsTable';
import { ImportTicketForm } from '../components/stock/ImportTicketForm';
import { InventoryHistoryCard } from '../components/stock/InventoryHistoryCard';
import { EditProductModal } from '../components/product/EditProductModal';
import { createProduct } from '../services/productService';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import Icon from '../../../shared/components/Icon';

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

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (!Number.isFinite(num) || num > 1e15) return '---';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const extractList = (res) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const normalizeInwardRow = (item, index) => {
  const itemsList = Array.isArray(item?.items) ? item.items : [];
  const totalQty = itemsList.reduce((acc, curr) => acc + Number(curr?.quantity || 0), 0);
  const productNames = itemsList.map((i) => i.productName || '').filter(Boolean);
  const quantities = itemsList.map((i) => Number(i.quantity || 0));
  return {
    id: item?.stockTicketId || item?.id || `IMP-${index + 1}`,
    stockTicketId: item?.stockTicketId || item?.id,
    ticketCode: item?.ticketCode || `PN-${index + 1}`,
    productName: productNames.length > 0 ? productNames.join('\n') : 'Hàng hóa nhập kho',
    quantityDisplay: quantities.length > 0
      ? quantities.map((q) => q.toLocaleString('vi-VN')).join('\n')
      : String(item?.quantity || 0),
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

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('stockImport_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inwardType, setInwardType] = useState(
    () => Number(localStorage.getItem('stockImport_type')) || 1
  );
  const isCustomerReturn = inwardType === 2;
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isCustomerReturn && !note.trim()) setNote('Khách hàng trả');
  }, [inwardType]); // eslint-disable-line react-hooks/exhaustive-deps

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });
  const [globalError, setGlobalError] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lưu trạng thái mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('stockImport_items', JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem('stockImport_type', inwardType);
  }, [inwardType]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [inwardsList, setInwardsList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadInwardHistory = useCallback(async (filterParams = {}) => {
    setIsLoadingHistory(true);
    try {
      const queryParams = { pageNumber: 1, pageSize: 100, ...filterParams };
      const res = await getInwardInventories(queryParams);
      setInwardsList(extractList(res).map(normalizeInwardRow).filter(Boolean));
    } catch {
      setInwardsList([]);
      setGlobalError('Không thể tải lịch sử phiếu nhập kho.');
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
        }
        setStatus({ type: 'success', message: 'Đã tải dữ liệu hệ thống' });
      } catch {
        setGlobalError('Không thể tải dữ liệu sản phẩm hoặc nhà cung cấp.');
      } finally {
        setIsLoadingData(false);
        loadInwardHistory();
      }
    };
    loadInitData();
  }, [loadInwardHistory]);

  const getItemKey = (item) =>
    item?.branchProductId || item?.productId || item?.productCode || item?.id || '';

  const handleImportRows = useCallback((rows) => {
    if (!rows || rows.length === 0) return;

    let importedCount = 0;
    let newCount = 0;

    setItems((current) => {
      const updated = [...current];

      for (const row of rows) {
        if (!row) continue;

        const matched = row.matchedProduct;
        let key;
        let importItem;

        if (matched) {
          key = getItemKey(matched);
          importItem = {
            ...matched,
            id: key,
            quantity: Number(row.quantity || 0),
            costPrice: Number(row.costPrice || 0),
          };
        } else {
          key = row.productCode || `new-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
          importItem = {
            id: key,
            productCode: row.productCode || '',
            productName: row.productName || '',
            unitName: row.unitName || row.unit || '',
            unit: row.unitName || row.unit || '',
            quantity: Number(row.quantity || 0),
            costPrice: Number(row.costPrice || 0),
          };
          newCount++;
        }

        const existingIdx = updated.findIndex((i) =>
          key ? getItemKey(i) === key : false
        );

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: Number(row.quantity || 0),
            costPrice: Number(row.costPrice || 0),
          };
        } else {
          updated.push(importItem);
        }

        importedCount++;
      }

      return updated;
    });

    const msg =
      newCount > 0
        ? `Đã import ${importedCount} dòng (${newCount} mã mới từ file Excel).`
        : `Đã import ${importedCount} dòng từ file Excel.`;
    setStatus({ type: 'success', message: msg });
  }, []);

  const addProductToTicket = useCallback((product) => {
    setItems((current) => {
      const key = getItemKey(product);
      if (!key) return current;
      const existing = current.find((i) => getItemKey(i) === key);
      if (existing) {
        return current.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: Number(i.quantity) + 1 } : i
        );
      }
      return [...current, { ...product, id: key, quantity: 1, costPrice: product.costPrice || 0 }];
    });
    setStatus({ type: 'success', message: `Đã thêm/tăng số lượng cho ${product.productName}` });
  }, []);

  const updateItem = (id, field, value) => {
    setItems((curr) =>
      curr.map((item) =>
        getItemKey(item) === id
          ? {
              ...item,
              [field]: field === 'quantity' || field === 'costPrice' ? Number(value || 0) : value,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((curr) => curr.filter((i) => getItemKey(i) !== id));
  };

  const totals = useMemo(
    () => ({
      totalLines: items.length,
      totalQuantity: items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
      totalAmount: items.reduce((sum, i) => {
        const qty = Number(i.quantity || 0);
        const price = Number(i.costPrice || 0);
        if (qty > 999999 || price > 999999999) return sum;
        const lineTotal = qty * price;
        return sum + (lineTotal > 1e15 ? 0 : lineTotal);
      }, 0),
    }),
    [items]
  );

  const openModal = () => {
    setStatus({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });
    setIsModalOpen(true);
  };

  const handleFinish = async (isDraft = false) => {
    if (!items.length) {
      setStatus({ type: 'error', message: 'Vui lòng chọn ít nhất 1 sản phẩm trước khi hoàn tất' });
      return;
    }

    const parseId = (val) => (val != null && String(val).trim() ? String(val).trim() : null);

    const payload = {
      inwardType,
      supplierId: parseId(selectedSupplier?.id),
      reason: note || 'Nhập kho',
      note,
      items: items.map((i) => {
        const systemId = parseId(i.branchProductId || i.productId);
        const item = {
          quantity: Number(i.quantity || 0),
          costPrice: Number(i.costPrice || 0),
          note: '',
        };
        if (systemId) {
          item.id = systemId;
        } else {
          item.productCode = i.productCode || i.id || '';
          item.productName = i.productName || '';
        }
        return item;
      }),
    };

    setIsSubmitting(true);
    setStatus({
      type: 'info',
      message: isDraft ? 'Đang tạo phiếu nháp...' : 'Đang tạo và duyệt phiếu kho...',
    });

    try {
      const res = await createInwardInventory(payload);
      const ticketId = res?.data?.ticketId || res?.data?.stockTicketId;

      if (!isDraft && ticketId) {
        setStatus({ type: 'info', message: 'Đang xác nhận cộng tồn kho thực tế...' });
        await confirmInwardInventory(ticketId);
        setStatus({
          type: 'success',
          message: `Đã hoàn tất & cộng kho! Mã phiếu: ${res?.data?.ticketCode || ticketId}`,
        });
      } else {
        setStatus({
          type: 'success',
          message: `Đã lưu nháp phiếu ${res?.data?.ticketCode || ticketId}. Tồn kho chưa thay đổi.`,
        });
      }

      setItems([]);
      localStorage.removeItem('stockImport_items');
      loadInwardHistory();
      setIsModalOpen(false);
    } catch (error) {
      const errors = error?.data?.errors;
      let msg;
      if (errors) {
        if (Array.isArray(errors)) msg = errors.join(' | ');
        else if (typeof errors === 'object')
          msg = Object.entries(errors)
            .map(([f, ms]) => `${f}: ${Array.isArray(ms) ? ms.join(', ') : ms}`)
            .join(' | ');
        else msg = String(errors);
      } else {
        msg = error?.message || 'Lỗi khi tạo phiếu';
      }
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const qty = inwardsList.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return {
      totalImports: inwardsList.length,
      totalQuantity: qty,
      monthlyCount: inwardsList.length,
    };
  }, [inwardsList]);

  return (
    <div className="animate-in fade-in w-full space-y-6 duration-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">Nhập kho</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">Ghi nhận và quản lý các phiếu nhập kho</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            {isLoadingData ? 'Đang tải dữ liệu...' : 'Sẵn sàng tạo phiếu'}
          </div>
          <Button variant="primary" onClick={openModal} className="flex items-center gap-2">
            <Icon name="add" size={20} /> Nhập hàng
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{globalError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError('')}
            className="shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-900/30"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{(summary.totalImports)}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng phiếu nhập</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{(summary.totalQuantity)}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng số lượng nhập</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{(summary.monthlyCount)}</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Trong tháng</p>
          </div>
        </Card>
      </div>

      <InventoryHistoryCard
        title="Lịch sử phiếu nhập kho gần đây"
        type="INWARD"
        tickets={inwardsList}
        isLoading={isLoadingHistory}
        onReload={loadInwardHistory}
        onNotify={(noti) => setStatus({ type: noti.type, message: noti.message })}
      />

      {/* ============ MODAL NHẬP HÀNG ============ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Tạo phiếu nhập kho"
        size="7xl"
      >
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1">
            <ImportItemsTable
              items={items}
              products={products}
              onAddProduct={addProductToTicket}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddNewProduct={() => setIsProductModalOpen(true)}
              onImportRows={handleImportRows}
              formatCurrency={formatCurrency}
              isCustomerReturn={isCustomerReturn}
            />
          </div>

          <div className="w-full shrink-0 xl:w-[300px]">
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
              isCustomerReturn={isCustomerReturn}
            />
          </div>
        </div>
      </Modal>

      {isProductModalOpen && (
        <EditProductModal
          open={isProductModalOpen}
          product={null}
          initialTab="info"
          onClose={() => setIsProductModalOpen(false)}
          onSave={async (form) => {
            try {
              setStatus({ type: 'info', message: 'Đang tạo sản phẩm mới...' });
              const res = await createProduct(form);
              if (res?.success || res?.data) {
                const newProduct = res.data || form;
                addProductToTicket({
                  id: newProduct.productId || newProduct.id || form.id,
                  productCode: newProduct.productCode || form.productCode,
                  productName: newProduct.productName || form.name,
                  unitName: newProduct.baseUnit?.name || newProduct.unit || form.unit || 'Cái',
                  costPrice: newProduct.costPrice || form.costPrice || 0,
                });
                setStatus({ type: 'success', message: 'Đã tạo và thêm sản phẩm vào phiếu!' });
                setIsProductModalOpen(false);
              } else {
                setStatus({ type: 'error', message: 'Lỗi tạo sản phẩm, vui lòng thử lại' });
              }
            } catch (err) {
              setStatus({ type: 'error', message: 'Lỗi tạo sản phẩm, vui lòng thử lại' });
            }
          }}
        />
      )}
    </div>
  );
};

export default StockImport;
