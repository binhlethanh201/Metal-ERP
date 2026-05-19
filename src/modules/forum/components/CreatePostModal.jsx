/**
 * CreatePostModal Component - Modal để đăng bài
 * Đầy đủ tất cả các form từ CreatePost.jsx
 */

import { useMemo, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

// Các hằng số loại bài đăng và tùy chọn
const POST_TYPES = [
  { key: 'wholesale', icon: 'storefront', label: 'Đăng bán sỉ' },
  { key: 'supply', icon: 'search_insights', label: 'Tìm nguồn hàng' },
  { key: 'quote', icon: 'request_quote', label: 'Hỏi giá' },
  { key: 'trend', icon: 'trending_up', label: 'Thanh lý kho' },
  { key: 'trusted', icon: 'verified', label: 'Mua chung' },
];

const CATEGORY_OPTIONS = ['Vật liệu xây dựng', 'Thiết bị điện', 'Kim khí', 'Máy móc công nghiệp'];

const sampleImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAVGxDaomtTUeAkSwJJr9wuZJaUKXCYvUplrHvbQVvfUcLNpkFdXbP7ik9P83z9pr3LRQYDkpBF9qAfxiSF5a64K2dn1ofuPHmpybpIR_sMMyyupGxN8iKxYCFPU4DBIU6_HDe4PvQJIBlFS9Bu5XOSiW_G-Dba0QA-polMr4uIiNEw2_fGY720PpxBiwFw7Y0mgQxDuTuF7MrzilniYC0m2Am_d8g8nqNt1lAjVuDhh_W7_RMDti4e-fzKytKWAsBVjzgRkYMY8gR6';

const quoteProduct = {
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCnlusiF-0mwfqkYdH0Ya89uKwxkBZX147xtpYw71fYXzOy4qptu-Sm8CDlIJoUfGn_lWw7dqO_7nzMjOe_6YDEB-bGW8uxp0jaq5vOSQuBzLoBeO2qlG3z3MjrSH_d8VxQUmWjdJU68n6X4v8cYeHZEgYpqXXO3dElv2VkAdoGWLFiDk49dQT0e2UknM-al4qT43Ltyr7dkrvUscsva9PYy0ZCaN43LCSlf-qMrS3-VSY4twU07U2fVEikvrsLQSq-7HO1rlhkLG4W',
  name: 'Máy khoan động lực Bosch GSB 13 RE',
  description: 'Máy khoan chuyên dụng công suất cao, thiết kế nhỏ gọn phù hợp thi công công trình.',
  sku: 'BOS-GSB-13',
  supplier: 'Bosch Vietnam',
};

const TRUSTED_POST_PRESET = {
  title: 'Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
  category: CATEGORY_OPTIONS[0],
  area: 'TP.HCM & Miền Tây',
  content:
    'Chúng tôi chuyên cung cấp các dòng thép cuộn, thép cây thương hiệu Hòa Phát với đầy đủ chứng chỉ CO/CQ. Năng lực cung ứng lên đến 1000 tấn/tháng...',
  tags: ['kim_khi', 'son_chong_tham'],
};

export const CreatePostModal = ({ isOpen = false, onClose = () => {} }) => {
  // State chính
  const [postType, setPostType] = useState('trusted');
  const postTypeLabel = POST_TYPES.find((p) => p.key === postType)?.label || '';
  const modalTitleMap = {
    wholesale: 'Đăng bán sỉ',
    supply: 'Tìm nguồn hàng',
    quote: 'Hỏi giá',
    trend: 'Thanh lý kho',
    trusted: 'Đăng Mua chung',
  };
  const modalTitle = modalTitleMap[postType] || postTypeLabel || 'Đăng bài';
  const publishLabel = postTypeLabel.replace(/^Đăng\s*/i, '') || 'bài';
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  // Form data chính
  const [formData, setFormData] = useState({
    title: TRUSTED_POST_PRESET.title,
    category: CATEGORY_OPTIONS[0],
    area: TRUSTED_POST_PRESET.area,
    content: TRUSTED_POST_PRESET.content,
    tags: TRUSTED_POST_PRESET.tags,
    showTradeInfo: false,
    showSpecInfo: false,
    productName: '',
    unit: '',
    wholesalePrice: '',
    retailPrice: '',
    moq: '',
    stockStatus: 'in-stock',
  });

  // State cho thông số kỹ thuật (đang không sử dụng)
  const [images, setImages] = useState([{ id: 1, url: sampleImage, file: null }]);

  // State cho gắn sản phẩm
  // Mặc định tắt attachProduct để phần "Gắn sản phẩm" luôn ẩn cho đến khi user bật
  const [quoteOptions, setQuoteOptions] = useState({
    attachProduct: false,
    showPrice: false,
    showStock: false,
    showSupplier: false,
  });

  const [retailPrice, setRetailPrice] = useState('1.250.000');
  const [clearancePrice, setClearancePrice] = useState('850.000');
  const [attachedWholesalePrice, setAttachedWholesalePrice] = useState('1.250.000');
  const [attachedRetailPrice, setAttachedRetailPrice] = useState('850.000');
  const [productWholesalePrice, setProductWholesalePrice] = useState('15.500.000');
  const [productRetailPrice, setProductRetailPrice] = useState('Liên hệ');
  // Mặc định tắt hiển thị thông số để phần thông tin luôn ẩn cho đến khi user bật
  const [showTrustedSpecs, setShowTrustedSpecs] = useState(false);

  // State cho supply products
  const [supplyProducts, setSupplyProducts] = useState([
    {
      id: 1,
      title: 'Thép cuộn CB300-V Hòa Phát',
      image: quoteProduct.image,
      specs: [
        { id: 1, name: 'Độ phủ lý thuyết', value: '' },
        { id: 2, name: 'Thời gian khô', value: '' },
        { id: 3, name: 'Quy cách đóng gói', value: '' },
      ],
    },
  ]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // Tính phần trăm hoàn thiện
  const completionPercent = useMemo(() => {
    const checkpoints =
      postType === 'trusted'
        ? [
            Boolean(formData.title.trim()),
            Boolean(formData.category.trim()),
            Boolean(formData.area.trim()),
            Boolean(formData.content.trim()),
            formData.tags.length > 0,
            quoteOptions.attachProduct,
            showTrustedSpecs,
            supplyProducts[currentProductIndex]?.title.trim(),
          ]
        : [
            Boolean(formData.title.trim()),
            Boolean(formData.category.trim()),
            Boolean(formData.area.trim()),
            Boolean(formData.content.trim()),
            formData.tags.length > 0,
          ];

    const done = checkpoints.filter(Boolean).length;
    return Math.round((done / checkpoints.length) * 100);
  }, [
    currentProductIndex,
    formData,
    postType,
    quoteOptions.attachProduct,
    showTrustedSpecs,
    supplyProducts,
  ]);

  const progressOffset = useMemo(() => {
    const circumference = 364.42;
    return circumference - (completionPercent / 100) * circumference;
  }, [completionPercent]);

  // Các hàm handler
  const handleFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const normalizedTag = newTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (!normalizedTag || formData.tags.includes(normalizedTag) || formData.tags.length >= 5) {
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, normalizedTag] }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // (spec handlers removed because not used in this component)

  // Xử lý upload ảnh (preview)
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 6));
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSupplyProductChange = (field, value) => {
    setSupplyProducts((prev) =>
      prev.map((product, index) =>
        index === currentProductIndex ? { ...product, [field]: value } : product
      )
    );
  };

  const handleSupplySpecChange = (specId, field, value) => {
    setSupplyProducts((prev) =>
      prev.map((product, index) =>
        index === currentProductIndex
          ? {
              ...product,
              specs: product.specs.map((spec) =>
                spec.id === specId ? { ...spec, [field]: value } : spec
              ),
            }
          : product
      )
    );
  };

  const handleSupplyAddSpec = () => {
    const nextId = Date.now();
    setSupplyProducts((prev) =>
      prev.map((product, index) =>
        index === currentProductIndex
          ? { ...product, specs: [...product.specs, { id: nextId, name: '', value: '' }] }
          : product
      )
    );
  };

  const handleSupplyRemoveSpec = (specId) => {
    setSupplyProducts((prev) =>
      prev.map((product, index) =>
        index === currentProductIndex
          ? {
              ...product,
              specs:
                product.specs.length > 1
                  ? product.specs.filter((spec) => spec.id !== specId)
                  : product.specs,
            }
          : product
      )
    );
  };

  const handleSupplyAddProduct = () => {
    const nextId = Math.max(...supplyProducts.map((product) => product.id), 0) + 1;
    setSupplyProducts((prev) => [
      ...prev,
      {
        id: nextId,
        title: '',
        image: null,
        specs: [{ id: 1, name: '', value: '' }],
      },
    ]);
    setCurrentProductIndex(supplyProducts.length);
  };

  const handleSupplyRemoveProduct = () => {
    if (supplyProducts.length === 1) {
      alert('Phải giữ lại ít nhất 1 sản phẩm.');
      return;
    }

    setSupplyProducts((prev) => prev.filter((_, index) => index !== currentProductIndex));
    setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
  };

  const handleSupplyPrevProduct = () => {
    setCurrentProductIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSupplyNextProduct = () => {
    setCurrentProductIndex((prev) => (prev < supplyProducts.length - 1 ? prev + 1 : prev));
  };

  const isQuotePost = postType === 'quote';
  const isClearancePost = postType === 'trend';
  const isSupplyPost = postType === 'supply';
  const isTrustedPost = postType === 'trusted';

  const handlePostTypeChange = (nextType) => {
    setPostType(nextType);

    // Khi đổi loại bài, giữ các toggle chi tiết ở trạng thái tắt mặc định.
    setQuoteOptions({
      attachProduct: false,
      showPrice: false,
      showStock: false,
      showSupplier: false,
    });
    setShowTrustedSpecs(false);

    if (nextType !== 'trusted') {
      return;
    }

    // Nếu là 'trusted', vẫn áp preset cho form nhưng không tự động bật các toggle.
    setFormData((prev) => ({
      ...prev,
      ...TRUSTED_POST_PRESET,
    }));
    setImages([{ id: 1, url: sampleImage, file: null }]);
    setRetailPrice('1.250.000');
    setClearancePrice('850.000');
    setAttachedWholesalePrice('1.250.000');
    setAttachedRetailPrice('850.000');
    setProductWholesalePrice('15.500.000');
    setProductRetailPrice('Liên hệ');
    setSupplyProducts([
      {
        id: 1,
        title: 'Thép cuộn CB300-V Hòa Phát',
        image: quoteProduct.image,
        specs: [
          { id: 1, name: 'Độ phủ lý thuyết', value: '' },
          { id: 2, name: 'Thời gian khô', value: '' },
          { id: 3, name: 'Quy cách đóng gói', value: '' },
        ],
      },
    ]);
    setCurrentProductIndex(0);
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.category.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề, danh mục và nội dung bài viết.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        isQuotePost
          ? 'Đăng bài hỏi giá thành công (demo).'
          : isClearancePost
            ? 'Đăng bài thanh lý kho thành công (demo).'
            : isSupplyPost
              ? 'Đăng nguồn hàng thành công (demo).'
              : isTrustedPost
                ? 'Đăng bài mua chung thành công (demo).'
                : 'Đăng bài thành công (demo).'
      );
      onClose();
    }, 1000);
  };

  const activeProduct = supplyProducts[currentProductIndex];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="7xl">
      <div className="max-h-[85vh] overflow-y-auto px-1 pb-2 pt-1 md:px-2">
        <div className="space-y-6 px-2 md:px-4">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight text-on-surface md:text-4xl">
              {modalTitle}
            </h1>
            <p className="text-sm text-on-surface-variant md:text-base">
              Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <section className="space-y-6 xl:col-span-8">
              <div className="rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  1. Chọn loại bài đăng
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {POST_TYPES.map((item) => {
                    const active = postType === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handlePostTypeChange(item.key)}
                        className={`group flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          active
                            ? 'border-2 border-primary-container bg-surface-container-low text-primary'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary'
                        }`}
                      >
                        <MaterialIcon name={item.icon} className="mb-2 text-[24px]" fill={active} />
                        <span className="text-xs font-medium md:text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                  2. Nội dung chi tiết
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Tiêu đề bài đăng</label>
                  <input
                    className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                    placeholder="Ví dụ: Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM"
                    type="text"
                    value={formData.title}
                    onChange={(event) => handleFormField('title', event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Danh mục</label>
                    <select
                      className="w-full appearance-none rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                      value={formData.category}
                      onChange={(event) => handleFormField('category', event.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Khu vực</label>
                    <input
                      className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                      placeholder="Toàn quốc, Hà Nội, TP.HCM..."
                      type="text"
                      value={formData.area}
                      onChange={(event) => handleFormField('area', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Nội dung bài viết</label>
                  <div className="overflow-hidden rounded-xl border border-outline-variant">
                    <div className="flex gap-2 border-b border-outline-variant bg-slate-100 p-2">
                      <button
                        type="button"
                        className="rounded p-1 text-on-surface-variant hover:bg-white"
                      >
                        <MaterialIcon name="format_bold" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-on-surface-variant hover:bg-white"
                      >
                        <MaterialIcon name="format_italic" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-on-surface-variant hover:bg-white"
                      >
                        <MaterialIcon name="format_list_bulleted" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-on-surface-variant hover:bg-white"
                      >
                        <MaterialIcon name="link" className="text-[18px]" />
                      </button>
                    </div>
                    <textarea
                      className="w-full resize-none bg-surface-bright p-4 text-sm outline-none"
                      placeholder="Mô tả chi tiết về nhu cầu mua chung, số lượng, khu vực giao hàng, yêu cầu chứng từ..."
                      rows="6"
                      value={formData.content}
                      onChange={(event) => handleFormField('content', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    Gắn thẻ bài viết (Tags)
                  </label>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant bg-surface-bright p-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-medium text-primary md:text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="leading-none text-primary/80 hover:text-primary"
                          aria-label={`Xóa thẻ ${tag}`}
                        >
                          <MaterialIcon name="close" className="text-[14px]" />
                        </button>
                      </span>
                    ))}
                    <input
                      className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm outline-none focus:ring-0"
                      placeholder="Thêm thẻ mới..."
                      type="text"
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Nhập thẻ và nhấn Enter để thêm (Tối đa 5 thẻ)
                  </p>
                </div>

                {!isSupplyPost && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Ảnh sản phẩm</label>
                    <div className="flex gap-4">
                      <label className="flex h-32 w-32 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright transition-all hover:border-primary hover:bg-primary-container/5">
                        <MaterialIcon
                          name="add_a_photo"
                          className="text-2xl text-on-surface-variant"
                        />
                        <span className="text-center text-xs font-medium text-on-surface-variant">
                          Tải ảnh
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>

                      {images.length > 0 && (
                        <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
                          {images.map((image, index) => (
                            <div
                              key={image.id}
                              className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200"
                            >
                              <img
                                src={image.url}
                                alt={`Ảnh ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                aria-label={`Xóa ảnh ${index + 1}`}
                              >
                                <MaterialIcon name="close" className="text-[16px]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {postType !== 'wholesale' && (
                <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="inventory_2" className="text-[20px] text-primary" fill />
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                        3. Gắn sản phẩm từ kho (tuỳ chọn)
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant">
                        Gắn sản phẩm vào bài viết
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          className="peer sr-only"
                          type="checkbox"
                          checked={quoteOptions.attachProduct}
                          onChange={(event) =>
                            setQuoteOptions((prev) => ({
                              ...prev,
                              attachProduct: event.target.checked,
                            }))
                          }
                        />
                        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  {quoteOptions.attachProduct && activeProduct && (
                    <div className="space-y-4">
                      <div className="relative">
                        <MaterialIcon
                          name="search"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
                        />
                        <input
                          className="w-full rounded-xl border border-outline-variant bg-surface-bright py-3 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                          placeholder="Tìm sản phẩm trong kho..."
                          type="text"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          SẢN PHẨM ĐÃ CHỌN
                        </p>
                        <div className="rounded-xl border border-outline-variant p-4">
                          <div className="mb-4 flex items-start gap-4">
                            <img
                              alt={quoteProduct.name}
                              className="h-20 w-20 rounded-lg border border-outline-variant object-cover"
                              src={activeProduct.image || quoteProduct.image}
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="mb-1 text-base font-semibold text-on-surface">
                                {activeProduct.title || quoteProduct.name}
                              </h4>
                              <p className="mb-2 text-xs text-on-surface-variant">
                                {quoteProduct.description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-400">
                                <span>SKU: {quoteProduct.sku}</span>
                                <span>NSX: {quoteProduct.supplier}</span>
                              </div>
                              {!isSupplyPost && !isQuotePost && !isClearancePost && (
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                      Giá sỉ (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                      placeholder="Nhập giá..."
                                      type="text"
                                      value={attachedWholesalePrice}
                                      onChange={(event) =>
                                        setAttachedWholesalePrice(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                      Giá lẻ (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                      placeholder="Liên hệ"
                                      type="text"
                                      value={attachedRetailPrice}
                                      onChange={(event) =>
                                        setAttachedRetailPrice(event.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                              {isClearancePost && (
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                      Giá bán lẻ (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                      placeholder="Nhập giá..."
                                      type="text"
                                      value={retailPrice}
                                      onChange={(event) => setRetailPrice(event.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                                      Giá thanh lý (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 outline-none transition-all focus:ring-2 focus:ring-red-300"
                                      placeholder="Liên hệ"
                                      type="text"
                                      value={clearancePrice}
                                      onChange={(event) => setClearancePrice(event.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <button type="button" className="flex flex-col items-center text-error">
                              <MaterialIcon name="delete" />
                              <span className="text-[10px] font-bold">Xóa khỏi bài</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                              <span className="text-sm text-on-surface-variant">Hiển thị giá</span>
                              <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={quoteOptions.showPrice}
                                  onChange={(event) =>
                                    setQuoteOptions((prev) => ({
                                      ...prev,
                                      showPrice: event.target.checked,
                                    }))
                                  }
                                />
                                <span className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                              </label>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                              <span className="text-sm text-on-surface-variant">
                                Hiển thị tồn kho
                              </span>
                              <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={quoteOptions.showStock}
                                  onChange={(event) =>
                                    setQuoteOptions((prev) => ({
                                      ...prev,
                                      showStock: event.target.checked,
                                    }))
                                  }
                                />
                                <span className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                              </label>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                              <span className="text-sm text-on-surface-variant">
                                Hiển thị nhà cung cấp
                              </span>
                              <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={quoteOptions.showSupplier}
                                  onChange={(event) =>
                                    setQuoteOptions((prev) => ({
                                      ...prev,
                                      showSupplier: event.target.checked,
                                    }))
                                  }
                                />
                                <span className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isQuotePost && !isClearancePost && (
                <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                      4. THÔNG TIN &amp; THÔNG SỐ KỸ THUẬT SẢN PHẨM
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant">Hiển thị thông tin</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          className="peer sr-only"
                          type="checkbox"
                          checked={showTrustedSpecs}
                          onChange={(event) => setShowTrustedSpecs(event.target.checked)}
                        />
                        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  {showTrustedSpecs && activeProduct && (
                    <>
                      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-2">
                        <div className="flex items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={handleSupplyRemoveProduct}
                            className="flex items-center gap-2 rounded-lg border border-error/20 bg-white px-4 py-1.5 text-sm font-medium text-error transition-all hover:bg-error/5"
                          >
                            <MaterialIcon name="remove" className="text-sm" />
                            Giảm sản phẩm
                          </button>
                          <div className="flex items-center gap-4 text-sm font-semibold text-on-surface">
                            <button
                              type="button"
                              onClick={handleSupplyPrevProduct}
                              className="material-symbols-outlined text-primary"
                            >
                              chevron_left
                            </button>
                            <span>
                              Sản phẩm {currentProductIndex + 1} / {supplyProducts.length}
                            </span>
                            <button
                              type="button"
                              onClick={handleSupplyNextProduct}
                              className="material-symbols-outlined text-primary"
                            >
                              chevron_right
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleSupplyAddProduct}
                            className="flex items-center gap-2 rounded-lg border border-primary px-4 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/5"
                          >
                            <MaterialIcon name="add" className="text-sm" />
                            Thêm sản phẩm
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ẢNH SP
                          </label>
                          {activeProduct.image ? (
                            <div className="group relative aspect-square overflow-hidden rounded-xl border border-outline-variant bg-gray-200">
                              <img
                                src={activeProduct.image}
                                alt="Sản phẩm"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSupplyProducts((prev) => {
                                    const updated = [...prev];
                                    updated[currentProductIndex] = {
                                      ...updated[currentProductIndex],
                                      image: null,
                                    };
                                    return updated;
                                  })
                                }
                                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                              >
                                <MaterialIcon name="close" className="text-[16px]" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright text-slate-400 transition-all hover:border-primary hover:text-primary">
                              <MaterialIcon name="add_a_photo" className="text-2xl" />
                              <span className="mt-1 text-[10px] font-medium">Tải ảnh</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (!file) return;

                                  const reader = new FileReader();
                                  reader.onload = (readerEvent) => {
                                    setSupplyProducts((prev) => {
                                      const updated = [...prev];
                                      updated[currentProductIndex] = {
                                        ...updated[currentProductIndex],
                                        image: readerEvent.target?.result,
                                      };
                                      return updated;
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-10">
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            TIÊU ĐỀ SẢN PHẨM
                          </label>
                          <input
                            className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                            placeholder="Nhập tên sản phẩm cụ thể..."
                            type="text"
                            value={activeProduct.title}
                            onChange={(event) =>
                              handleSupplyProductChange('title', event.target.value)
                            }
                          />
                          <p className="text-[11px] text-on-surface-variant">
                            Tên sản phẩm cụ thể giúp khách hàng dễ dàng tra cứu kỹ thuật.
                          </p>
                        </div>
                      </div>

                      {!isSupplyPost && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-on-surface">
                              Giá sỉ (VNĐ)
                            </label>
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                              type="text"
                              value={productWholesalePrice}
                              onChange={(event) => setProductWholesalePrice(event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-on-surface">
                              Giá lẻ (VNĐ)
                            </label>
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                              type="text"
                              value={productRetailPrice}
                              onChange={(event) => setProductRetailPrice(event.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 px-2">
                          <div className="col-span-5">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                              Tên thông số
                            </label>
                          </div>
                          <div className="col-span-6">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                              Giá trị / Nội dung
                            </label>
                          </div>
                          <div className="col-span-1" />
                        </div>

                        <div className="space-y-3">
                          {activeProduct.specs.map((spec) => (
                            <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                              <div className="col-span-5">
                                <input
                                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                  placeholder="Ví dụ: Độ phủ lý thuyết"
                                  type="text"
                                  value={spec.name}
                                  onChange={(event) =>
                                    handleSupplySpecChange(spec.id, 'name', event.target.value)
                                  }
                                />
                              </div>
                              <div className="col-span-6">
                                <input
                                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                  placeholder="Ví dụ: 10-12 m²/lít"
                                  type="text"
                                  value={spec.value}
                                  onChange={(event) =>
                                    handleSupplySpecChange(spec.id, 'value', event.target.value)
                                  }
                                />
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleSupplyRemoveSpec(spec.id)}
                                  className="text-slate-400 hover:text-error"
                                >
                                  <MaterialIcon name="delete" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleSupplyAddSpec}
                          className="mt-1 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <MaterialIcon name="add" className="text-[18px]" />
                          Thêm thông số khác
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Chế độ xem trước đang được phát triển.')}
                  className="flex items-center gap-2 rounded-full border-2 border-outline px-6 py-3 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container"
                >
                  <MaterialIcon name="visibility" className="text-[20px]" />
                  <span>Xem trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã lưu nháp (demo).')}
                  className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-fixed"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePublish}
                  className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Đang đăng...' : `Đăng bài ${publishLabel}`}
                </button>
              </div>
            </section>

            <aside className="space-y-6 xl:col-span-4">
              <div className="space-y-6 xl:sticky xl:top-4">
                <div className="flex flex-col items-center rounded-xl border border-outline-variant bg-white p-4 text-center md:p-6">
                  <h3 className="mb-4 w-full text-left text-sm font-semibold text-on-surface">
                    Phần trăm hoàn thành
                  </h3>
                  <div className="relative mb-4 flex items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 128 128">
                      <circle
                        className="text-surface-container"
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-primary"
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="364.42"
                        strokeDashoffset={progressOffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-on-surface">
                        {completionPercent}%
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                        Hoàn thiện
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant md:text-sm">
                    Hoàn thiện các thông tin còn thiếu để bài đăng uy tín hơn.
                  </p>
                </div>

                <div className="rounded-xl border border-[#b7cae9] bg-[#c9dbf4] p-4 md:p-6">
                  <div className="mb-4 flex items-center gap-2 text-[#005ea4]">
                    <MaterialIcon name="lightbulb" className="text-[18px]" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.12em]">MẸO ĐĂNG BÀI</h3>
                  </div>
                  <ul className="space-y-4 text-left">
                    <li className="flex gap-3">
                      <MaterialIcon
                        name="radio_button_unchecked"
                        className="text-[14px] text-[#005ea4]"
                      />
                      <p className="text-sm leading-5 text-[#123457]">
                        Tiêu đề chứa tên thương hiệu và địa phương giúp tăng 40% lượt xem.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <MaterialIcon
                        name="radio_button_unchecked"
                        className="text-[14px] text-[#005ea4]"
                      />
                      <p className="text-sm leading-5 text-[#123457]">
                        Sử dụng hình ảnh thực tế từ kho bãi để tạo niềm tin với khách hàng B2B.
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <MaterialIcon
                        name="radio_button_unchecked"
                        className="text-[14px] text-[#005ea4]"
                      />
                      <p className="text-sm leading-5 text-[#123457]">
                        Mô tả chi tiết năng lực cung ứng (sản lượng/tháng) để thu hút đối tác lớn.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
