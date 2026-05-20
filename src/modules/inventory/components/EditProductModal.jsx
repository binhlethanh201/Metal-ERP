import { useEffect, useState, useRef } from 'react';
import MaterialIcon from './MaterialIcon';

const formatMoney = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value || '';
  return new Intl.NumberFormat('vi-VN').format(numberValue);
};

const mapProductToForm = (source = {}) => {
  const resolveImageUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return (
        value.url || value.Url || value.imageUrl || value.ImageUrl || value.src || value.path || ''
      );
    }
    return '';
  };

  const productId = source.productId || source.ProductId || source.id || source.Id || '';
  const productCode = source.productCode || source.ProductCode || source.code || source.Code || '';
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
    salePrice: source.sellPrice ?? source.SellPrice ?? source.price ?? source.Price ?? '',
    stock: source.actualStock ?? source.ActualStock ?? source.stock ?? source.Stock ?? 0,
    reservedStock: source.reservedStock ?? source.ReservedStock ?? 0,
    availableStock:
      source.availableStock ??
      source.AvailableStock ??
      source.actualStock ??
      source.ActualStock ??
      0,
    stockMin: source.minimumStock ?? source.MinimumStock ?? 0,
    minimumStock: source.minimumStock ?? source.MinimumStock ?? 0,
    stockMax: source.maximumStock ?? source.MaximumStock ?? 0,
    locations: source.locations || source.Locations || [],
    shelfLocation:
      source.shelfLocation || source.ShelfLocation || source.location || source.Location || '',
    specification: source.specification || source.Specification || '',
    unit: source.unit || source.Unit || '',
    baseUnit: {
      name: source.unit || source.Unit || '',
      price: source.sellPrice ?? source.SellPrice ?? source.price ?? source.Price ?? '',
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
    productStatus: (source.isActive ?? source.IsActive) === false ? 'inactive' : 'active',
  };
};

// Component Section có thể ẩn/hiện nội dung bằng cách click vào header
// Dùng mũi tên bên phải để biểu thị trạng thái (xoay khi mở/đóng)
const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <section className="mb-6 overflow-hidden rounded-[10px] border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="mb-2 text-[20px] font-semibold leading-tight text-on-surface">
              {title}
            </h3>
            {subtitle ? (
              <p className="text-body-md mb-0 leading-relaxed text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="ml-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
          >
            <MaterialIcon
              name="expand_more"
              className={`text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
};

const EditProductModal = ({ open, onClose, product, onSave, title }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState({});
  const [availableAttributes, setAvailableAttributes] = useState(() => {
    try {
      const raw = localStorage.getItem('availableAttributes');
      return raw ? JSON.parse(raw) : ['HÃNG', 'MAQUF'];
    } catch (e) {
      return ['HÃNG', 'MAQUF'];
    }
  });

  const persistAvailableAttributes = (next) => {
    try {
      localStorage.setItem('availableAttributes', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
    setAvailableAttributes(next);
  };

  const addAvailableAttribute = (name) => {
    const n = (name || '').trim();
    if (!n) return;
    setAvailableAttributes((prev) => {
      if (prev.includes(n)) return prev;
      const next = [...prev, n];
      try {
        localStorage.setItem('availableAttributes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Modal states for group, brand, location
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState('');
  const [groups, setGroups] = useState(() => {
    try {
      const raw = localStorage.getItem('productGroups');
      return raw ? JSON.parse(raw) : ['Vật liệu thô', 'Sơn và Hóa chất', 'Kim khí'];
    } catch (e) {
      return ['Vật liệu thô', 'Sơn và Hóa chất', 'Kim khí'];
    }
  });

  const [createBrandModalOpen, setCreateBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [brands, setBrands] = useState(() => {
    try {
      const raw = localStorage.getItem('productBrands');
      return raw ? JSON.parse(raw) : ['Hòa Phát', 'Viettel'];
    } catch (e) {
      return ['Hòa Phát', 'Viettel'];
    }
  });

  const [createLocationModalOpen, setCreateLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [locations, setLocations] = useState(() => {
    try {
      const raw = localStorage.getItem('productLocations');
      return raw ? JSON.parse(raw) : ['Kệ A1', 'Kệ B2'];
    } catch (e) {
      return ['Kệ A1', 'Kệ B2'];
    }
  });

  const persistGroups = (next) => {
    try {
      localStorage.setItem('productGroups', JSON.stringify(next));
    } catch (e) {}
    setGroups(next);
  };

  const persistBrands = (next) => {
    try {
      localStorage.setItem('productBrands', JSON.stringify(next));
    } catch (e) {}
    setBrands(next);
  };

  const persistLocations = (next) => {
    try {
      localStorage.setItem('productLocations', JSON.stringify(next));
    } catch (e) {}
    setLocations(next);
  };

  const addLocation = (loc) => {
    const name = (loc || '').trim();
    if (!name) return;
    setForm((current) => {
      const current_locs = current.locations || [];
      if (current_locs.includes(name)) return current;
      return { ...current, locations: [...current_locs, name] };
    });
  };

  const removeLocation = (loc) => {
    setForm((current) => ({
      ...current,
      locations: (current.locations || []).filter((l) => l !== loc),
    }));
  };

  // Image management state
  const MAX_IMAGES = 5;
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleOpenFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => {
      const available = Math.max(0, MAX_IMAGES - prev.length);
      if (available <= 0) {
        alert(`Chỉ được tối đa ${MAX_IMAGES} ảnh`);
        return prev;
      }
      const allowedFiles = files.slice(0, available);
      const newImages = allowedFiles.map((file) => ({
        id:
          crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...newImages];
    });
    // reset input
    e.target.value = null;
  };

  const handlePinImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      const [pinned] = updated.splice(index, 1);
      updated.unshift(pinned);
      return updated;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed && removed.file && removed.url) {
        try {
          URL.revokeObjectURL(removed.url);
        } catch (e) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // keep form.image in sync with first image preview for backward compatibility
  useEffect(() => {
    setForm((current) => ({ ...current, image: images[0]?.url || '' }));
  }, [images]);

  // keep form.images in sync with images state so submit receives latest uploads/selections
  useEffect(() => {
    setForm((current) => ({
      ...current,
      images: (images || []).map((it) => ({ id: it.id, url: it.url, file: it.file })),
    }));
  }, [images]);

  useEffect(() => {
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
      baseUnit: {
        name: '',
        price: '',
        directSale: true,
      },
      conversionUnits: [],
      attributes: [],
      productStatus: 'active',
    };

    if (product) {
      const mapped = mapProductToForm(product);
      setForm((current) => ({ ...defaultForm, ...mapped }));
      // initialize images from product if available
      const initImages =
        mapped.images && mapped.images.length
          ? mapped.images
          : mapped.image
            ? [
                {
                  id: crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-init`,
                  url: mapped.image,
                },
              ]
            : [];
      setImages(initImages);
    } else {
      setForm(defaultForm);
      setImages(
        defaultForm.images && defaultForm.images.length
          ? defaultForm.images.slice(0, MAX_IMAGES)
          : defaultForm.image
            ? [
                {
                  id: crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-init`,
                  url: defaultForm.image,
                },
              ]
            : []
      );
    }
  }, [product]);

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  // Attributes state helpers
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [newAttrName, setNewAttrName] = useState('');
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(null);
  const [editAttrValue, setEditAttrValue] = useState('');

  // Conversion units modal state
  const [addConversionUnitModal, setAddConversionUnitModal] = useState(false);
  const [newConversionUnit, setNewConversionUnit] = useState({
    name: '',
    convertValue: '',
    convertFrom: '',
    price: '',
    directSale: false,
  });

  const addAttrRow = () => {
    setForm((current) => ({
      ...current,
      attributes: [...(current.attributes || []), { id: Date.now(), name: '', value: '' }],
    }));
    setOpenDropdownId(null);
  };

  const updateAttr = (id, key, val) => {
    setForm((current) => ({
      ...current,
      attributes: (current.attributes || []).map((a) => (a.id === id ? { ...a, [key]: val } : a)),
    }));
  };

  const removeAttr = (id) => {
    setForm((current) => ({
      ...current,
      attributes: (current.attributes || []).filter((a) => a.id !== id),
    }));
    if (openDropdownId === id) setOpenDropdownId(null);
  };

  const addConversionUnitHandler = () => {
    const name = (newConversionUnit.name || '').trim();
    const convertValue = Number(newConversionUnit.convertValue) || 0;
    const convertFrom = (newConversionUnit.convertFrom || '').trim();

    // Validate tên đơn vị không rỗng
    if (!name) {
      alert('Vui lòng nhập tên đơn vị');
      return;
    }

    // Validate tên duy nhất (không trùng với baseUnit hoặc các unit khác)
    const existingNames = [
      form.baseUnit?.name,
      ...(form.conversionUnits || []).map((u) => u.name),
    ].filter(Boolean);
    if (existingNames.includes(name)) {
      alert(`Đơn vị "${name}" đã tồn tại`);
      return;
    }

    // Validate convertValue > 0
    if (convertValue <= 0) {
      alert('Giá trị quy đổi phải lớn hơn 0');
      return;
    }

    // Validate convertFrom tồn tại
    if (!convertFrom) {
      alert('Vui lòng chọn đơn vị gốc');
      return;
    }

    // Validate convertFrom phải tồn tại trong danh sách (baseUnit hoặc các unit trước đó)
    const validUnits = [
      form.baseUnit?.name,
      ...(form.conversionUnits || []).map((u) => u.name),
    ].filter(Boolean);
    if (!validUnits.includes(convertFrom)) {
      alert('Đơn vị gốc không hợp lệ');
      return;
    }

    // Check circular reference (đơn vị mới không được là gốc của chính nó)
    if (name === convertFrom) {
      alert('Không thể quy đổi đơn vị với chính nó');
      return;
    }

    // compute calculated price based on current baseUnit and existing conversion chain
    const unitsByName = (form.conversionUnits || []).reduce((acc, u) => {
      acc[u.name] = u;
      return acc;
    }, {});
    const computeMultiplierForUnit = (unitName, visited = new Set()) => {
      if (!unitName) return null;
      if (visited.has(unitName)) return null; // circular
      if (!form.baseUnit?.name) return null;
      // if unitName equals base unit, multiplier = 1
      if (unitName === form.baseUnit.name) return 1;
      const u = unitsByName[unitName];
      if (!u) return null;
      visited.add(unitName);
      const parent = u.convertFrom;
      if (!parent) return null;
      if (parent === form.baseUnit.name) return u.convertValue;
      const parentMultiplier = computeMultiplierForUnit(parent, visited);
      if (parentMultiplier == null) return null;
      return u.convertValue * parentMultiplier;
    };

    // For newly created unit, multiplier = convertValue * multiplier(convertFrom)
    const computeNewUnitMultiplier = () => {
      if (!convertFrom) return null;
      if (convertFrom === form.baseUnit?.name) return convertValue;
      const parentMultiplier = computeMultiplierForUnit(convertFrom);
      if (parentMultiplier == null) return null;
      return convertValue * parentMultiplier;
    };

    const newMultiplier = computeNewUnitMultiplier();
    const calculatedPrice =
      newMultiplier && form.baseUnit?.price ? Number(form.baseUnit.price) * newMultiplier : 0;

    setForm((current) => ({
      ...current,
      conversionUnits: [
        ...(current.conversionUnits || []),
        {
          id: Date.now(),
          name,
          convertValue,
          convertFrom,
          // store calculatedPrice for ease (also recalculated on render)
          calculatedPrice,
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
    setForm((current) => ({
      ...current,
      conversionUnits: (current.conversionUnits || []).filter((u) => u.id !== id),
    }));
  };

  const updateConversionUnit = (id, key, val) => {
    setForm((current) => ({
      ...current,
      conversionUnits: (current.conversionUnits || []).map((u) =>
        u.id === id ? { ...u, [key]: val } : u
      ),
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = () => setOpenDropdownId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setAddConversionUnitModal(false);
      }
    };
    if (addConversionUnitModal) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [addConversionUnitModal]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSave) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white font-sans shadow-2xl sm:mx-6">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <h1 className="text-[20px] font-bold leading-tight text-on-surface">
            {title || (product ? 'Sửa hàng hóa' : 'Thêm hàng hóa')}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
          >
            <MaterialIcon name="close" className="text-on-surface-variant" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex h-12 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex h-12 items-center px-4 text-sm tracking-wider ${activeTab === 'info' ? 'border-b-2 border-transparent font-semibold text-gray-700' : 'text-gray-500'}`}
          >
            Thông tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`flex h-12 items-center px-4 text-sm tracking-wider ${activeTab === 'description' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
          >
            Mô tả
          </button>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <main className="custom-scroll flex-1 space-y-6 overflow-y-auto px-8 py-6 sm:px-6 sm:py-5">
            {activeTab === 'info' ? (
              <>
                {/* Basic Info Section - Not in card, just layout */}
                <section className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-9">
                    {/* Product Code and Barcode */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-label-md text-on-surface-variant">Mã hàng</label>
                        <input
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                          type="text"
                          value={form.id || ''}
                          onChange={(event) => handleChange('id', event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-label-md text-on-surface-variant">Mã vạch</label>
                        <input
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                          placeholder="Nhập mã vạch"
                          type="text"
                          value={form.barcode || ''}
                          onChange={(event) => handleChange('barcode', event.target.value)}
                        />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="mt-5 space-y-2">
                      <label className="text-label-md text-on-surface-variant">Tên hàng</label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 font-semibold focus:ring-0"
                        type="text"
                        value={form.name || ''}
                        onChange={(event) => handleChange('name', event.target.value)}
                      />
                    </div>

                    {/* Category and Brand */}
                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-label-md text-on-surface-variant">Nhóm hàng</label>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGroupName('');
                              setNewGroupParent('');
                              setCreateGroupModalOpen(true);
                            }}
                            className="text-label-sm font-semibold text-primary hover:underline"
                          >
                            Tạo mới
                          </button>
                        </div>
                        <select
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                          value={form.group || ''}
                          onChange={(event) => handleChange('group', event.target.value)}
                        >
                          <option>Chọn nhóm hàng</option>
                          {groups.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-label-md text-on-surface-variant">
                            Thương hiệu
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setNewBrandName('');
                              setCreateBrandModalOpen(true);
                            }}
                            className="text-label-sm font-semibold text-primary hover:underline"
                          >
                            Tạo mới
                          </button>
                        </div>
                        <select
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                          value={form.brand || ''}
                          onChange={(event) => handleChange('brand', event.target.value)}
                        >
                          <option>Chọn thương hiệu</option>
                          {brands.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-12 lg:col-span-3">
                    <div className="flex flex-col gap-3">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        onChange={handleUpload}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      {/* Main preview */}
                      <div className="flex w-full items-start gap-4">
                        <div className="relative flex-1 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb]">
                          <div className="aspect-[1/1] w-full">
                            {images && images.length > 0 ? (
                              <img
                                src={images[0].url}
                                alt={form.name || 'Product'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center py-8 text-gray-400">
                                <button
                                  type="button"
                                  onClick={handleOpenFilePicker}
                                  className="flex flex-col items-center gap-2"
                                >
                                  <MaterialIcon name="add" className="text-3xl text-gray-400" />
                                  <span className="text-sm">Upload</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {images && images.length > 0 ? (
                            <div className="absolute left-2 top-2 z-20 rounded-full bg-black/75 px-3 py-1 text-[12px] font-semibold text-white">
                              Main
                            </div>
                          ) : null}
                        </div>

                        {/* Vertical thumbnails */}
                        <div className="flex w-20 flex-col items-center gap-3">
                          <input
                            ref={fileInputRef}
                            onChange={handleUpload}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                          />

                          {/* Upload box */}
                          {images.length < MAX_IMAGES ? (
                            <button
                              onClick={handleOpenFilePicker}
                              type="button"
                              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed border-[#d1d5db] bg-white text-[28px] text-[#6b7280] transition-all duration-200 hover:border-blue-600 hover:bg-[#eff6ff] hover:text-blue-600"
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-2xl">+</span>
                              </div>
                            </button>
                          ) : (
                            <div className="h-20 w-20" />
                          )}

                          {images.map((img, idx) => (
                            <div
                              key={img.id}
                              className="relative h-20 w-20 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]"
                            >
                              <button
                                type="button"
                                onClick={() => handlePinImage(idx)}
                                className="absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90"
                                title={idx === 0 ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}
                              >
                                <MaterialIcon
                                  name="push_pin"
                                  className={`${idx === 0 ? 'text-blue-600' : 'text-gray-600'}`}
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute bottom-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90"
                                title="Xóa ảnh"
                              >
                                <MaterialIcon name="delete" className="text-red-500" />
                              </button>
                              <img
                                src={img.url}
                                alt={`thumb-${idx}`}
                                className={`h-full w-full object-cover ${idx === 0 ? 'ring-2 ring-blue-300' : ''}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inventory Section - Card */}
                <Section
                  title="Tồn kho"
                  subtitle="Quản lý số lượng tồn kho và định mức tồn. Khi tồn kho chạm đến định mức, bạn sẽ nhận được cảnh báo."
                  defaultOpen
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">
                        Tồn kho hiện tại
                      </label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right font-semibold focus:ring-0"
                        type="text"
                        value={form.stock || '0'}
                        onChange={(event) => handleChange('stock', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">
                        Định mức tồn thấp nhất
                      </label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
                        type="text"
                        value={form.minimumStock ?? form.stockMin ?? '0'}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            minimumStock: event.target.value,
                            stockMin: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">
                        Định mức tồn cao nhất
                      </label>
                      <input
                        className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-right focus:ring-0"
                        type="text"
                        value={form.stockMax ?? '0'}
                        onChange={(event) => handleChange('stockMax', event.target.value)}
                      />
                    </div>
                  </div>
                </Section>

                {/* Pricing Section - Card */}
                <Section title="Giá vốn, giá bán" defaultOpen>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Giá vốn</label>
                      <div className="relative">
                        <input
                          className="text-body-lg w-full border-b-2 border-l-0 border-r-0 border-t-0 border-outline-variant bg-transparent py-2 pr-8 text-right font-bold leading-[1.2] focus:border-primary"
                          type="text"
                          value={formatMoney(form.costPrice)}
                          onChange={(event) =>
                            handleChange('costPrice', event.target.value.replaceAll(',', ''))
                          }
                        />
                        <span className="text-label-md absolute bottom-2 right-0 font-normal leading-[1.1] text-on-surface-variant">
                          đ
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md text-on-surface-variant">Giá bán</label>
                        <button
                          type="button"
                          className="text-label-md flex items-center gap-1 font-bold leading-[1.15] text-primary"
                        >
                          <MaterialIcon name="settings" className="text-base" />
                          Thiết lập giá
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          className="text-body-lg w-full border-b-2 border-l-0 border-r-0 border-t-0 border-outline-variant bg-transparent py-2 pr-8 text-right font-bold leading-[1.2] text-primary focus:border-primary"
                          type="text"
                          value={formatMoney(form.salePrice)}
                          onChange={(event) =>
                            handleChange('salePrice', event.target.value.replaceAll(',', ''))
                          }
                        />
                        <span className="text-label-md absolute bottom-2 right-0 font-normal leading-[1.1] text-on-surface-variant">
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Logistics Section - Card */}
                <Section
                  title="Vị trí, trọng lượng, kích thước"
                  subtitle="Quản lý việc sắp xếp kho, vị trí bán hàng hoặc quy cách giao hàng"
                  defaultOpen
                >
                  <div className="mb-5 grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md text-on-surface-variant">Vị trí</label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewLocationName('');
                            setCreateLocationModalOpen(true);
                          }}
                          className="text-label-sm font-semibold text-primary hover:underline"
                        >
                          Tạo mới
                        </button>
                      </div>
                      <div className="relative flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-[8px] border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[15px]">
                        {(form.locations || []).map((loc) => (
                          <div
                            key={loc}
                            className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-800"
                          >
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => removeLocation(loc)}
                              className="font-bold text-gray-600 hover:text-gray-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Trọng lượng</label>
                      <div className="flex items-center overflow-hidden rounded-[8px] border border-outline-variant bg-surface-container-lowest">
                        <input
                          className="flex-1 border-none bg-transparent px-3 py-2 text-right text-[15px] font-semibold leading-[1.35] focus:ring-0"
                          type="text"
                          value={form.weight || ''}
                          onChange={(event) => handleChange('weight', event.target.value)}
                        />
                        <select
                          className="text-label-sm cursor-pointer border-l border-outline-variant bg-surface-container-low px-2 py-2 font-bold leading-[1.15] text-primary focus:ring-0"
                          value={form.weightUnit || 'g'}
                          onChange={(event) => handleChange('weightUnit', event.target.value)}
                        >
                          <option>g</option>
                          <option>kg</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-md text-on-surface-variant">Kích thước</label>
                    <div className="max-w-lg">
                      <label className="sr-only">Kích thước - Rộng</label>
                      <div className="inline-flex w-full items-stretch overflow-hidden rounded-lg border border-[#dcdfe6] bg-white">
                        <input
                          type="text"
                          placeholder="Rộng"
                          value={form.width || ''}
                          onChange={(e) => handleChange('width', e.target.value)}
                          className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Dài"
                          value={form.length || ''}
                          onChange={(e) => handleChange('length', e.target.value)}
                          className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-gray-400 focus:outline-none"
                        />
                        <div className="relative w-1/3">
                          <select
                            value={form.sizeUnit || ''}
                            onChange={(e) => handleChange('sizeUnit', e.target.value)}
                            className="w-full appearance-none bg-white px-3 py-2 text-left text-[15px] focus:outline-none"
                          >
                            <option value="">mm</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                          </select>
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            <MaterialIcon name="expand_more" className="text-base" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Unit Management Section - Card */}
                <Section title="Quản lý theo đơn vị tính và thuộc tính" defaultOpen>
                  <div className="mb-8">
                    <h4 className="text-label-md mb-1 font-bold text-on-surface">Đơn vị tính</h4>
                    <p className="text-body-md mb-6 leading-relaxed text-on-surface-variant">
                      Thêm đơn vị bán hoặc nhập như chai, lốc, thùng. Đặt công thức quy đổi để tính
                      nhanh giá và tồn kho. Ví dụ: 1 lốc = 4 chai, 1 thùng = 20 lốc.
                    </p>

                    <div className="mb-6 flex flex-wrap items-end gap-5">
                      <div className="min-w-[200px] flex-1 space-y-2">
                        <label className="text-label-md text-on-surface-variant">
                          Tên đơn vị cơ bản
                        </label>
                        <input
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
                          placeholder="Ví dụ: chai"
                          type="text"
                          value={form.baseUnit?.name || ''}
                          onChange={(event) =>
                            handleChange('baseUnit', {
                              ...(form.baseUnit || {}),
                              name: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="w-40 space-y-2">
                        <label className="text-label-md text-on-surface-variant">Giá bán</label>
                        <input
                          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-right focus:ring-0"
                          type="text"
                          value={formatMoney(form.baseUnit?.price || 0)}
                          onChange={(event) =>
                            handleChange('baseUnit', {
                              ...(form.baseUnit || {}),
                              price: Number(event.target.value.replaceAll(',', '')) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 pb-2.5">
                        <input
                          checked={!!form.baseUnit?.directSale}
                          className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8] focus:ring-[#1E6BB8]"
                          id="direct-sell-main"
                          type="checkbox"
                          onChange={(event) =>
                            handleChange('baseUnit', {
                              ...(form.baseUnit || {}),
                              directSale: event.target.checked,
                            })
                          }
                        />
                        <label
                          className="cursor-pointer text-[15px] leading-[1.35]"
                          htmlFor="direct-sell-main"
                        >
                          Bán trực tiếp
                        </label>
                      </div>
                    </div>

                    {/* Divider */}
                    {(form.conversionUnits || []).length > 0 && (
                      <div className="mb-6 border-t border-gray-200" />
                    )}

                    {/* Conversion Units List */}
                    {(form.conversionUnits || []).length > 0 && (
                      <div className="mb-6 space-y-3">
                        <h5 className="text-[14px] font-semibold text-gray-700">Đơn vị quy đổi</h5>
                        {(form.conversionUnits || []).map((unit) => (
                          <div
                            key={unit.id}
                            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            {/* Formula: 1 [unit.name] = [convertValue] [convertFrom] */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-medium text-gray-700">1</span>
                              <span className="text-[14px] font-semibold text-gray-700">
                                {unit.name}
                              </span>
                              <span className="text-[16px] font-semibold text-gray-600">=</span>
                              <span className="text-[14px] font-medium text-gray-700">
                                {unit.convertValue}
                              </span>
                              <span className="text-[14px] font-semibold text-gray-700">
                                {unit.convertFrom}
                              </span>
                            </div>

                            {/* Spacer */}
                            <div className="min-w-[20px] flex-1" />

                            {/* Calculated price */}
                            <div className="min-w-[100px] text-right">
                              <span className="text-[14px] text-gray-600">
                                {(() => {
                                  const base = Number(form.baseUnit?.price) || 0;
                                  // build map for lookup
                                  const unitsByName = (form.conversionUnits || []).reduce(
                                    (acc, u) => {
                                      acc[u.name] = u;
                                      return acc;
                                    },
                                    {}
                                  );
                                  const computeMultiplierForUnit = (uName, visited = new Set()) => {
                                    if (!uName) return null;
                                    if (visited.has(uName)) return null;
                                    if (uName === form.baseUnit?.name) return 1;
                                    const uu = unitsByName[uName];
                                    if (!uu) return null;
                                    visited.add(uName);
                                    if (uu.convertFrom === form.baseUnit?.name)
                                      return uu.convertValue;
                                    const pm = computeMultiplierForUnit(uu.convertFrom, visited);
                                    if (pm == null) return null;
                                    return uu.convertValue * pm;
                                  };
                                  const mult = computeMultiplierForUnit(unit.name);
                                  const price =
                                    mult && base ? base * mult : unit.calculatedPrice || 0;
                                  return price ? formatMoney(price) : '-';
                                })()}
                              </span>
                            </div>

                            {/* Direct sale checkbox */}
                            <div className="flex flex-none items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={unit.directSale || false}
                                onChange={(e) =>
                                  updateConversionUnit(unit.id, 'directSale', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8]"
                              />
                              <span className="text-[14px] text-gray-600">Bán</span>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeConversionUnit(unit.id)}
                              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <MaterialIcon name="delete" className="text-[18px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setAddConversionUnitModal(true)}
                      className="text-body-md flex items-center font-semibold text-[#1E6BB8] hover:underline"
                    >
                      <MaterialIcon name="add" className="mr-1" />
                      Thêm đơn vị
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="mb-1 text-[18px] font-semibold text-gray-800">Thuộc tính</h4>
                    <p className="mb-5 text-[14px] text-gray-500">
                      Thêm đặc điểm như hương vị, dung tích, màu sắc
                    </p>

                    <div className="space-y-3">
                      {(form.attributes || []).map((attr) => (
                        <div
                          key={attr.id}
                          className="grid items-center"
                          style={{
                            gridTemplateColumns: '230px 1fr 52px',
                            gap: '12px',
                            alignItems: 'center',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Select dropdown (custom) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === attr.id ? null : attr.id);
                              }}
                              className={`h-12 w-full border bg-white px-4 text-left ${openDropdownId === attr.id ? 'border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-[#d1d5db]'} flex items-center justify-between rounded-[10px] text-[16px]`}
                            >
                              <span
                                className={`truncate ${attr.name ? 'text-gray-800' : 'text-gray-500'}`}
                              >
                                {attr.name || 'Chọn thuộc tính'}
                              </span>
                              <MaterialIcon name="expand_more" className="text-gray-500" />
                            </button>

                            {/* Dropdown menu */}
                            {openDropdownId === attr.id ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-full left-0 z-50 mb-2 w-full origin-bottom transform overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-200 ease-out"
                                style={{
                                  padding: '8px 0',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                }}
                              >
                                {availableAttributes.map((item, aidx) => (
                                  <div
                                    key={item + aidx}
                                    onClick={() => {
                                      updateAttr(attr.id, 'name', item);
                                      setOpenDropdownId(null);
                                    }}
                                    className={`flex h-11 cursor-pointer items-center justify-between px-4 ${attr.name === item ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                                    style={{ padding: '0 16px' }}
                                  >
                                    <span className="flex-1">{item}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditAttrIndex(aidx);
                                        setEditAttrValue(item);
                                        setEditAttrModalOpen(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                      <MaterialIcon name="edit" />
                                    </button>
                                  </div>
                                ))}
                                <div
                                  onClick={() => {
                                    setEditingAttrId(attr.id);
                                    setNewAttrName('');
                                    setCreateAttrModalOpen(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`flex h-11 cursor-pointer items-center px-4 hover:bg-gray-100`}
                                  style={{ padding: '0 16px' }}
                                >
                                  <span className="font-medium text-blue-600">
                                    + Tạo thuộc tính mới
                                  </span>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {/* Value input */}
                          <input
                            type="text"
                            placeholder="Nhập giá trị thuộc tính"
                            value={attr.value || ''}
                            onChange={(e) => updateAttr(attr.id, 'value', e.target.value)}
                            className="h-12 rounded-[10px] bg-[#f3f4f6] px-4 text-[16px] placeholder-gray-400 focus:border focus:border-blue-600 focus:bg-white focus:outline-none"
                          />

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeAttr(attr.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white hover:bg-red-50"
                            onMouseEnter={(e) => {
                              e.currentTarget.classList.add('border-red-500');
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.classList.remove('border-red-500');
                            }}
                          >
                            <MaterialIcon name="delete" className="text-gray-600" />
                          </button>
                        </div>
                      ))}

                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addAttrRow();
                          }}
                          className="mt-2 text-[18px] font-medium text-blue-600 hover:underline"
                        >
                          + Thêm thuộc tính
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>
              </>
            ) : (
              <div className="px-6 pb-6">
                {/* Description Card */}
                <div className="mt-5 overflow-hidden rounded-md border border-[#dcdfe6] bg-white">
                  {/* Toolbar */}
                  <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-[#f5f6f7] px-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">Mô tả</span>
                      <select className="rounded border bg-transparent px-2 py-1 text-sm text-gray-700">
                        <option>Format</option>
                      </select>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_bold" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_italic" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_underlined" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_align_left" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_align_center" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_align_right" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_list_bulleted" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="format_list_numbered" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="link" />
                      </button>
                      <button type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
                        <MaterialIcon name="image" />
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <textarea
                    className="min-h-[160px] w-full resize-none bg-white p-4 text-[15px] leading-[1.4] outline-none"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>

                {/* Sample Note Card */}
                <div className="mt-4 overflow-hidden rounded-md border border-[#dcdfe6]">
                  <div className="bg-[#f5f6f7] px-4 py-3 font-semibold">
                    Mẫu ghi chú (hóa đơn, đặt hàng)
                  </div>
                  <textarea
                    className="min-h-[120px] w-full resize-none border-none p-4 outline-none"
                    placeholder=""
                  />
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center space-x-3">
              <input
                checked={!!form.directSale}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                id="footer-sell-direct"
                type="checkbox"
                onChange={(event) => handleChange('directSale', event.target.checked)}
              />
              <label
                className="flex cursor-pointer items-center text-sm font-semibold text-gray-700"
                htmlFor="footer-sell-direct"
              >
                Bán trực tiếp
                <span className="material-symbols-outlined ml-2 text-[18px] text-gray-400">
                  info
                </span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] rounded-[8px] border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="h-[42px] rounded-[8px] bg-blue-600 px-5 text-sm font-semibold text-white"
              >
                Lưu (F9)
              </button>
            </div>
          </footer>
        </form>
        {/* Create attribute small modal */}
        {createAttrModalOpen ? (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Tạo thuộc tính</h3>
              </div>
              <div className="p-6">
                <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setCreateAttrModalOpen(false);
                    setEditingAttrId(null);
                  }}
                  className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = (newAttrName || '').trim();
                    if (name) {
                      // add to available list (persist) and set on the row
                      addAvailableAttribute(name);
                      if (editingAttrId) updateAttr(editingAttrId, 'name', name);
                    }
                    setCreateAttrModalOpen(false);
                    setEditingAttrId(null);
                  }}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {/* Edit global attribute modal */}
        {editAttrModalOpen ? (
          <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Sửa thuộc tính</h3>
              </div>
              <div className="p-6">
                <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
                <input
                  type="text"
                  value={editAttrValue}
                  onChange={(e) => setEditAttrValue(e.target.value)}
                  placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      // delete attribute from available list and clear usages
                      const oldName = availableAttributes[editAttrIndex];
                      const next = (availableAttributes || []).filter(
                        (_, i) => i !== editAttrIndex
                      );
                      persistAvailableAttributes(next);
                      setForm((current) => ({
                        ...current,
                        attributes: (current.attributes || []).map((a) =>
                          a.name === oldName ? { ...a, name: '' } : a
                        ),
                      }));
                      setEditAttrModalOpen(false);
                      setEditAttrIndex(null);
                    }}
                    className="flex h-10 items-center gap-2 rounded-md border border-transparent bg-white px-3 text-sm font-medium text-gray-700 hover:bg-red-50"
                  >
                    <MaterialIcon name="delete" />
                    <span className="text-sm">Xóa</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditAttrModalOpen(false);
                      setEditAttrIndex(null);
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const oldName = availableAttributes[editAttrIndex];
                      const next = (availableAttributes || []).map((v, i) =>
                        i === editAttrIndex ? editAttrValue || v : v
                      );
                      persistAvailableAttributes(next);
                      // update rows that used the old name
                      setForm((current) => ({
                        ...current,
                        attributes: (current.attributes || []).map((a) =>
                          a.name === oldName ? { ...a, name: editAttrValue || oldName } : a
                        ),
                      }));
                      setEditAttrModalOpen(false);
                      setEditAttrIndex(null);
                    }}
                    className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                  >
                    Xong
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Create group modal */}
        {createGroupModalOpen ? (
          <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Tạo nhóm hàng</h3>
                <button
                  onClick={() => setCreateGroupModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm text-gray-700">Tên nhóm</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder=""
                    className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-700">Nhóm cha</label>
                  <select
                    value={newGroupParent}
                    onChange={(e) => setNewGroupParent(e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Chọn nhóm hàng</option>
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setCreateGroupModalOpen(false)}
                  className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = (newGroupName || '').trim();
                    if (name) {
                      const next = [...groups, name];
                      persistGroups(next);
                      handleChange('group', name);
                    }
                    setCreateGroupModalOpen(false);
                  }}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Create brand modal */}
        {createBrandModalOpen ? (
          <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Tạo thương hiệu</h3>
                <button
                  onClick={() => setCreateBrandModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="p-6">
                <label className="mb-2 block text-sm text-gray-700">Tên thương hiệu</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder=""
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setCreateBrandModalOpen(false)}
                  className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = (newBrandName || '').trim();
                    if (name) {
                      const next = [...brands, name];
                      persistBrands(next);
                      handleChange('brand', name);
                    }
                    setCreateBrandModalOpen(false);
                  }}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Create location modal */}
        {createLocationModalOpen ? (
          <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Tạo vị trí</h3>
                <button
                  onClick={() => setCreateLocationModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="p-6">
                <label className="mb-2 block text-sm text-gray-700">Vị trí</label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder=""
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setCreateLocationModalOpen(false)}
                  className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = (newLocationName || '').trim();
                    if (name) {
                      const next = [...locations, name];
                      persistLocations(next);
                      addLocation(name);
                    }
                    setCreateLocationModalOpen(false);
                  }}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Add conversion unit modal */}
        {addConversionUnitModal ? (
          <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold">Thêm đơn vị quy đổi</h3>
                <button
                  onClick={() => setAddConversionUnitModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="space-y-4 p-6">
                {/* Unit name */}
                <div>
                  <label className="mb-2 block text-sm text-gray-700">Tên đơn vị</label>
                  <input
                    type="text"
                    value={newConversionUnit.name}
                    onChange={(e) =>
                      setNewConversionUnit({ ...newConversionUnit, name: e.target.value })
                    }
                    placeholder="Ví dụ: lốc, thùng"
                    className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Conversion formula display */}
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-900">Công thức quy đổi:</div>
                  <div className="mt-2 text-base">
                    <span className="font-semibold">
                      1 {newConversionUnit.name || '[tên đơn vị]'}
                    </span>
                    <span className="mx-2">=</span>
                    <span className="font-semibold">{newConversionUnit.convertValue || '?'}</span>
                    <span className="ml-2">{newConversionUnit.convertFrom || '[đơn vị gốc]'}</span>
                  </div>
                </div>

                {/* Conversion value and base unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">Giá trị quy đổi</label>
                    <input
                      type="number"
                      value={newConversionUnit.convertValue}
                      onChange={(e) =>
                        setNewConversionUnit({ ...newConversionUnit, convertValue: e.target.value })
                      }
                      placeholder="Ví dụ: 4, 20"
                      min="1"
                      className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-gray-700">Đơn vị quy đổi từ</label>
                    <select
                      value={newConversionUnit.convertFrom}
                      onChange={(e) =>
                        setNewConversionUnit({ ...newConversionUnit, convertFrom: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Chọn đơn vị</option>
                      {form.baseUnit?.name && (
                        <option value={form.baseUnit.name}>{form.baseUnit.name}</option>
                      )}
                      {(form.conversionUnits || []).map((unit) => (
                        <option key={unit.id} value={unit.name}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculated price preview */}
                <div>
                  <label className="mb-2 block text-sm text-gray-700">Giá bán (tự tính)</label>
                  <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-right text-sm text-gray-700">
                    {(() => {
                      // compute preview price
                      const base = Number(form.baseUnit?.price) || 0;
                      const cv = Number(newConversionUnit.convertValue) || 0;
                      const from = newConversionUnit.convertFrom;
                      const unitsByName = (form.conversionUnits || []).reduce((acc, u) => {
                        acc[u.name] = u;
                        return acc;
                      }, {});
                      const computeMultiplierPreview = (fromName, visited = new Set()) => {
                        if (!fromName) return null;
                        if (visited.has(fromName)) return null;
                        if (!form.baseUnit?.name) return null;
                        if (fromName === form.baseUnit.name) return 1;
                        const u = unitsByName[fromName];
                        if (!u) return null;
                        visited.add(fromName);
                        if (u.convertFrom === form.baseUnit.name) return u.convertValue;
                        const pm = computeMultiplierPreview(u.convertFrom, visited);
                        if (pm == null) return null;
                        return u.convertValue * pm;
                      };
                      const previewMultiplier = (() => {
                        if (!from) return null;
                        if (from === form.baseUnit?.name) return cv;
                        const parentMultiplier = computeMultiplierPreview(from);
                        if (parentMultiplier == null) return null;
                        return cv * parentMultiplier;
                      })();
                      const previewPrice = previewMultiplier && base ? base * previewMultiplier : 0;
                      return previewPrice ? formatMoney(previewPrice) : '-';
                    })()}
                  </div>
                </div>

                {/* Direct sale checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="direct-sell-conv"
                    checked={newConversionUnit.directSale}
                    onChange={(e) =>
                      setNewConversionUnit({ ...newConversionUnit, directSale: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#1E6BB8]"
                  />
                  <label htmlFor="direct-sell-conv" className="text-sm text-gray-700">
                    Cho phép bán đơn vị này
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setAddConversionUnitModal(false)}
                  className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={addConversionUnitHandler}
                  className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EditProductModal;
