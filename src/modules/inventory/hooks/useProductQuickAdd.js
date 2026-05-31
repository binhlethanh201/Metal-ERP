/**
 * Hook quản lý Popup Thêm mới Hàng hóa nhanh từ phiếu nhập kho.
 */
import { useState, useCallback, useRef } from 'react';

const genCode = (prefix) =>
  `${prefix}${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const formatMoney = (v) => (v != null ? Number(v).toLocaleString('vi-VN') : '0');

export const useProductQuickAdd = (onSave) => {
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    groupId: '',
    groupName: '',
    brandId: '',
    brandName: '',
    sku: '',
    barcode: '',
    purchasePrice: 0,
    taxRate: 'KCT',
    salePriceBeforeTax: 0,
    salePriceAfterTax: 0,
    unit: 'Chiếc',
    importQuantity: 0,
    manageByLot: false,
    manageBySerial: false,
    showInPos: true,
    manageBarcodeByUnit: false,
    // Tab bổ sung
    weight: '',
    weightUnit: 'g',
    length: '',
    width: '',
    height: '',
    sizeUnit: '',
    sizeRange: '',
    ingredients: '',
    manufactureYear: '',
    isJewelry: false,
    description: '',
    // Vị trí
    locations: [],
    newLocationName: '',
    // Tab kho
    defaultWarehouseId: '',
    defaultWarehouseName: '',
    minStock: 0,
    maxStock: 0,
  });

  const [baseUnit, setBaseUnit] = useState({ name: '', price: 0, directSale: false });
  const [conversionUnits, setConversionUnits] = useState([]);
  const [addConversionUnitModal, setAddConversionUnitModal] = useState(false);
  const [newConversionUnit, setNewConversionUnit] = useState({
    name: '',
    convertValue: '',
    convertFrom: '',
    directSale: false,
  });
  const [supplierIds, setSupplierIds] = useState([]);
  const [saving, setSaving] = useState(false);

  // Quick-add lists
  const [groupList, setGroupList] = useState([
    { id: 'GR001', name: 'Thép' },
    { id: 'GR002', name: 'Inox' },
    { id: 'GR003', name: 'Nhôm' },
    { id: 'GR004', name: 'Tôn' },
    { id: 'GR005', name: 'Phụ kiện' },
  ]);
  const [brandList, setBrandList] = useState([
    { id: 'BR001', name: 'Hòa Phát' },
    { id: 'BR002', name: 'Việt Nhật' },
    { id: 'BR003', name: 'Posco' },
    { id: 'BR004', name: 'Hoa Sen' },
  ]);
  const [unitList, setUnitList] = useState([
    'Chiếc',
    'Kg',
    'Mét',
    'Hộp',
    'Cái',
    'Cây',
    'Tấm',
    'Bộ',
    'Cuộn',
    'Thùng',
  ]);
  const [quickAddModal, setQuickAddModal] = useState({ open: false, type: '', name: '' });

  const openQuickAdd = useCallback((type) => {
    setQuickAddModal({ open: true, type, name: '' });
  }, []);

  const handleQuickAdd = useCallback(() => {
    const { type, name } = quickAddModal;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (type === 'group') {
      setGroupList((p) => [...p, { id: `GR${Date.now()}`, name: trimmed }]);
      setForm((p) => ({ ...p, groupId: `GR${Date.now()}`, groupName: trimmed }));
    } else if (type === 'brand') {
      setBrandList((p) => [...p, { id: `BR${Date.now()}`, name: trimmed }]);
      setForm((p) => ({ ...p, brandId: `BR${Date.now()}`, brandName: trimmed }));
    } else if (type === 'unit') {
      setUnitList((p) => [...new Set([...p, trimmed])]);
      setForm((p) => ({ ...p, unit: trimmed }));
    }
    setQuickAddModal({ open: false, type: '', name: '' });
  }, [quickAddModal]);

  // Ảnh sản phẩm
  const [images, setImages] = useState([]);

  // Thuộc tính (generic - giống AttributeEditor)
  const [attributes, setAttributes] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([
    'Màu sắc',
    'Size',
    'Dung tích',
    'Hương vị',
    'Chất liệu',
    'Trọng lượng',
  ]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [newAttrName, setNewAttrName] = useState('');
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(-1);
  const [editAttrValue, setEditAttrValue] = useState('');

  const addAttrRow = useCallback(() => {
    setAttributes((p) => [...p, { id: Date.now() + Math.random(), name: '', value: '' }]);
  }, []);

  const updateAttr = useCallback((id, field, value) => {
    setAttributes((p) => p.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, []);

  const removeAttr = useCallback((id) => {
    setAttributes((p) => p.filter((a) => a.id !== id));
  }, []);

  const handleCreateAttribute = useCallback(() => {
    const name = newAttrName.trim();
    if (!name) return;
    setAvailableAttributes((p) => [...new Set([...p, name])]);
    if (editingAttrId) {
      setAttributes((p) => p.map((a) => (a.id === editingAttrId ? { ...a, name } : a)));
    } else {
      setAttributes((p) => [...p, { id: Date.now(), name, value: '' }]);
    }
    setNewAttrName('');
    setEditingAttrId(null);
    setCreateAttrModalOpen(false);
  }, [newAttrName, editingAttrId]);

  const handleEditAttribute = useCallback(() => {
    const val = editAttrValue.trim();
    if (!val) return;
    setAvailableAttributes((p) => {
      const n = [...p];
      n[editAttrIndex] = val;
      return n;
    });
    setEditAttrModalOpen(false);
    setEditAttrIndex(-1);
    setEditAttrValue('');
  }, [editAttrValue, editAttrIndex]);

  const handleDeleteAttribute = useCallback((index) => {
    setAvailableAttributes((p) => p.filter((_, i) => i !== index));
    setEditAttrModalOpen(false);
    setEditAttrIndex(-1);
  }, []);

  // --- Vị trí ---
  const addLocation = useCallback(() => {
    const name = form.newLocationName.trim();
    if (!name) return;
    setForm((p) => ({
      ...p,
      locations: [...p.locations, name],
      newLocationName: '',
    }));
  }, [form.newLocationName]);

  const removeLocation = useCallback((loc) => {
    setForm((p) => ({
      ...p,
      locations: p.locations.filter((l) => l !== loc),
    }));
  }, []);

  const handleChange = useCallback((field, value) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      if (field === 'taxRate') {
        const rate = value === 'KCT' ? 0 : Number(value) || 0;
        next.salePriceAfterTax = Math.round(next.salePriceBeforeTax * (1 + rate / 100));
      }
      if (field === 'salePriceBeforeTax') {
        const rate = next.taxRate === 'KCT' ? 0 : Number(next.taxRate) || 0;
        next.salePriceAfterTax = Math.round(Number(value || 0) * (1 + rate / 100));
      }
      if (field === 'purchasePrice' && !next.salePriceBeforeTax) {
        next.salePriceBeforeTax = Math.round(Number(value || 0) * 1.2);
        const rate = next.taxRate === 'KCT' ? 0 : Number(next.taxRate) || 0;
        next.salePriceAfterTax = Math.round(next.salePriceBeforeTax * (1 + rate / 100));
      }
      return next;
    });
  }, []);

  const removeConversionUnit = useCallback((id) => {
    setConversionUnits((p) => p.filter((u) => u.id !== id));
  }, []);

  const updateConversionUnit = useCallback((id, field, value) => {
    setConversionUnits((p) => p.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }, []);

  const addConversionUnit = useCallback(() => {
    const { name, convertValue, convertFrom } = newConversionUnit;
    if (!name.trim() || !convertValue || !convertFrom) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const basePrice = Number(baseUnit.price) || 0;
    const unitsByName = conversionUnits.reduce((acc, u) => {
      acc[u.name] = u;
      return acc;
    }, {});
    const computeMultiplier = (uName, visited = new Set()) => {
      if (!uName || visited.has(uName)) return null;
      if (uName === baseUnit.name) return 1;
      const u = unitsByName[uName];
      if (!u) return null;
      visited.add(uName);
      if (u.convertFrom === baseUnit.name) return u.convertValue;
      const pm = computeMultiplier(u.convertFrom, visited);
      return pm == null ? null : u.convertValue * pm;
    };
    const cv = Number(convertValue);
    const pm = convertFrom === baseUnit.name ? 1 : computeMultiplier(convertFrom);
    const calculatedPrice = pm && basePrice ? basePrice * cv * pm : 0;

    setConversionUnits((p) => [
      ...p,
      {
        id: `cu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        convertValue: cv,
        convertFrom,
        calculatedPrice,
        directSale: newConversionUnit.directSale || false,
      },
    ]);
    setNewConversionUnit({ name: '', convertValue: '', convertFrom: '', directSale: false });
    setAddConversionUnitModal(false);
  }, [newConversionUnit, baseUnit, conversionUnits]);

  const toggleSupplier = useCallback((id) => {
    setSupplierIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);

  // --- Ảnh ---
  const handleImagesChange = useCallback((files) => {
    const validFiles = Array.from(files).filter((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return false;
      if (f.size > 2 * 1024 * 1024) return false;
      return true;
    });
    if (validFiles.length < files.length)
      alert('Một số file không hợp lệ (chỉ nhận jpg, jpeg, png, gif, tối đa 2MB/ảnh)');
    setImages((p) => {
      const remaining = 10 - p.length;
      const toAdd = validFiles.slice(0, remaining).map((f) => ({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file: f,
        preview: URL.createObjectURL(f),
        isMain: p.length === 0,
      }));
      return [...p, ...toAdd];
    });
  }, []);

  const handleRemoveImage = useCallback((id) => {
    setImages((p) => {
      const n = p.filter((img) => img.id !== id);
      if (n.length > 0 && !n.some((img) => img.isMain)) n[0].isMain = true;
      return n;
    });
  }, []);

  const handleSetMainImage = useCallback((id) => {
    setImages((p) => p.map((img) => ({ ...img, isMain: img.id === id })));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      groupId: '',
      groupName: '',
      brandId: '',
      brandName: '',
      sku: '',
      barcode: '',
      purchasePrice: 0,
      taxRate: 'KCT',
      salePriceBeforeTax: 0,
      salePriceAfterTax: 0,
      unit: 'Chiếc',
      importQuantity: 0,
      manageByLot: false,
      manageBySerial: false,
      showInPos: true,
      manageBarcodeByUnit: false,
      weight: '',
      weightUnit: 'g',
      length: '',
      width: '',
      height: '',
      sizeUnit: '',
      sizeRange: '',
      ingredients: '',
      manufactureYear: '',
      isJewelry: false,
      description: '',
      locations: [],
      newLocationName: '',
      defaultWarehouseId: '',
      defaultWarehouseName: '',
      minStock: 0,
      maxStock: 0,
    });
    setConversionUnits([]);
    setSupplierIds([]);
    setImages([]);
    setAttributes([]);
    setBaseUnit({ name: '', price: 0, directSale: false });
    setConversionUnits([]);
    setActiveTab('basic');
  }, []);

  const buildPayload = useCallback(
    () => ({
      name: form.name,
      groupId: form.groupId,
      groupName: form.groupName,
      brandId: form.brandId,
      brandName: form.brandName,
      sku: form.sku || genCode('SKU'),
      barcode: form.barcode || genCode('BC'),
      purchasePrice: form.purchasePrice,
      taxRate: form.taxRate,
      salePriceBeforeTax: form.salePriceBeforeTax,
      salePriceAfterTax: form.salePriceAfterTax,
      unit: form.unit,
      manageByLot: form.manageByLot,
      manageBySerial: form.manageBySerial,
      showInPos: form.showInPos,
      manageBarcodeByUnit: form.manageBarcodeByUnit,
      baseUnit,
      conversionUnits,
      minStock: form.minStock,
      maxStock: form.maxStock,
      defaultWarehouseId: form.defaultWarehouseId,
      images: images.map((img) => ({ name: img.file.name, isMain: img.isMain })),
      attributes: attributes.filter((a) => a.name && a.value),
      supplierIds,
      additionalInfo: {
        weight: form.weight,
        weightUnit: form.weightUnit,
        length: form.length,
        width: form.width,
        height: form.height,
        sizeUnit: form.sizeUnit,
        sizeRange: form.sizeRange,
        ingredients: form.ingredients,
        manufactureYear: form.manufactureYear,
        isJewelry: form.isJewelry,
        locations: form.locations,
        description: form.description,
      },
    }),
    [form, baseUnit, conversionUnits, supplierIds, images, attributes]
  );

  const handleSave = useCallback(
    async (mode) => {
      if (!form.name.trim()) {
        alert('Vui lòng nhập Tên hàng hóa');
        return false;
      }
      setSaving(true);
      try {
        const payload = buildPayload();
        console.log('[Demo] Lưu sản phẩm mới:', payload);
        const savedProduct = {
          id: genCode('SP'),
          code: payload.sku,
          name: payload.name,
          unit: payload.unit,
          price: payload.purchasePrice || 0,
          stock: payload.importQuantity || 0,
        };
        if (mode === 'duplicate') {
          onSave?.(savedProduct);
          setForm((p) => ({ ...p, name: `${p.name} (Sao chép)` }));
        } else if (mode === 'addNew') {
          onSave?.(savedProduct);
          resetForm();
          setSaving(false);
          return true;
        } else {
          onSave?.(savedProduct);
          setSaving(false);
          return true;
        }
        setSaving(false);
        return true;
      } catch (e) {
        setSaving(false);
        alert(e?.message || 'Lỗi');
        return false;
      }
    },
    [form, buildPayload, onSave, resetForm]
  );

  return {
    activeTab,
    setActiveTab,
    form,
    handleChange,
    baseUnit,
    setBaseUnit,
    conversionUnits,
    addConversionUnitModal,
    setAddConversionUnitModal,
    newConversionUnit,
    setNewConversionUnit,
    addConversionUnit,
    removeConversionUnit,
    updateConversionUnit,
    formatMoney,
    supplierIds,
    toggleSupplier,
    saving,
    handleSave,
    resetForm,
    // Ảnh
    images,
    fileInputRef,
    handleImagesChange,
    handleRemoveImage,
    handleSetMainImage,
    // Thuộc tính
    attributes,
    availableAttributes,
    openDropdownId,
    setOpenDropdownId,
    addAttrRow,
    updateAttr,
    removeAttr,
    createAttrModalOpen,
    setCreateAttrModalOpen,
    editingAttrId,
    setEditingAttrId,
    newAttrName,
    setNewAttrName,
    handleCreateAttribute,
    editAttrModalOpen,
    setEditAttrModalOpen,
    editAttrIndex,
    setEditAttrIndex,
    editAttrValue,
    setEditAttrValue,
    handleEditAttribute,
    handleDeleteAttribute,
    // Vị trí
    addLocation,
    removeLocation,
    // Quick-add
    groupList,
    brandList,
    unitList,
    quickAddModal,
    setQuickAddModal,
    openQuickAdd,
    handleQuickAdd,
  };
};

export default useProductQuickAdd;
