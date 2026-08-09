import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import Icon from '../../../../shared/components/Icon';
import { ImportItemsTable } from './ImportItemsTable';
import { ImportTicketForm } from './ImportTicketForm';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { hasPermission } from '../../../../shared/utils/permissions';
import {
  createInwardInventory,
  confirmInwardInventory,
  getProductsLookup,
} from '../../services/inventoryService';
import { getSuppliers } from '../../services/supplierService';
import { createProduct } from '../../services/productService';
import { EditProductModal } from '../product/EditProductModal';

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

const getItemKey = (item) =>
  item?.branchProductId || item?.productId || item?.productCode || item?.id || '';

export const ImportTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const canCreateProduct = hasPermission(user, 'PRODUCT_CREATE');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [inwardType, setInwardType] = useState(1);
  const isCustomerReturn = inwardType === 2;
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isCustomerReturn && !note.trim()) setNote('Khách hàng trả');
  }, [inwardType]); // eslint-disable-line react-hooks/exhaustive-deps
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const lastSubmitTime = useRef(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });

  // Excel import
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setItems([]);
    setSelectedSupplier(null);
    setNote('');
    setInwardType(1);
    setStatus({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });

    const loadInitData = async () => {
      // Load suppliers independently - API nay mo, khong yeu cau quyen cu the
      try {
        const supRes = await getSuppliers({ pageNumber: 1, pageSize: 50 });
        const sList = extractList(supRes);
        if (sList.length > 0) setSuppliers(sList);
      } catch {
        // keep empty
      }

      // Load products - dung API lookup (khong can quyen PRODUCT_VIEW)
      try {
        const prodRes = await getProductsLookup({ pageSize: 200 });
        setProducts(extractList(prodRes));
      } catch {
        setProducts([]);
      }
    };
    loadInitData();
  }, [isOpen]);

  const addProductToTicket = useCallback(
    (product) => {
      setItems((current) => {
        const key = getItemKey(product);
        if (!key) return current;
        const existing = current.find((i) => getItemKey(i) === key);
        if (existing) {
          return current.map((i) =>
            getItemKey(i) === key ? { ...i, quantity: Number(i.quantity) + 1 } : i
          );
        }
        return [
          ...current,
          {
            ...product,
            id: key,
            quantity: 1,
            costPrice: product.costPrice || 0,
            supplierId: selectedSupplier?.id || null,
          },
        ];
      });
    },
    [selectedSupplier]
  );

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

  const handleImportRows = useCallback((rows) => {
    if (!rows || rows.length === 0) return;
    setItems((current) => {
      const updated = [...current];
      for (const row of rows) {
        if (!row) continue;
        const matched = row.matchedProduct;
        let key, importItem;
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
            _isNew: true,
            productCode: row.productCode || '',
            productName: row.productName || '',
            unitName: row.unitName || row.unit || '',
            unit: row.unitName || row.unit || '',
            quantity: Number(row.quantity || 0),
            costPrice: Number(row.costPrice || 0),
          };
        }
        const existingIdx = updated.findIndex((i) => (key ? getItemKey(i) === key : false));
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: Number(row.quantity || 0),
            costPrice: Number(row.costPrice || 0),
          };
        } else {
          updated.push(importItem);
        }
      }
      return updated;
    });
  }, []);

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

  const handleFinish = async (isDraft = false) => {
    const now = Date.now();
    if (submittingRef.current || (now - lastSubmitTime.current < 2000)) return;
    lastSubmitTime.current = now;
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
        const isNewProduct = i._isNew === true;
        const systemId = parseId(i.branchProductId || i.productId || i.id);
        const item = {
          quantity: Number(i.quantity || 0),
          costPrice: Number(i.costPrice || 0),
          note: '',
          supplierId: parseId(i.supplierId),
        };

        if (!isNewProduct && systemId) {
          item.id = systemId;
        } else {
          item.id = null;
          item.newProduct = {
            productCode: i.productCode || '',
            productName: i.productName || '',
            unit: i.unitName || i.unit || '',
            brandName: i.brandName || '',
            categoryName: i.categoryName || '',
            barcode: i.barcode || null,
            salePrice: i.salePrice ?? 0,
            supplierId: parseId(i.supplierId),
          };
        }
        return item;
      }),
    };

    setIsSubmitting(true);
    submittingRef.current = true;
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
      }

      setItems([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      let msg;
      if (error?.status === 403) {
        msg = 'Bạn không có quyền thực hiện thao tác này.';
      } else {
        const errors = error?.data?.errors;
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
      }
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/inwardinventoryexcel/template`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Tải template thất bại');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_NhapKho_Excel.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus({ type: 'error', message: 'Không thể tải template' });
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('File', file);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/inwardinventoryexcel/parse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        const { validRows, errors } = data.data;
        const count = validRows?.length || 0;
        if (count > 0) {
          const mapped = validRows.map((row) => ({
            productCode: row.maSanPham || '',
            productName: row.tenSanPham || '',
            quantity: Number(row.soLuong || 0),
            costPrice: Number(row.donGiaNhap || 0),
            note: row.ghiChu || '',
          }));
          handleImportRows(mapped);
        }
        if (errors?.length > 0) {
          setStatus({
            type: 'error',
            message: `${errors.length} dòng lỗi. ${count} dòng hợp lệ đã được nạp.`,
          });
        } else {
          setStatus({ type: 'success', message: `Đã nạp ${count} sản phẩm từ Excel.` });
        }
      } else {
        setStatus({ type: 'error', message: data?.message || 'Parse thất bại' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Lỗi import file' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && onClose()}
        title="Tạo phiếu nhập kho"
        size="8xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={importing}
            className="flex items-center gap-1.5"
          >
            <Icon name="download" size={16} /> Tải file Excel mẫu
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5"
          >
            <Icon name="upload_file" size={16} /> {importing ? 'Đang import...' : 'Nhập từ Excel'}
          </Button>
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1">
            <ImportItemsTable
              items={items}
              products={products}
              onAddProduct={addProductToTicket}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddNewProduct={canCreateProduct ? () => setIsProductModalOpen(true) : null}
              onImportRows={handleImportRows}
              formatCurrency={formatCurrency}
              isCustomerReturn={isCustomerReturn}
            />
          </div>
          <div className="w-full shrink-0 xl:w-[400px]">
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
                setIsProductModalOpen(false);
              }
            } catch (err) {
              // ignore
            }
          }}
          productList={products}
          title="Thêm hàng hóa"
        />
      )}
    </>
  );
};

export default ImportTicketModal;
