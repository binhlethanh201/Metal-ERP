/**
 * useEditProductForm - Quản lý TOÀN BỘ state + handlers của modal sửa/thêm sản phẩm.
 * Output: object chứa tất cả state + handlers để truyền xuống tab component.
 */
/**
 * Hook quản lý toàn bộ state + handlers của modal thêm/sửa sản phẩm.
 * Output: object chứa form state, image handlers, attribute/conversion unit handlers, modal toggles.
 */
import { useEffect, useState, useRef } from 'react';

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

  const parseStockLevel = (val) => {
    if (!val || typeof val !== 'string') return null;
    const parts = val.split('-').map((s) => Number(s.trim()));
    if (parts.length === 2 && parts.every((n) => !Number.isNaN(n))) {
      return { min: parts[0], max: parts[1] };
    }
    return null;
  };

  const resolveLocations = (source) => {
    if (Array.isArray(source.locations) && source.locations.length) return source.locations;
    if (Array.isArray(source.Locations) && source.Locations.length) return source.Locations;
    const loc =
      source.shelfLocation || source.ShelfLocation || source.location || source.Location || '';
    return loc ? [loc] : [];
  };
  const productId = source.productId || source.ProductId || source.id || source.Id || '';
  const productCode = source.productCode || source.ProductCode || source.code || source.Code || '';
  const stockLevelParsed = parseStockLevel(source.stockLevel || source.StockLevel);
  const imageUrl =
    resolveImageUrl(source.image) ||
    resolveImageUrl(source.ImageUrl) ||
    resolveImageUrl(source.imageUrl) ||
    resolveImageUrl(source.ImageURL);
  const imageList = Array.isArray(source.images)
    ? source.images.map((item, index) => ({
        id: item?.id || item?.Id || `${Date.now()}-${index}`,
        url: resolveImageUrl(item),
      }))
    : Array.isArray(source.Images)
      ? source.Images.map((item, index) => ({
          id: item?.id || item?.Id || `${Date.now()}-${index}`,
          url: resolveImageUrl(item),
        }))
      : [];

  return {
    id: productCode || productId,
    productId,
    productCode,
    barcode: source.barcode || source.Barcode || '',
    name: source.productName || source.ProductName || source.name || source.Name || '',
    group: source.categoryName || source.CategoryName || source.group || source.Group || '',
    brand: source.brandName || source.BrandName || source.brand || source.Brand || '',
    image: imageUrl,
    images: imageList,
    costPrice: source.costPrice ?? source.CostPrice ?? '',
    salePrice:
      source.salePrice ??
      source.sellPrice ??
      source.SellPrice ??
      source.price ??
      source.Price ??
      '',
    stock: source.actualStock ?? source.ActualStock ?? source.stock ?? source.Stock ?? 0,
    reservedStock: source.reservedStock ?? source.ReservedStock ?? 0,
    availableStock:
      source.availableStock ??
      source.AvailableStock ??
      source.actualStock ??
      source.ActualStock ??
      0,
    stockMin: source.minimumStock ?? source.MinimumStock ?? stockLevelParsed?.min ?? 0,
    minimumStock: source.minimumStock ?? source.MinimumStock ?? stockLevelParsed?.min ?? 0,
    stockMax: source.maximumStock ?? source.MaximumStock ?? stockLevelParsed?.max ?? 0,
    locations: resolveLocations(source),
    shelfLocation:
      source.shelfLocation || source.ShelfLocation || source.location || source.Location || '',
    specification: source.specification || source.Specification || '',
    unit: source.unit || source.Unit || '',
    baseUnit: {
      name: source.unit || source.Unit || '',
      price:
        source.salePrice ??
        source.sellPrice ??
        source.SellPrice ??
        source.price ??
        source.Price ??
        '',
      directSale: source.directSale ?? source.DirectSale ?? true,
    },
    weight: source.weight || source.Weight || '',
    weightUnit: source.weightUnit || source.WeightUnit || 'g',
    width: source.width || source.Width || '',
    length: source.length || source.Length || '',
    height: source.height || source.Height || '',
    sizeUnit: source.sizeUnit || source.SizeUnit || '',
    conversionUnits: source.conversionUnits || source.ConversionUnits || [],
    attributes: source.attributes || source.Attributes || [],
    productStatus: source.productStatus || source.ProductStatus || 'active',
    description: source.description || source.Description || '',
    notes: source.notes || source.Notes || '',
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

  const initForm = () => {
    if (product) {
      const m = mapProductToForm(product);
      return { ...defaultForm, ...m };
    }
    return defaultForm;
  };

  const initImages = () => {
    if (!product) return [];
    const m = mapProductToForm(product);
    if (m.images?.length) return m.images;
    if (m.image) {
      return [
        { id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-init`, url: m.image },
      ];
    }
    return [];
  };

  const [form, setForm] = useState(initForm);
  const [images, setImages] = useState(initImages);
  const fileInputRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // LocalStorage state
  const ls = (key, fallback) => {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : fallback;
    } catch {
      return fallback;
    }
  };
  const [availableAttributes, setAvailableAttributes] = useState(() =>
    ls('availableAttributes', ['HÃNG', 'MAQUF'])
  );
  const [groups, setGroups] = useState(() => {
    const stored = ls('productGroups', null);
    const fromProducts = productList
      .map((p) => p.group || p.categoryName || p.CategoryName || '')
      .filter(Boolean);
    const unique = [
      ...new Set([...(stored || ['Vật liệu thô', 'Sơn và Hóa chất', 'Kim khí']), ...fromProducts]),
    ];
    if (!stored) {
      try {
        localStorage.setItem('productGroups', JSON.stringify(unique));
      } catch {}
    }
    return unique;
  });
  const [brands, setBrands] = useState(() => {
    const stored = ls('productBrands', null);
    const fromProducts = productList
      .map((p) => p.brand || p.brandName || p.BrandName || p.Brand || '')
      .filter(Boolean);
    const unique = [...new Set([...(stored || ['Hòa Phát', 'Viettel']), ...fromProducts])];
    if (!stored) {
      try {
        localStorage.setItem('productBrands', JSON.stringify(unique));
      } catch {}
    }
    return unique;
  });
  const [locations, setLocations] = useState(() => ls('productLocations', ['Kệ A1', 'Kệ B2']));

  // Modal toggles
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState('');
  const [createBrandModalOpen, setCreateBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [createLocationModalOpen, setCreateLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(null);
  const [editAttrValue, setEditAttrValue] = useState('');
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [addConversionUnitModal, setAddConversionUnitModal] = useState(false);
  const [newConversionUnit, setNewConversionUnit] = useState({
    name: '',
    convertValue: '',
    convertFrom: '',
    price: '',
    directSale: false,
  });

  const persistLS = (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };
  const persistAvailableAttributes = (next) => {
    persistLS('availableAttributes', next);
    setAvailableAttributes(next);
  };
  const addAvailableAttribute = (name) => {
    const n = (name || '').trim();
    if (!n) return;
    setAvailableAttributes((prev) => {
      if (prev.includes(n)) return prev;
      const next = [...prev, n];
      persistLS('availableAttributes', next);
      return next;
    });
  };
  const persistGroups = (next) => {
    persistLS('productGroups', next);
    setGroups(next);
  };
  const persistBrands = (next) => {
    persistLS('productBrands', next);
    setBrands(next);
  };
  const persistLocations = (next) => {
    persistLS('productLocations', next);
    setLocations(next);
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

  // Image handlers
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

  // Attributes
  const addAttrRow = () => {
    setForm((c) => ({
      ...c,
      attributes: [...(c.attributes || []), { id: Date.now(), name: '', value: '' }],
    }));
    setOpenDropdownId(null);
  };
  const updateAttr = (id, key, val) => {
    setForm((c) => ({
      ...c,
      attributes: (c.attributes || []).map((a) => (a.id === id ? { ...a, [key]: val } : a)),
    }));
  };
  const removeAttr = (id) => {
    setForm((c) => ({ ...c, attributes: (c.attributes || []).filter((a) => a.id !== id) }));
    if (openDropdownId === id) setOpenDropdownId(null);
  };

  // Conversion units
  const addConversionUnitHandler = () => {
    const name = (newConversionUnit.name || '').trim();
    const cv = Number(newConversionUnit.convertValue) || 0;
    const cf = (newConversionUnit.convertFrom || '').trim();
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
          convertFrom: cf,
          calculatedPrice: calcPrice,
          directSale: newConversionUnit.directSale,
        },
      ],
    }));
    setNewConversionUnit({
      name: '',
      convertValue: '',
      convertFrom: '',
      price: '',
      directSale: false,
    });
    setAddConversionUnitModal(false);
  };
  const removeConversionUnit = (id) => {
    setForm((c) => ({
      ...c,
      conversionUnits: (c.conversionUnits || []).filter((u) => u.id !== id),
    }));
  };
  const updateConversionUnit = (id, key, val) => {
    setForm((c) => ({
      ...c,
      conversionUnits: (c.conversionUnits || []).map((u) =>
        u.id === id ? { ...u, [key]: val } : u
      ),
    }));
  };

  useEffect(() => {
    const onDocClick = () => setOpenDropdownId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  useEffect(() => {
    if (!addConversionUnitModal) return;
    const h = (e) => {
      if (e.key === 'Escape') setAddConversionUnitModal(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [addConversionUnitModal]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSave) onSave(form);
  };

  return {
    activeTab,
    setActiveTab,
    form,
    setForm,
    images,
    fileInputRef,
    availableAttributes,
    persistAvailableAttributes,
    addAvailableAttribute,
    groups,
    setGroups,
    persistGroups,
    newGroupName,
    setNewGroupName,
    newGroupParent,
    setNewGroupParent,
    brands,
    setBrands,
    persistBrands,
    newBrandName,
    setNewBrandName,
    locations,
    setLocations,
    persistLocations,
    newLocationName,
    setNewLocationName,
    addLocation,
    removeLocation,
    createGroupModalOpen,
    setCreateGroupModalOpen,
    createBrandModalOpen,
    setCreateBrandModalOpen,
    createLocationModalOpen,
    setCreateLocationModalOpen,
    openDropdownId,
    setOpenDropdownId,
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
    addConversionUnitModal,
    setAddConversionUnitModal,
    newConversionUnit,
    setNewConversionUnit,
    handleOpenFilePicker,
    handleUpload,
    handlePinImage,
    handleRemoveImage,
    handleChange,
    addAttrRow,
    updateAttr,
    removeAttr,
    addConversionUnitHandler,
    removeConversionUnit,
    updateConversionUnit,
    handleSubmit,
    MAX_IMAGES,
    formatMoney,
  };
};

export default useEditProductForm;
