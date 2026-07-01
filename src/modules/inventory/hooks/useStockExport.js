import { useState, useEffect, useMemo } from 'react';
import {
  createOutwardInventory,
  getOutwardInventories,
  getProducts,
} from '../services/inventoryService';

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

export const useStockExport = () => {
  const [exports, setExports] = useState([]);
  const [products, setProducts] = useState([]);
  const [isRemoteData, setIsRemoteData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [exportsResponse, productsResponse] = await Promise.all([
          getOutwardInventories({ pageNumber: 1, pageSize: 50 }),
          getProducts({ pageNumber: 1, pageSize: 100 }),
        ]);

        if (!active) return;

        setExports(extractList(exportsResponse).map(normalizeExportRow).filter(Boolean));
        setProducts(extractList(productsResponse));
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

  const addExport = async (formData) => {
    const nextRow = {
      id: `EXP-${Date.now()}`,
      productName:
        formData.productName ||
        products.find((p) => String(p.id || p.Id) === String(formData.productId))?.productName ||
        products.find((p) => String(p.id || p.Id) === String(formData.productId))?.ProductName ||
        'Sản phẩm chưa đặt tên',
      quantity: Number(formData.quantity || 0),
      date: formData.date || new Date().toISOString().slice(0, 10),
      reason: formData.reason || '',
    };

    if (isRemoteData) {
      await createOutwardInventory({
        outwardType: 1,
        reason: formData.reason,
        note: formData.reason,
        items: [
          {
            branchProductId: formData.productId,
            quantity: Number(formData.quantity),
          },
        ],
      });
      const response = await getOutwardInventories({ pageNumber: 1, pageSize: 50 });
      setExports(extractList(response).map(normalizeExportRow).filter(Boolean));
    } else {
      setExports((prev) => [nextRow, ...prev]);
    }

    setStatusMessage('Đã lưu phiếu xuất kho');
  };

  return { exports, products, isLoading, statusMessage, setStatusMessage, summary, addExport };
};
