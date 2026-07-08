/**
 * useConversionUnits - Quản lý đơn vị quy đổi + modal thêm đơn vị.
 */
import { useState, useEffect } from 'react';

export const useConversionUnits = (form, setForm) => {
  const [addModal, setAddModal] = useState(false);
  const [newUnit, setNewUnit] = useState({
    name: '',
    convertValue: '',
    convertFrom: '',
    price: '',
    directSale: false,
  });

  const resetNewUnit = () =>
    setNewUnit({ name: '', convertValue: '', convertFrom: '', price: '', directSale: false });

  const addUnit = () => {
    const name = (newUnit.name || '').trim();
    const cv = Number(newUnit.convertValue) || 0;
    const cf = (newUnit.convertFrom || '').trim() || form.baseUnit?.name;
    if (!name) {
      alert('Vui lòng nhập tên đơn vị');
      return;
    }
    const existing = [
      form.baseUnit?.name,
      ...(form.conversionUnits || []).map((u) => u.name),
    ].filter(Boolean);
    if (existing.includes(name)) {
      alert(`Đơn vị "${name}" đã tồn tại`);
      return;
    }
    if (cv <= 0) {
      alert('Giá trị quy đổi phải lớn hơn 0');
      return;
    }
    if (!cf) {
      alert('Vui lòng chọn đơn vị gốc');
      return;
    }
    if (!existing.includes(cf)) {
      alert('Đơn vị gốc không hợp lệ');
      return;
    }
    if (name === cf) {
      alert('Không thể quy đổi đơn vị với chính nó');
      return;
    }

    const unitsByName = (form.conversionUnits || []).reduce((acc, u) => {
      acc[u.name] = u;
      return acc;
    }, {});
    const computeMul = (un, visited = new Set()) => {
      if (!un || visited.has(un)) return null;
      if (un === form.baseUnit?.name) return 1;
      const u = unitsByName[un];
      if (!u) return null;
      visited.add(un);
      const pm = computeMul(u.convertFrom, visited);
      return pm == null ? null : u.convertValue * pm;
    };

    const newMul =
      cf === form.baseUnit?.name
        ? cv
        : (() => {
            const pm = computeMul(cf);
            return pm == null ? null : cv * pm;
          })();
    const calcPrice = newMul && form.baseUnit?.price ? Number(form.baseUnit.price) * newMul : 0;

    setForm((c) => ({
      ...c,
      conversionUnits: [
        ...(c.conversionUnits || []),
        {
          id: Date.now(),
          name,
          convertValue: cv,
          rate: cv, // Backend uses 'rate' field in payload
          convertFrom: cf,
          price: newUnit.price ? Number(newUnit.price) : calcPrice,
          calculatedPrice: calcPrice,
          directSale: newUnit.directSale,
        },
      ],
    }));
    resetNewUnit();
    setAddModal(false);
  };

  const removeUnit = (id) => {
    setForm((c) => ({
      ...c,
      conversionUnits: (c.conversionUnits || []).filter((u) => u.id !== id),
    }));
  };

  const updateUnit = (id, key, val) => {
    setForm((c) => ({
      ...c,
      conversionUnits: (c.conversionUnits || []).map((u) =>
        u.id === id ? { ...u, [key]: val } : u
      ),
    }));
  };

  useEffect(() => {
    if (!addModal) return;
    const h = (e) => {
      if (e.key === 'Escape') setAddModal(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [addModal]);

  return { addModal, setAddModal, newUnit, setNewUnit, addUnit, removeUnit, updateUnit };
};

export default useConversionUnits;
