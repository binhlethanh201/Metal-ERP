/**
 * useProductAttributes - Quản lý thuộc tính sản phẩm + available attributes từ API + modal toggles.
 */
import { useState, useEffect } from 'react';
import { getAttributeTypes, createAttributeType } from '../services/productService';

export const useProductAttributes = (form, setForm) => {
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(null);
  const [editAttrValue, setEditAttrValue] = useState('');
  const [editingAttrId, setEditingAttrId] = useState(null);

  // Load danh sách loại thuộc tính từ API
  useEffect(() => {
    getAttributeTypes()
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          setAvailableAttributes(res.data.map((item) => item.typeName));
        }
      })
      .catch(() => {});
  }, []);

  const persistAvailableAttributes = (next) => {
    const resolved = typeof next === 'function' ? next(availableAttributes) : next;
    setAvailableAttributes(resolved);
  };

  const addAvailableAttribute = async (name) => {
    const n = (name || '').trim();
    if (!n) return;
    // Optimistic update: thêm ngay vào local state
    setAvailableAttributes((prev) => (prev.includes(n) ? prev : [...prev, n]));
    try {
      await createAttributeType(n);
    } catch (err) {
      console.error('Lỗi đồng bộ attribute type lên server:', err);
    }
  };

  const addAttrRow = () => {
    setForm((c) => ({
      ...c,
      attributes: [...(c.attributes || []), { id: crypto.randomUUID(), name: '', value: '' }],
    }));
  };

  const updateAttr = (id, key, val) => {
    setForm((c) => ({
      ...c,
      attributes: (c.attributes || []).map((a) => (a.id === id ? { ...a, [key]: val } : a)),
    }));
  };

  const removeAttr = (id) => {
    setForm((c) => ({ ...c, attributes: (c.attributes || []).filter((a) => a.id !== id) }));
  };

  return {
    availableAttributes,
    persistAvailableAttributes,
    addAvailableAttribute,
    createAttrModalOpen,
    setCreateAttrModalOpen,
    newAttrName,
    setNewAttrName,
    editAttrModalOpen,
    setEditAttrModalOpen,
    editAttrIndex,
    setEditAttrIndex,
    editAttrValue,
    setEditAttrValue,
    editingAttrId,
    setEditingAttrId,
    addAttrRow,
    updateAttr,
    removeAttr,
  };
};

export default useProductAttributes;
