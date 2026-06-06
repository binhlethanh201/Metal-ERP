/**
 * useProductAttributes - Quản lý thuộc tính sản phẩm + available attributes LS + modal toggles.
 */
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useProductAttributes = (form, setForm) => {
  const [availableAttributes, persistAvailableAttributes] = useLocalStorage('availableAttributes', [
    'HÃNG',
    'MAQUF',
  ]);
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(null);
  const [editAttrValue, setEditAttrValue] = useState('');
  const [editingAttrId, setEditingAttrId] = useState(null);

  const addAvailableAttribute = (name) => {
    const n = (name || '').trim();
    if (!n) return;
    persistAvailableAttributes((prev) => (prev.includes(n) ? prev : [...prev, n]));
  };

  const addAttrRow = () => {
    setForm((c) => ({
      ...c,
      attributes: [...(c.attributes || []), { id: Date.now(), name: '', value: '' }],
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
