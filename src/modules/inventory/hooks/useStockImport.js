import { useState, useEffect, useMemo, useCallback } from 'react';
import { createInwardInventory, getProducts } from '../services/inventoryService';
import { getSuppliers } from '../services/supplierService';

const extractList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeProduct = (item) => ({
  id: item?.id || item?.Id || item?.productId || item?.ProductId,
  productCode: item?.productCode || item?.ProductCode || item?.code || item?.Code || 'SP-000',
  productName: item?.productName || item?.ProductName || item?.name || item?.Name || 'Sản phẩm',
  unitName: item?.unitName || item?.UnitName || item?.unit || item?.Unit || 'Đơn vị',
  costPrice: Number(item?.costPrice ?? item?.CostPrice ?? item?.price ?? item?.Price ?? 0),
  image:
    item?.image ||
    item?.ImageUrl ||
    item?.imageUrl ||
    item?.productImageUrl ||
    item?.thumbnailUrl ||
    null,
});

const normalizeSupplier = (item) => ({
  id: item?.id || item?.Id || item?.supplierId || item?.SupplierId,
  name: item?.name || item?.Name || item?.supplierName || item?.SupplierName || 'Nhà cung cấp',
  phone: item?.phone || item?.Phone || item?.contactPhone || item?.ContactPhone || '',
});

export const useStockImport = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [inwardType, setInwardType] = useState(1);
  const [note, setNote] = useState('Nhập hàng định kỳ');
  const [supplierQuery, setSupplierQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [status, setStatus] = useState({ type: 'info', message: 'Sẵn sàng tạo phiếu nhập kho' });

  // Gọi API tải danh mục Sản phẩm và Nhà cung cấp thực tế
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingData(true);
        const [productResponse, supplierResponse] = await Promise.all([
          getProducts({ pageNumber: 1, pageSize: 100 }),
          getSuppliers({ pageNumber: 1, pageSize: 100 }),
        ]);

        const productList = extractList(productResponse).map(normalizeProduct).filter(Boolean);
        const supplierList = extractList(supplierResponse).map(normalizeSupplier).filter(Boolean);

        setProducts(productList);
        setSuppliers(supplierList);

        if (supplierList.length > 0) {
          setSelectedSupplier(supplierList[0]);
          setSupplierQuery(supplierList[0].name);
        }
        setStatus({ type: 'success', message: 'Đã đồng bộ danh mục từ máy chủ' });
      } catch (error) {
        setStatus({ type: 'error', message: 'Lỗi tải dữ liệu hệ thống từ API.' });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadOptions();
  }, []);

  const addProductToTicket = useCallback((product) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.id === product.id);
      if (existingItem) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        {
          id: product.id,
          productCode: product.productCode,
          productName: product.productName,
          unitName: product.unitName,
          quantity: 1,
          costPrice: product.costPrice,
        },
      ];
    });
    setStatus({ type: 'success', message: `Đã đưa ${product.productName} vào danh sách` });
  }, []);

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [field]: field === 'quantity' || field === 'costPrice' ? Number(value || 0) : value,
        };
      })
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.costPrice || 0),
      0
    );
    return { totalQuantity, totalAmount };
  }, [items]);

  // Xử lý submit Payload chuẩn hóa theo đúng cấu trúc POST /api/inwardinventory
  const handleFinish = async () => {
    if (!items.length) {
      setStatus({
        type: 'error',
        message: 'Vui lòng thêm ít nhất một sản phẩm trước khi hoàn tất',
      });
      return;
    }

    const payload = {
      inwardType: Number(inwardType),
      supplierId: inwardType === 1 ? selectedSupplier?.id || null : null,
      reason: note,
      note: note,
      items: items.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity || 0),
        costPrice: Number(item.costPrice || 0),
        note: null,
      })),
    };

    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Đang đẩy dữ liệu lên hệ thống...' });

    try {
      const response = await createInwardInventory(payload);
      setStatus({
        type: 'success',
        message: response?.message || 'Tạo phiếu nhập kho thành công! Tồn kho đã được cập nhật.',
      });
      setItems([]); // Reset bảng hàng hóa khi thành công
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Không thể tạo phiếu nhập kho lúc này',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    products,
    suppliers,
    items,
    inwardType,
    setInwardType,
    note,
    setNote,
    supplierQuery,
    setSupplierQuery,
    selectedSupplier,
    setSelectedSupplier,
    isSubmitting,
    isLoadingData,
    status,
    setStatus,
    totals,
    addProductToTicket,
    updateItem,
    removeItem,
    handleFinish,
  };
};
