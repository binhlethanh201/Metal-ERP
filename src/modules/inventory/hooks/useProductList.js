/**
 * Hook quản lý danh sách sản phẩm: fetch từ API (qua inventoryService), save, delete.
 * Tự fallback về inventoryRows mock khi API lỗi. Theo dõi auth token để re-fetch.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/inventoryService';
import {
  extractProductList,
  normalizeProduct,
  createProductPayload,
  updateProductPayload,
} from '../utils/productUtils';
import { inventoryRows } from '../data/inventoryMockData';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });

const sameProductKey = (left, right) => {
  const lk = String(left?.productId || left?.id || left?.productCode || '').trim();
  const rk = String(right?.productId || right?.id || right?.productCode || '').trim();
  return !!lk && lk === rk;
};

export const useProductList = () => {
  const [products, setProducts] = useState(inventoryRows);
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '' });
  const [isRemoteData, setIsRemoteData] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setApiStatus({ loading: true, error: '' });
      try {
        const response = await getProducts({ Page: 1, PageSize: 100 });
        const items = extractProductList(response).map(normalizeProduct).filter(Boolean);
        if (!active) return;
        setIsRemoteData(true);
        if (items.length > 0) setProducts(items);
        setApiStatus({ loading: false, error: '' });
      } catch (error) {
        if (!active) return;
        setProducts(inventoryRows);
        setIsRemoteData(false);
        setApiStatus({
          loading: false,
          error:
            error?.status === 401
              ? 'API đang yêu cầu JWT. Hãy đăng nhập thật hoặc dán token vào Swagger Authorize.'
              : 'Không tải được dữ liệu từ API, đang dùng dữ liệu mẫu.',
        });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSaveProduct = async (updated, productToEdit, onSuccess) => {
    const isDraft = updated.productStatus === 'draft';
    const prepared = { ...updated, productStatus: isDraft ? 'draft' : 'active' };

    if (productToEdit?.id?.startsWith('SP-DRAFT-') && !isDraft) {
      try {
        const drafts = JSON.parse(localStorage.getItem('draftProducts') || '[]');
        const filtered = drafts.filter((d) => d.id !== productToEdit.id);
        localStorage.setItem('draftProducts', JSON.stringify(filtered));
      } catch {}
    }

    if (Array.isArray(prepared.images) && prepared.images.length > 0) {
      const mapped = await Promise.all(
        prepared.images.map(async (it) => {
          if (it?.file) {
            try {
              const data = await fileToDataUrl(it.file);
              return { id: it.id || Date.now(), url: data };
            } catch {
              return { id: it.id || Date.now(), url: it.url || '' };
            }
          }
          return typeof it === 'string'
            ? { id: `${Date.now()}`, url: it }
            : { id: it.id || `${Date.now()}`, url: it.url || '' };
        })
      );
      prepared.images = mapped.slice(0, 10);
      if (!prepared.image && prepared.images.length > 0) prepared.image = prepared.images[0].url;
    }

    const payload = productToEdit ? updateProductPayload(prepared) : createProductPayload(prepared);

    if (isRemoteData) {
      try {
        const productKey = productToEdit?.productId || productToEdit?.id;
        let savedRow = normalizeProduct({ ...payload, ...updated }, 0);
        if (productKey) {
          const response = await updateProduct(productKey, payload);
          const savedData = response?.data || response?.result || response || payload;
          savedRow = normalizeProduct({ ...payload, ...savedData, ...updated }, 0);
        } else {
          const response = await createProduct(payload);
          const savedData = response?.data || response?.result || response || payload;
          savedRow = normalizeProduct({ ...payload, ...savedData, ...updated }, 0);
        }

        const response = await getProducts({ Page: 1, PageSize: 100 });
        const items = extractProductList(response).map(normalizeProduct).filter(Boolean);
        setProducts(() => {
          const nextItems = items.length > 0 ? items : inventoryRows;
          const withoutSaved = nextItems.filter((item) => !sameProductKey(item, savedRow));
          return [savedRow, ...withoutSaved];
        });
      } catch {
        setIsRemoteData(false);
        setProducts((prev) => {
          if (productToEdit) {
            return prev.map((p) =>
              sameProductKey(p, productToEdit)
                ? {
                    ...p,
                    ...updated,
                    id: p.id,
                    productId: p.productId || p.id,
                    productCode: updated.id || updated.productCode || p.productCode || p.id,
                    status: Number(updated.stock || 0) > 0 ? 'Sẵn hàng' : 'Hết hàng',
                    statusTone: Number(updated.stock || 0) > 0 ? 'green' : 'red',
                  }
                : p
            );
          }
          const nextCode = updated.id || updated.productCode || updated.productId || '';
          return [
            {
              ...updated,
              id: updated.productId || nextCode,
              productId: updated.productId || '',
              productCode: nextCode,
              status: Number(updated.stock || 0) > 0 ? 'Sẵn hàng' : 'Hết hàng',
              statusTone: Number(updated.stock || 0) > 0 ? 'green' : 'red',
            },
            ...prev,
          ];
        });
      }
    } else {
      setProducts((prev) => {
        if (productToEdit) {
          return prev.map((p) =>
            sameProductKey(p, productToEdit)
              ? {
                  ...p,
                  ...updated,
                  id: p.id,
                  productId: p.productId || p.id,
                  productCode: updated.id || updated.productCode || p.productCode || p.id,
                  status: Number(updated.stock || 0) > 0 ? 'Sẵn hàng' : 'Hết hàng',
                  statusTone: Number(updated.stock || 0) > 0 ? 'green' : 'red',
                }
              : p
          );
        }
        const nextCode = updated.id || updated.productCode || updated.productId || '';
        return [
          {
            ...updated,
            id: updated.productId || nextCode,
            productId: updated.productId || '',
            productCode: nextCode,
            status: Number(updated.stock || 0) > 0 ? 'Sẵn hàng' : 'Hết hàng',
            statusTone: Number(updated.stock || 0) > 0 ? 'green' : 'red',
          },
          ...prev,
        ];
      });
    }

    setApiStatus((c) => ({ ...c, error: '' }));
    try {
      const brandName = (updated?.brand || updated?.BrandName || '').trim();
      if (brandName) {
        const raw = localStorage.getItem('productBrands');
        const arr = raw ? JSON.parse(raw) : [];
        if (!arr.includes(brandName))
          localStorage.setItem('productBrands', JSON.stringify([...arr, brandName]));
      }
    } catch {}

    onSuccess?.();
  };

  const handleDeleteProduct = async (row) => {
    const confirmed = window.confirm(`Xóa hàng hóa ${row.name}?`);
    if (!confirmed) return;
    try {
      if (isRemoteData) {
        await deleteProduct(row.productId || row.id);
        const response = await getProducts({ Page: 1, PageSize: 100 });
        const items = extractProductList(response).map(normalizeProduct).filter(Boolean);
        setProducts(items.length > 0 ? items : inventoryRows);
      } else {
        setProducts((prev) => prev.filter((item) => item.id !== row.id));
      }
    } catch (error) {
      alert(error?.message || 'Không thể xóa hàng hóa');
    }
  };

  return { products, setProducts, apiStatus, isRemoteData, handleSaveProduct, handleDeleteProduct };
};
