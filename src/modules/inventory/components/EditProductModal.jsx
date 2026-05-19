import { useEffect, useState, useRef } from 'react';
import MaterialIcon from './MaterialIcon';

const formatMoney = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value || '';
  return new Intl.NumberFormat('vi-VN').format(numberValue);
};

// Component Section có thể ẩn/hiện nội dung bằng cách click vào header
// Dùng mũi tên bên phải để biểu thị trạng thái (xoay khi mở/đóng)
const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <section className="border border-outline-variant rounded-[10px] bg-surface-container-lowest shadow-sm mb-6 overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[20px] font-semibold text-on-surface leading-tight mb-2">{title}</h3>
            {subtitle ? <p className="text-body-md text-on-surface-variant mb-0 leading-relaxed">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <MaterialIcon name="expand_more" className={`text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>
      </div>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
};

const EditProductModal = ({ open, onClose, product, onSave }) => {
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
  const [editAttrModalOpen, setEditAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState(null);
  const [editAttrValue, setEditAttrValue] = useState('');

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
      try { localStorage.setItem('availableAttributes', JSON.stringify(next)); } catch (e) {}
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
    try { localStorage.setItem('productGroups', JSON.stringify(next)); } catch (e) {}
    setGroups(next);
  };

  const persistBrands = (next) => {
    try { localStorage.setItem('productBrands', JSON.stringify(next)); } catch (e) {}
    setBrands(next);
  };

  const persistLocations = (next) => {
    try { localStorage.setItem('productLocations', JSON.stringify(next)); } catch (e) {}
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
  const MAX_IMAGES = 4;
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
        id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
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
        try { URL.revokeObjectURL(removed.url); } catch (e) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // keep form.image in sync with first image preview for backward compatibility
  useEffect(() => {
    setForm((current) => ({ ...current, image: images[0]?.url || '' }));
  }, [images]);

  useEffect(() => {
    const defaultForm = {
      id: 'SP000023',
      barcode: '',
      name: 'Thép Việt Ý - Thép cây D16',
      group: 'Vật liệu thô',
      brand: '',
      image:
        'https://via.placeholder.com/800x800.png?text=SP+Main',
      images: [
        { id: 'm1', url: 'https://via.placeholder.com/800x800.png?text=SP+Main' },
        { id: 'm2', url: 'https://via.placeholder.com/800x800.png?text=SP+2' },
        { id: 'm3', url: 'https://via.placeholder.com/800x800.png?text=SP+3' },
        { id: 'm4', url: 'https://via.placeholder.com/800x800.png?text=SP+4' },
      ],
      costPrice: 239400,
      salePrice: 252000,
      stock: 0,
      stockMin: 0,
      stockMax: 10,
      locations: [],
      weight: '',
      weightUnit: 'g',
      width: '',
      length: '',
      height: '',
      baseUnit: {
        name: 'chai',
        price: 252000,
        directSale: true,
      },
      conversionUnits: [],
      attributes: [{ id: Date.now(), name: '', value: '' }],
    };

    if (product) {
      setForm((current) => ({ ...defaultForm, ...product }));
      // initialize images from product if available
      const initImages = (product.images && product.images.length)
        ? product.images
        : (product.image ? [{ id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-init`, url: product.image }] : []);
      setImages(initImages);
    } else {
      setForm(defaultForm);
      setImages(defaultForm.images && defaultForm.images.length ? defaultForm.images.slice(0, MAX_IMAGES) : (defaultForm.image ? [{ id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-init`, url: defaultForm.image }] : []));
    }
  }, [product]);

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  // Attributes state helpers
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [createAttrModalOpen, setCreateAttrModalOpen] = useState(false);
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [newAttrName, setNewAttrName] = useState('');

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
    const unitsByName = ((form.conversionUnits || [])).reduce((acc, u) => { acc[u.name] = u; return acc; }, {});
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
    const calculatedPrice = newMultiplier && form.baseUnit?.price ? Number(form.baseUnit.price) * newMultiplier : 0;

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

    setNewConversionUnit({ name: '', convertValue: '', convertFrom: '', price: '', directSale: false });
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
      conversionUnits: (current.conversionUnits || []).map((u) => (u.id === id ? { ...u, [key]: val } : u)),
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
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden sm:mx-6 font-sans">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-20 bg-white">
          <h1 className="text-[20px] font-bold leading-tight text-on-surface">Sửa hàng hóa</h1>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <MaterialIcon name="close" className="text-on-surface-variant" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex h-12 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`h-12 px-4 flex items-center text-sm tracking-wider ${activeTab === 'info' ? 'border-b-2 border-transparent text-gray-700 font-semibold' : 'text-gray-500'}`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`h-12 px-4 flex items-center text-sm tracking-wider ${activeTab === 'description' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            Mô tả
          </button>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scroll sm:px-6 sm:py-5">
            {activeTab === 'info' ? (
              <>
                {/* Basic Info Section - Not in card, just layout */}
                <section className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-9">
                    {/* Product Code and Barcode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-label-md text-on-surface-variant">Mã hàng</label>
                        <input className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0" type="text" value={form.id || ''} onChange={(event) => handleChange('id', event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-label-md text-on-surface-variant">Mã vạch</label>
                        <input className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0" placeholder="Nhập mã vạch" type="text" value={form.barcode || ''} onChange={(event) => handleChange('barcode', event.target.value)} />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="mt-5 space-y-2">
                      <label className="text-label-md text-on-surface-variant">Tên hàng</label>
                      <input className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0 font-semibold" type="text" value={form.name || ''} onChange={(event) => handleChange('name', event.target.value)} />
                    </div>

                    {/* Category and Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-label-md text-on-surface-variant">Nhóm hàng</label>
                          <button type="button" onClick={() => { setNewGroupName(''); setNewGroupParent(''); setCreateGroupModalOpen(true); }} className="text-label-sm text-primary hover:underline font-semibold">Tạo mới</button>
                        </div>
                        <select className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0" value={form.group || ''} onChange={(event) => handleChange('group', event.target.value)}>
                          <option>Chọn nhóm hàng</option>
                          {groups.map((g) => <option key={g}>{g}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-label-md text-on-surface-variant">Thương hiệu</label>
                          <button type="button" onClick={() => { setNewBrandName(''); setCreateBrandModalOpen(true); }} className="text-label-sm text-primary hover:underline font-semibold">Tạo mới</button>
                        </div>
                        <select className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0" value={form.brand || ''} onChange={(event) => handleChange('brand', event.target.value)}>
                          <option>Chọn thương hiệu</option>
                          {brands.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-12 lg:col-span-3">
                    <div className="flex flex-col gap-3">
                      {/* Hidden file input */}
                      <input ref={fileInputRef} onChange={handleUpload} type="file" accept="image/*" multiple className="hidden" />

                      {/* Main preview */}
                      <div className="relative w-full aspect-[1/1] rounded-[14px] overflow-hidden border border-[#e5e7eb] bg-[#f9fafb]">
                        {images && images.length > 0 ? (
                          <>
                            <img src={images[0].url} alt={form.name || 'Product'} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-black/75 text-white px-3 py-1 rounded-full text-[12px] font-semibold z-20">Main</div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <button type="button" onClick={handleOpenFilePicker} className="flex flex-col items-center gap-2">
                              <MaterialIcon name="add" className="text-3xl text-gray-400" />
                              <span className="text-sm">Upload</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Thumbnail list */}
                      <div className="grid grid-cols-4 gap-3">
                        {/* Upload box */}
                        <div onClick={handleOpenFilePicker} className="aspect-square rounded-[12px] overflow-hidden border-2 border-dashed border-[#d1d5db] bg-white flex items-center justify-center text-[28px] text-[#6b7280] cursor-pointer transition-all duration-200 hover:border-blue-600 hover:text-blue-600 hover:bg-[#eff6ff]">
                          +
                        </div>

                        {images.map((img, idx) => (
                          <div key={img.id} className="thumbnail-hover relative aspect-square rounded-[12px] overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                            <img src={img.url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />

                            {/* Overlay actions */}
                            <div className="thumbnail-actions absolute top-2 right-2 flex flex-col gap-2 opacity-0 transform -translate-y-1 transition-all duration-200">
                              <button title="Pin" type="button" onClick={() => handlePinImage(idx)} className="w-8 h-8 rounded-[10px] bg-white/95 border border-[#e5e7eb] flex items-center justify-center hover:bg-[#eff6ff] hover:border-blue-600">
                                <MaterialIcon name="push_pin" className="text-gray-600" />
                              </button>
                              <button title="Xóa" type="button" onClick={() => handleRemoveImage(idx)} className="w-8 h-8 rounded-[10px] bg-white/95 border border-[#e5e7eb] flex items-center justify-center hover:bg-[#fef2f2] hover:border-red-500">
                                <MaterialIcon name="delete" className="text-red-500" />
                              </button>
                            </div>

                            {/* show overlay on hover via parent group */}
                            <style>{`
                              .thumbnail-hover:hover .thumbnail-actions { opacity: 1; transform: translateY(0); }
                            `}</style>
                          </div>
                        ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Tồn kho hiện tại</label>
                      <input className="w-full border border-outline-variant rounded-lg text-right text-body-md py-2 px-3 bg-surface-container-lowest font-semibold focus:ring-0" type="text" value={form.stock || '0'} onChange={(event) => handleChange('stock', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Định mức tồn thấp nhất</label>
                      <input className="w-full border border-outline-variant rounded-lg text-right text-body-md py-2 px-3 bg-surface-container-lowest focus:ring-0" type="text" value={form.stockMin || '0'} onChange={(event) => handleChange('stockMin', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Định mức tồn cao nhất</label>
                      <input className="w-full border border-outline-variant rounded-lg text-right text-body-md py-2 px-3 bg-surface-container-lowest focus:ring-0" type="text" value={form.stockMax || '10'} onChange={(event) => handleChange('stockMax', event.target.value)} />
                    </div>
                  </div>
                </Section>

                {/* Pricing Section - Card */}
                <Section title="Giá vốn, giá bán" defaultOpen>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-label-md text-on-surface-variant">Giá vốn</label>
                      <div className="relative">
                        <input
                          className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant bg-transparent py-2 pr-8 text-right text-body-lg font-bold leading-[1.2] focus:border-primary"
                          type="text"
                          value={formatMoney(form.costPrice)}
                          onChange={(event) => handleChange('costPrice', event.target.value.replaceAll(',', ''))}
                        />
                        <span className="absolute right-0 bottom-2 text-label-md font-normal leading-[1.1] text-on-surface-variant">đ</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-label-md text-on-surface-variant">Giá bán</label>
                        <button type="button" className="flex items-center gap-1 text-label-md font-bold leading-[1.15] text-primary">
                          <MaterialIcon name="settings" className="text-base" />
                          Thiết lập giá
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-outline-variant bg-transparent py-2 pr-8 text-right text-body-lg font-bold leading-[1.2] text-primary focus:border-primary"
                          type="text"
                          value={formatMoney(form.salePrice)}
                          onChange={(event) => handleChange('salePrice', event.target.value.replaceAll(',', ''))}
                        />
                        <span className="absolute right-0 bottom-2 text-label-md font-normal leading-[1.1] text-on-surface-variant">đ</span>
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
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-label-md text-on-surface-variant">Vị trí</label>
                        <button type="button" onClick={() => { setNewLocationName(''); setCreateLocationModalOpen(true); }} className="text-label-sm text-primary hover:underline font-semibold">
                          Tạo mới
                        </button>
                      </div>
                      <div className="relative w-full border border-outline-variant rounded-[8px] bg-surface-container-lowest px-3 py-2.5 text-[15px] flex flex-wrap items-center gap-2 min-h-[44px]">
                        {(form.locations || []).map((loc) => (
                          <div key={loc} className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => removeLocation(loc)}
                              className="text-gray-600 hover:text-gray-800 font-bold"
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
                          className="flex-1 border-none bg-transparent px-3 py-2 text-right text-[15px] leading-[1.35] font-semibold focus:ring-0"
                          type="text"
                          value={form.weight || ''}
                          onChange={(event) => handleChange('weight', event.target.value)}
                        />
                        <select
                          className="cursor-pointer border-l border-outline-variant bg-surface-container-low px-2 py-2 text-label-sm font-bold leading-[1.15] text-primary focus:ring-0"
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
                      <div className="inline-flex items-stretch w-full border border-[#dcdfe6] rounded-lg overflow-hidden bg-white">
                        <input
                          type="text"
                          placeholder="Rộng"
                          value={form.width || ''}
                          onChange={(e) => handleChange('width', e.target.value)}
                          className="w-1/3 text-center px-3 py-2 placeholder-gray-400 text-[15px] bg-white border-r border-[#e5e7eb] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Dài"
                          value={form.length || ''}
                          onChange={(e) => handleChange('length', e.target.value)}
                          className="w-1/3 text-center px-3 py-2 placeholder-gray-400 text-[15px] bg-white border-r border-[#e5e7eb] focus:outline-none"
                        />
                        <div className="relative w-1/3">
                          <select
                            value={form.sizeUnit || ''}
                            onChange={(e) => handleChange('sizeUnit', e.target.value)}
                            className="appearance-none w-full px-3 py-2 bg-white text-left text-[15px] focus:outline-none"
                          >
                            <option value="">mm</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                          </select>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <MaterialIcon name="expand_more" className="text-base" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Unit Management Section - Card */}
                <Section
                  title="Quản lý theo đơn vị tính và thuộc tính"
                  defaultOpen
                >
                  <div className="mb-8">
                    <h4 className="text-label-md font-bold text-on-surface mb-1">Đơn vị tính</h4>
                    <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed">Thêm đơn vị bán hoặc nhập như chai, lốc, thùng. Đặt công thức quy đổi để tính nhanh giá và tồn kho. Ví dụ: 1 lốc = 4 chai, 1 thùng = 20 lốc.</p>

                    <div className="mb-6 flex flex-wrap items-end gap-5">
                      <div className="min-w-[200px] flex-1 space-y-2">
                        <label className="text-label-md text-on-surface-variant">Tên đơn vị cơ bản</label>
                        <input className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest focus:ring-0" placeholder="Ví dụ: chai" type="text" value={form.baseUnit?.name || ''} onChange={(event) => handleChange('baseUnit', { ...(form.baseUnit || {}), name: event.target.value })} />
                      </div>
                      <div className="w-40 space-y-2">
                        <label className="text-label-md text-on-surface-variant">Giá bán</label>
                        <input className="w-full border border-outline-variant rounded-lg text-body-md px-3 py-2.5 bg-surface-container-lowest text-right focus:ring-0" type="text" value={formatMoney(form.baseUnit?.price || 0)} onChange={(event) => handleChange('baseUnit', { ...(form.baseUnit || {}), price: Number(event.target.value.replaceAll(',', '')) || 0 })} />
                      </div>
                      <div className="flex items-center space-x-2 pb-2.5">
                        <input
                          checked={!!form.baseUnit?.directSale}
                          className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8] focus:ring-[#1E6BB8]"
                          id="direct-sell-main"
                          type="checkbox"
                          onChange={(event) => handleChange('baseUnit', { ...(form.baseUnit || {}), directSale: event.target.checked })}
                        />
                        <label className="cursor-pointer text-[15px] leading-[1.35]" htmlFor="direct-sell-main">
                          Bán trực tiếp
                        </label>
                      </div>
                    </div>

                    {/* Divider */}
                    {(form.conversionUnits || []).length > 0 && <div className="mb-6 border-t border-gray-200" />}

                    {/* Conversion Units List */}
                    {(form.conversionUnits || []).length > 0 && (
                      <div className="mb-6 space-y-3">
                        <h5 className="text-[14px] font-semibold text-gray-700">Đơn vị quy đổi</h5>
                        {(form.conversionUnits || []).map((unit) => (
                          <div key={unit.id} className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* Formula: 1 [unit.name] = [convertValue] [convertFrom] */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] text-gray-700 font-medium">1</span>
                              <span className="text-[14px] text-gray-700 font-semibold">{unit.name}</span>
                              <span className="text-[16px] font-semibold text-gray-600">=</span>
                              <span className="text-[14px] text-gray-700 font-medium">{unit.convertValue}</span>
                              <span className="text-[14px] text-gray-700 font-semibold">{unit.convertFrom}</span>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1 min-w-[20px]" />

                            {/* Calculated price */}
                            <div className="min-w-[100px] text-right">
                              <span className="text-[14px] text-gray-600">{(() => {
                                const base = Number(form.baseUnit?.price) || 0;
                                // build map for lookup
                                const unitsByName = ((form.conversionUnits || [])).reduce((acc, u) => { acc[u.name] = u; return acc; }, {});
                                const computeMultiplierForUnit = (uName, visited = new Set()) => {
                                  if (!uName) return null;
                                  if (visited.has(uName)) return null;
                                  if (uName === form.baseUnit?.name) return 1;
                                  const uu = unitsByName[uName];
                                  if (!uu) return null;
                                  visited.add(uName);
                                  if (uu.convertFrom === form.baseUnit?.name) return uu.convertValue;
                                  const pm = computeMultiplierForUnit(uu.convertFrom, visited);
                                  if (pm == null) return null;
                                  return uu.convertValue * pm;
                                };
                                const mult = computeMultiplierForUnit(unit.name);
                                const price = mult && base ? base * mult : unit.calculatedPrice || 0;
                                return price ? formatMoney(price) : '-';
                              })()}</span>
                            </div>

                            {/* Direct sale checkbox */}
                            <div className="flex items-center space-x-2 flex-none">
                              <input
                                type="checkbox"
                                checked={unit.directSale || false}
                                onChange={(e) => updateConversionUnit(unit.id, 'directSale', e.target.checked)}
                                className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8]"
                              />
                              <span className="text-[14px] text-gray-600">Bán</span>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeConversionUnit(unit.id)}
                              className="flex-none w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center border border-red-200"
                            >
                              <MaterialIcon name="delete" className="text-[18px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button type="button" onClick={() => setAddConversionUnitModal(true)} className="text-[#1E6BB8] text-body-md font-semibold flex items-center hover:underline"><MaterialIcon name="add" className="mr-1" />Thêm đơn vị</button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-[18px] font-semibold text-gray-800 mb-1">Thuộc tính</h4>
                    <p className="text-[14px] text-gray-500 mb-5">Thêm đặc điểm như hương vị, dung tích, màu sắc</p>

                    <div className="space-y-3">
                      {(form.attributes || []).map((attr) => (
                        <div
                          key={attr.id}
                          className="grid items-center"
                          style={{ gridTemplateColumns: '230px 1fr 52px', gap: '12px', alignItems: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Select dropdown (custom) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === attr.id ? null : attr.id); }}
                              className={`h-12 w-full text-left px-4 bg-white border ${openDropdownId === attr.id ? 'border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-[#d1d5db]'} rounded-[10px] text-[16px] flex items-center justify-between`}
                            >
                              <span className={`truncate ${attr.name ? 'text-gray-800' : 'text-gray-500'}`}>{attr.name || 'Chọn thuộc tính'}</span>
                              <MaterialIcon name="expand_more" className="text-gray-500" />
                            </button>

                            {/* Dropdown menu */}
                            {openDropdownId === attr.id ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-lg overflow-hidden z-50 transform origin-bottom transition-all duration-200 ease-out"
                                style={{ padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                              >
                                {availableAttributes.map((item, aidx) => (
                                  <div
                                    key={item + aidx}
                                    onClick={() => {
                                      updateAttr(attr.id, 'name', item);
                                      setOpenDropdownId(null);
                                    }}
                                    className={`h-11 px-4 flex items-center justify-between cursor-pointer ${attr.name === item ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
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
                                  className={`h-11 px-4 flex items-center cursor-pointer hover:bg-gray-100`}
                                  style={{ padding: '0 16px' }}
                                >
                                  <span className="text-blue-600 font-medium">+ Tạo thuộc tính mới</span>
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
                            className="h-12 bg-[#f3f4f6] rounded-[10px] px-4 text-[16px] placeholder-gray-400 focus:bg-white focus:border focus:border-blue-600 focus:outline-none"
                          />

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeAttr(attr.id)}
                            className="w-10 h-10 border border-[#d1d5db] rounded-[10px] bg-white flex items-center justify-center hover:bg-red-50"
                            onMouseEnter={(e) => { e.currentTarget.classList.add('border-red-500'); }}
                            onMouseLeave={(e) => { e.currentTarget.classList.remove('border-red-500'); }}
                          >
                            <MaterialIcon name="delete" className="text-gray-600" />
                          </button>
                        </div>
                      ))}

                      <div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addAttrRow(); }} className="mt-2 text-[18px] font-medium text-blue-600 hover:underline">
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
                <div className="mt-5 bg-white border border-[#dcdfe6] rounded-md overflow-hidden">
                  {/* Toolbar */}
                  <div className="bg-[#f5f6f7] h-10 flex items-center gap-2 px-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">Mô tả</span>
                      <select className="text-sm bg-transparent border rounded px-2 py-1 text-gray-700">
                        <option>Format</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_bold" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_italic" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_underlined" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_align_left" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_align_center" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_align_right" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_list_bulleted" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="format_list_numbered" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="link" /></button>
                      <button type="button" className="p-1 w-8 h-8 rounded hover:bg-gray-100"><MaterialIcon name="image" /></button>
                    </div>
                  </div>

                  {/* Editor */}
                  <textarea
                    className="min-h-[160px] w-full p-4 bg-white outline-none resize-none text-[15px] leading-[1.4]"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>

                {/* Sample Note Card */}
                <div className="mt-4 border border-[#dcdfe6] rounded-md overflow-hidden">
                  <div className="bg-[#f5f6f7] px-4 py-3 font-semibold">Mẫu ghi chú (hóa đơn, đặt hàng)</div>
                  <textarea className="min-h-[120px] w-full p-4 border-none outline-none resize-none" placeholder="" />
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
              <label className="text-sm flex cursor-pointer items-center font-semibold text-gray-700" htmlFor="footer-sell-direct">
                Bán trực tiếp
                <span className="material-symbols-outlined ml-2 text-[18px] text-gray-400">info</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] px-5 rounded-[8px] border border-gray-300 bg-white text-sm font-semibold text-gray-700"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="h-[42px] px-5 rounded-[8px] bg-blue-600 text-sm font-semibold text-white"
              >
                Lưu (F9)
              </button>
            </div>
          </footer>
        </form>
        {/* Create attribute small modal */}
        {createAttrModalOpen ? (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Tạo thuộc tính</h3>
              </div>
              <div className="p-6">
                <label className="text-sm text-gray-700 mb-2 block">Tên thuộc tính</label>
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => { setCreateAttrModalOpen(false); setEditingAttrId(null); }}
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
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
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Sửa thuộc tính</h3>
              </div>
              <div className="p-6">
                <label className="text-sm text-gray-700 mb-2 block">Tên thuộc tính</label>
                <input
                  type="text"
                  value={editAttrValue}
                  onChange={(e) => setEditAttrValue(e.target.value)}
                  placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      // delete attribute from available list and clear usages
                      const oldName = availableAttributes[editAttrIndex];
                      const next = (availableAttributes || []).filter((_, i) => i !== editAttrIndex);
                      persistAvailableAttributes(next);
                      setForm((current) => ({ ...current, attributes: (current.attributes || []).map((a) => (a.name === oldName ? { ...a, name: '' } : a)) }));
                      setEditAttrModalOpen(false);
                      setEditAttrIndex(null);
                    }}
                    className="h-10 px-3 rounded-md border border-transparent bg-white text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-red-50"
                  >
                    <MaterialIcon name="delete" />
                    <span className="text-sm">Xóa</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditAttrModalOpen(false); setEditAttrIndex(null); }}
                    className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const oldName = availableAttributes[editAttrIndex];
                      const next = (availableAttributes || []).map((v, i) => (i === editAttrIndex ? (editAttrValue || v) : v));
                      persistAvailableAttributes(next);
                      // update rows that used the old name
                      setForm((current) => ({ ...current, attributes: (current.attributes || []).map((a) => (a.name === oldName ? { ...a, name: (editAttrValue || oldName) } : a)) }));
                      setEditAttrModalOpen(false);
                      setEditAttrIndex(null);
                    }}
                    className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tạo nhóm hàng</h3>
                <button onClick={() => setCreateGroupModalOpen(false)} className="text-gray-500 hover:text-gray-700"><MaterialIcon name="close" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Tên nhóm</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder=""
                    className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Nhóm cha</label>
                  <select
                    value={newGroupParent}
                    onChange={(e) => setNewGroupParent(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn nhóm hàng</option>
                    {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCreateGroupModalOpen(false)}
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
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
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tạo thương hiệu</h3>
                <button onClick={() => setCreateBrandModalOpen(false)} className="text-gray-500 hover:text-gray-700"><MaterialIcon name="close" /></button>
              </div>
              <div className="p-6">
                <label className="text-sm text-gray-700 mb-2 block">Tên thương hiệu</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder=""
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCreateBrandModalOpen(false)}
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
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
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tạo vị trí</h3>
                <button onClick={() => setCreateLocationModalOpen(false)} className="text-gray-500 hover:text-gray-700"><MaterialIcon name="close" /></button>
              </div>
              <div className="p-6">
                <label className="text-sm text-gray-700 mb-2 block">Vị trí</label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder=""
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCreateLocationModalOpen(false)}
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
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
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thêm đơn vị quy đổi</h3>
                <button onClick={() => setAddConversionUnitModal(false)} className="text-gray-500 hover:text-gray-700"><MaterialIcon name="close" /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Unit name */}
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Tên đơn vị</label>
                  <input
                    type="text"
                    value={newConversionUnit.name}
                    onChange={(e) => setNewConversionUnit({ ...newConversionUnit, name: e.target.value })}
                    placeholder="Ví dụ: lốc, thùng"
                    className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* Conversion formula display */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="text-sm text-blue-900 font-medium">Công thức quy đổi:</div>
                  <div className="text-base mt-2">
                    <span className="font-semibold">1 {newConversionUnit.name || '[tên đơn vị]'}</span>
                    <span className="mx-2">=</span>
                    <span className="font-semibold">{newConversionUnit.convertValue || '?'}</span>
                    <span className="ml-2">{newConversionUnit.convertFrom || '[đơn vị gốc]'}</span>
                  </div>
                </div>

                {/* Conversion value and base unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Giá trị quy đổi</label>
                    <input
                      type="number"
                      value={newConversionUnit.convertValue}
                      onChange={(e) => setNewConversionUnit({ ...newConversionUnit, convertValue: e.target.value })}
                      placeholder="Ví dụ: 4, 20"
                      min="1"
                      className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Đơn vị quy đổi từ</label>
                    <select
                      value={newConversionUnit.convertFrom}
                      onChange={(e) => setNewConversionUnit({ ...newConversionUnit, convertFrom: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Chọn đơn vị</option>
                      {form.baseUnit?.name && <option value={form.baseUnit.name}>{form.baseUnit.name}</option>}
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
                  <label className="text-sm text-gray-700 mb-2 block">Giá bán (tự tính)</label>
                  <div className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm bg-gray-50 text-right text-gray-700">
                    {(() => {
                      // compute preview price
                      const base = Number(form.baseUnit?.price) || 0;
                      const cv = Number(newConversionUnit.convertValue) || 0;
                      const from = newConversionUnit.convertFrom;
                      const unitsByName = ((form.conversionUnits || [])).reduce((acc, u) => { acc[u.name] = u; return acc; }, {});
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
                    onChange={(e) => setNewConversionUnit({ ...newConversionUnit, directSale: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-[#1E6BB8]"
                  />
                  <label htmlFor="direct-sell-conv" className="text-sm text-gray-700">
                    Cho phép bán đơn vị này
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAddConversionUnitModal(false)}
                  className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={addConversionUnitHandler}
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium"
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
