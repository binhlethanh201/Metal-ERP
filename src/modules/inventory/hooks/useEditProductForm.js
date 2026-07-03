/**
 * useEditProductForm - Quản lý state + handlers của modal thêm/sửa sản phẩm.
 */
import { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useConversionUnits } from './useConversionUnits';
import { useProductAttributes } from './useProductAttributes';
import { getCategories, getBrands } from '../services/productService';

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

  const resolveLocations = (src) => {
    if (Array.isArray(src.shelfLocations) && src.shelfLocations.length) return src.shelfLocations;
    if (Array.isArray(src.locations) && src.locations.length) return src.locations;
    const loc = src.shelfLocation || src.location || '';
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
    unit: source.unit || 'cái',
    baseUnit: {
      name: source.unit || 'cái',
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
    unit: 'cái',
    weight: '',
    weightUnit: 'g',
    width: '',
    length: '',
    height: '',
    sizeUnit: 'mm',
    baseUnit: { name: 'cái', price: '', directSale: true },
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

  // --- API / LS lists cho Categories & Brands ---
  const [groups, setGroups] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;
    const loadMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
        if (!active) return;
        if (catRes?.success && Array.isArray(catRes?.data)) {
          setGroups(catRes.data.map((item) => item.name));
        } else {
          // Fallback từ productList
          const fromProducts = productList
            .map((p) => p.group || p.categoryName || '')
            .filter(Boolean);
          setGroups([...new Set(fromProducts)]);
        }

        if (brandRes?.success && Array.isArray(brandRes?.data)) {
          setBrands(brandRes.data.map((item) => item.name));
        } else {
          const fromProducts = productList.map((p) => p.brand || p.brandName || '').filter(Boolean);
          setBrands([...new Set(fromProducts)]);
        }
      } catch (err) {
        console.error('Lỗi tải categories/brands:', err);
      }
    };
    loadMetadata();
    return () => {
      active = false;
    };
  }, [productList]);

  const [locations, persistLocations] = useLocalStorage('productLocations', ['Kệ A1', 'Kệ B2']);

  // --- Sub-hooks ---
  const attr = useProductAttributes(form, setForm);
  const conv = useConversionUnits(form, setForm);

  // --- Modal toggles ---
  const [createLocationModalOpen, setCreateLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const saveNewLocation = (name) => {
    const n = (name || '').trim();
    if (!n) return false;
    persistLocations((prev) => (prev.includes(n) ? prev : [...prev, n]));
    addLocation(n);
    return true;
  };

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

  const handleAddImageUrl = (url) => {
    const u = (url || '').trim();
    if (!u) return;
    setImages((prev) => {
      const avail = Math.max(0, MAX_IMAGES - prev.length);
      if (avail <= 0) {
        alert(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
        return prev;
      }
      if (prev.some((it) => (it.url || '') === u)) {
        alert('Link ảnh này đã được thêm');
        return prev;
      }
      return [
        ...prev,
        {
          id: crypto?.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          url: u,
          file: null,
          isUrl: true,
        },
      ];
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
    addConversionUnitModal: conv.addModal,
    setAddConversionUnitModal: conv.setAddModal,
    newConversionUnit: conv.newUnit,
    setNewConversionUnit: conv.setNewUnit,
    addConversionUnitHandler: conv.addUnit,
    removeConversionUnit: conv.removeUnit,
    updateConversionUnit: conv.updateUnit,
    groups,
    brands,
    locations,
    setLocations: persistLocations,
    persistLocations,
    newLocationName,
    setNewLocationName,
    addLocation,
    removeLocation,
    saveNewLocation,
    createLocationModalOpen,
    setCreateLocationModalOpen,
    openDropdownId,
    setOpenDropdownId,
    handleOpenFilePicker,
    handleUpload,
    handlePinImage,
    handleRemoveImage,
    handleAddImageUrl,
    handleChange,
    handleSubmit,
    handleSaveDraft,
    MAX_IMAGES,
    formatMoney,
  };
};

export default useEditProductForm;
