/**
 * useEditProductForm - Quản lý state + handlers của modal thêm/sửa sản phẩm.
 * Output: object chứa tất cả state + handlers để truyền xuống tab component.
 */
import { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useConversionUnits } from './useConversionUnits';
import { useProductAttributes } from './useProductAttributes';

const formatMoney = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return value || '';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const MAX_IMAGES = 5;

const mapProductToForm = (source = {}) => {
  const resolveImageUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object')
      return (
        value.url || value.Url || value.imageUrl || value.ImageUrl || value.src || value.path || ''
      );
    return '';
  };

  const resolveLocations = (source) => {
    if (Array.isArray(source.shelfLocations) && source.shelfLocations.length)
      return source.shelfLocations;
    if (Array.isArray(source.locations) && source.locations.length) return source.locations;
    const loc = source.shelfLocation || source.location || '';
    return loc ? [loc] : [];
  };

  const productId = source.productId || source.id || '';
  const productCode = source.productCode || source.code || '';

  const imageUrl = resolveImageUrl(source.imageUrl) || resolveImageUrl(source.image);

  const imageList = Array.isArray(source.images)
    ? source.images.map((item, index) => ({
        id: item?.id || `${Date.now()}-${index}`,
        url: resolveImageUrl(item),
      }))
    : [];

  return {
    id: productCode || productId,
    productId,
    productCode,
    barcode: source.barcode || '',
    name: source.productName || source.name || '',
    group: source.categoryName || source.group || '',
    brand: source.brandName || source.brand || '',
    image: imageUrl,
    images: imageList,
    costPrice: source.costPrice ?? 0,
    salePrice: source.salePrice ?? 0,
    stock: source.actualStock ?? source.stock ?? 0,
    reservedStock: source.reservedStock ?? 0,
    availableStock: source.availableStock ?? source.actualStock ?? 0,
    stockMin: source.minimumStock ?? 0,
    minimumStock: source.minimumStock ?? 0,
    stockMax: source.maximumStock ?? 0,
    locations: resolveLocations(source),
    shelfLocation: source.shelfLocation || source.location || '',
    specification: source.specification || '',
    specDetail: source.specificationDetail || source.specDetail || '',
    unit: source.unit || 'Sản phẩm',
    baseUnit: {
      name: source.unit || 'Sản phẩm',
      price: source.salePrice ?? 0,
      directSale: source.directSale ?? true,
    },
    weight: source.weight || '',
    weightUnit: source.weightUnit || 'g',
    width: source.width || '',
    length: source.length || '',
    height: source.height || '',
    sizeUnit: source.sizeUnit || 'mm',
    conversionUnits: source.conversionUnits || [],
    attributes: source.attributes || [],
    productStatus: source.isActive === false ? 'inactive' : 'active',
    directSale: source.directSale ?? true,
    description: source.description || source.specification || '',
    notes: source.notes || '',
  };
};

export const useEditProductForm = ({
  product,
  onSave,
  onClose,
  productList = [],
  initialTab = 'info',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const defaultForm = {
    id: '',
    productId: '',
    productCode: '',
    barcode: '',
    name: '',
    group: '',
    brand: '',
    image: '',
    images: [],
    costPrice: '',
    salePrice: '',
    stock: 0,
    reservedStock: 0,
    availableStock: 0,
    stockMin: 0,
    minimumStock: 0,
    stockMax: 0,
    locations: [],
    shelfLocation: '',
    specification: '',
    specDetail: '',
    unit: '',
    weight: '',
    weightUnit: 'g',
    width: '',
    length: '',
    height: '',
    sizeUnit: '',
    baseUnit: { name: '', price: '', directSale: true },
    conversionUnits: [],
    attributes: [],
    productStatus: 'active',
    description: '',
    notes: '',
  };

  const initForm = () => (product ? { ...defaultForm, ...mapProductToForm(product) } : defaultForm);

  const initImages = () => {
    if (!product) return [];
    const m = mapProductToForm(product);
    if (m.images?.length) return m.images;
    if (m.image)
      return [
        { id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-init`, url: m.image },
      ];
    return [];
  };

  const [form, setForm] = useState(initForm);
  const [images, setImages] = useState(initImages);
  const fileInputRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- LS-backed lists ---
  const [groups, persistGroups] = useLocalStorage('productGroups', () => {
    const fromProducts = productList
      .map((p) => p.group || p.categoryName || p.CategoryName || '')
      .filter(Boolean);
    return [...new Set(['Vật liệu thô', 'Sơn và Hóa chất', 'Kim khí', ...fromProducts])];
  });

  const [brands, persistBrands] = useLocalStorage('productBrands', () => {
    const fromProducts = productList
      .map((p) => p.brand || p.brandName || p.BrandName || p.Brand || '')
      .filter(Boolean);
    return [...new Set(['Hòa Phát', 'Viettel', ...fromProducts])];
  });

  const [locations, persistLocations] = useLocalStorage('productLocations', ['Kệ A1', 'Kệ B2']);

  // --- Sub-hooks ---
  const attr = useProductAttributes(form, setForm);
  const conv = useConversionUnits(form, setForm);

  // --- Modal toggles ---
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState('');
  const [createBrandModalOpen, setCreateBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [createLocationModalOpen, setCreateLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // --- Location helpers ---
  const addLocation = (loc) => {
    const name = (loc || '').trim();
    if (!name) return;
    setForm((c) => {
      const cl = c.locations || [];
      if (cl.includes(name)) return c;
      return { ...c, locations: [...cl, name] };
    });
  };

  const removeLocation = (loc) => {
    setForm((c) => ({ ...c, locations: (c.locations || []).filter((l) => l !== loc) }));
  };

  // --- Image handlers ---
  const handleOpenFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => {
      const avail = Math.max(0, MAX_IMAGES - prev.length);
      if (avail <= 0) {
        alert(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
        return prev;
      }
      const allowed = files.slice(0, avail);
      const newImgs = allowed.map((file) => ({
        id: crypto?.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...newImgs];
    });
    e.target.value = null;
  };

  const handlePinImage = (index) => {
    setImages((prev) => {
      const u = [...prev];
      const [p] = u.splice(index, 1);
      u.unshift(p);
      return u;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const r = prev[index];
      if (r?.file && r?.url) {
        try {
          URL.revokeObjectURL(r.url);
        } catch {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    setForm((c) => ({ ...c, image: images[0]?.url || '' }));
  }, [images]);
  useEffect(() => {
    setForm((c) => ({
      ...c,
      images: (images || []).map((it) => ({ id: it.id, url: it.url, file: it.file })),
    }));
  }, [images]);

  const handleChange = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  useEffect(() => {
    const onDocClick = () => setOpenDropdownId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSave) onSave(form);
  };

  const handleSaveDraft = () => {
    if (onSave) onSave({ ...form, productStatus: 'draft' });
    onClose?.();
  };

  return {
    activeTab,
    setActiveTab,
    form,
    setForm,
    images,
    fileInputRef,
    // Attributes (from sub-hook)
    availableAttributes: attr.availableAttributes,
    persistAvailableAttributes: attr.persistAvailableAttributes,
    addAvailableAttribute: attr.addAvailableAttribute,
    createAttrModalOpen: attr.createAttrModalOpen,
    setCreateAttrModalOpen: attr.setCreateAttrModalOpen,
    newAttrName: attr.newAttrName,
    setNewAttrName: attr.setNewAttrName,
    editAttrModalOpen: attr.editAttrModalOpen,
    setEditAttrModalOpen: attr.setEditAttrModalOpen,
    editAttrIndex: attr.editAttrIndex,
    setEditAttrIndex: attr.setEditAttrIndex,
    editAttrValue: attr.editAttrValue,
    setEditAttrValue: attr.setEditAttrValue,
    editingAttrId: attr.editingAttrId,
    setEditingAttrId: attr.setEditingAttrId,
    addAttrRow: attr.addAttrRow,
    updateAttr: attr.updateAttr,
    removeAttr: attr.removeAttr,
    // Conversion units (from sub-hook)
    addConversionUnitModal: conv.addModal,
    setAddConversionUnitModal: conv.setAddModal,
    newConversionUnit: conv.newUnit,
    setNewConversionUnit: conv.setNewUnit,
    addConversionUnitHandler: conv.addUnit,
    removeConversionUnit: conv.removeUnit,
    updateConversionUnit: conv.updateUnit,
    // Groups
    groups,
    setGroups: persistGroups,
    persistGroups,
    newGroupName,
    setNewGroupName,
    newGroupParent,
    setNewGroupParent,
    // Brands
    brands,
    setBrands: persistBrands,
    persistBrands,
    newBrandName,
    setNewBrandName,
    // Locations
    locations,
    setLocations: persistLocations,
    persistLocations,
    newLocationName,
    setNewLocationName,
    addLocation,
    removeLocation,
    // Modal toggles
    createGroupModalOpen,
    setCreateGroupModalOpen,
    createBrandModalOpen,
    setCreateBrandModalOpen,
    createLocationModalOpen,
    setCreateLocationModalOpen,
    openDropdownId,
    setOpenDropdownId,
    // Image handlers
    handleOpenFilePicker,
    handleUpload,
    handlePinImage,
    handleRemoveImage,
    // Misc
    handleChange,
    handleSubmit,
    handleSaveDraft,
    MAX_IMAGES,
    formatMoney,
  };
};

export default useEditProductForm;
