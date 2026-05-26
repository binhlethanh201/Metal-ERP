/**
 * src/modules/forum/components/shared/CreatePostModal.jsx
 * CreatePostModal - Modal đăng bài nhanh (phiên bản popup của CreatePost page).
 * Đã thay thế trực tiếp sang Icon Lucide chuẩn và quy chuẩn bo góc rounded-xl hệ thống.
 */
import { useMemo, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import {
  Store,
  SearchCode,
  FileText,
  TrendingUp,
  CheckCircle,
  Bold,
  Italic,
  List,
  Link2,
  X,
  Camera,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  Lightbulb,
} from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

// Cấu hình mảng loại bài đăng với Icon Lucide tương ứng
const POST_TYPES = [
  { key: 'wholesale', icon: Store, label: 'Đăng bán sỉ' },
  { key: 'supply', icon: SearchCode, label: 'Tìm nguồn hàng' },
  { key: 'quote', icon: FileText, label: 'Hỏi giá' },
  { key: 'trend', icon: TrendingUp, label: 'Thanh lý kho' },
  { key: 'trusted', icon: CheckCircle, label: 'Mua chung' },
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

  const [images, setImages] = useState([{ id: 1, url: sampleImage, file: null }]);
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
  const [showTrustedSpecs, setShowTrustedSpecs] = useState(false);

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
    setQuoteOptions({
      attachProduct: false,
      showPrice: false,
      showStock: false,
      showSupplier: false,
    });
    setShowTrustedSpecs(false);

    if (nextType !== 'trusted') return;

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
      <div className="no-scrollbar max-h-[85vh] overflow-y-auto px-1 pb-2 pt-1 md:px-2">
        <div className="space-y-6 px-2 md:px-4">
          <header className="space-y-1">
            <h2 className="text-xl font-bold leading-tight text-slate-900 md:text-2xl">
              {modalTitle}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <section className="space-y-5 xl:col-span-8">
              {/* KHỐI 1: CHỌN LOẠI BÀI ĐĂNG */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[#004785]">
                  1. Chọn loại bài đăng
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {POST_TYPES.map((item) => {
                    const active = postType === item.key;
                    const TypeIcon = item.icon; // Định dạng component động từ Lucide

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handlePostTypeChange(item.key)}
                        className={`group flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                          active
                            ? 'shadow-sm/5 border-2 border-blue-200 bg-blue-50/50 font-bold text-[#004785]'
                            : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-[#004785]'
                        }`}
                      >
                        <TypeIcon className="mb-2" size={22} />
                        <span className="text-xs font-semibold md:text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KHỐI 2: NỘI DUNG CHI TIẾT */}
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
                  2. Nội dung chi tiết
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Tiêu đề bài đăng</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
                    placeholder="Ví dụ: Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM"
                    type="text"
                    value={formData.title}
                    onChange={(event) => handleFormField('title', event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Danh mục</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
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
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Khu vực</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
                      placeholder="Toàn quốc, Hà Nội, TP.HCM..."
                      type="text"
                      value={formData.area}
                      onChange={(event) => handleFormField('area', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nội dung bài viết</label>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex gap-1 border-b border-slate-200 bg-slate-50 p-2">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                      >
                        <List size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                      >
                        <Link2 size={16} />
                      </button>
                    </div>
                    <textarea
                      className="w-full resize-none bg-white p-4 text-sm font-medium text-slate-600 outline-none placeholder:text-slate-400"
                      placeholder="Mô tả chi tiết về nhu cầu mua chung, số lượng, khu vực giao hàng, yêu cầu chứng từ..."
                      rows="5"
                      value={formData.content}
                      onChange={(event) => handleFormField('content', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    Gắn thẻ bài viết (Tags)
                  </label>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-400 transition-colors hover:text-blue-800"
                          aria-label={`Xóa thẻ ${tag}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm font-semibold outline-none focus:ring-0"
                      placeholder="Thêm thẻ mới..."
                      type="text"
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Nhập thẻ và nhấn Enter để thêm (Tối đa 5 thẻ)
                  </p>
                </div>

                {!isSupplyPost && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Ảnh sản phẩm</label>
                    <div className="flex gap-4">
                      <label className="flex h-28 w-28 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-all hover:border-[#004785] hover:bg-blue-50/30 hover:text-[#004785]">
                        <Camera size={22} />
                        <span className="text-center text-[10px] font-black uppercase tracking-wider">
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
                        <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-1">
                          {images.map((image, index) => (
                            <div
                              key={image.id}
                              className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100"
                            >
                              <img
                                src={image.url}
                                alt={`Ảnh ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md backdrop-blur-sm transition-all group-hover:bg-red-600"
                                aria-label={`Xóa ảnh ${index + 1}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 3: GẮN SẢN PHẨM TỪ KHO */}
              {postType !== 'wholesale' && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
                        3. Gắn sản phẩm từ kho (tuỳ chọn)
                      </h3>
                    </div>
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
                      <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {quoteOptions.attachProduct && activeProduct && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                          placeholder="Tìm sản phẩm trong kho..."
                          type="text"
                        />
                      </div>

                      <div className="shadow-sm/5 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-start gap-4">
                          <img
                            alt={quoteProduct.name}
                            className="h-20 w-20 shrink-0 rounded-xl border border-slate-100 object-cover"
                            src={activeProduct.image || quoteProduct.image}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-slate-800">
                              {activeProduct.title || quoteProduct.name}
                            </h4>
                            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-400">
                              {quoteProduct.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-4 text-[10px] font-black uppercase text-slate-400">
                              <span>SKU: {quoteProduct.sku}</span>
                              <span>NSX: {quoteProduct.supplier}</span>
                            </div>

                            {!isSupplyPost && !isQuotePost && !isClearancePost && (
                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Giá sỉ (VNĐ)
                                  </label>
                                  <input
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-[#004785]"
                                    type="text"
                                    value={attachedWholesalePrice}
                                    onChange={(e) => setAttachedWholesalePrice(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Giá lẻ (VNĐ)
                                  </label>
                                  <input
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-700"
                                    type="text"
                                    value={attachedRetailPrice}
                                    onChange={(e) => setAttachedRetailPrice(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}

                            {isClearancePost && (
                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Giá bán lẻ (VNĐ)
                                  </label>
                                  <input
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-bold text-slate-700"
                                    type="text"
                                    value={retailPrice}
                                    onChange={(e) => setRetailPrice(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-wider text-red-500">
                                    Giá thanh lý (VNĐ)
                                  </label>
                                  <input
                                    className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
                                    type="text"
                                    value={clearancePrice}
                                    onChange={(e) => setClearancePrice(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                            <span className="text-[9px] font-black uppercase tracking-wider">
                              Xóa
                            </span>
                          </button>
                        </div>

                        {/* Toggles điều kiện hiển thị sản phẩm */}
                        <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600 md:grid-cols-3">
                          {/* Item toggle hiển thị giá */}
                          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                            <span>Hiển thị giá</span>
                            <label className="relative inline-flex scale-75 cursor-pointer items-center">
                              <input
                                className="peer sr-only"
                                type="checkbox"
                                checked={quoteOptions.showPrice}
                                onChange={(e) =>
                                  setQuoteOptions((prev) => ({
                                    ...prev,
                                    showPrice: e.target.checked,
                                  }))
                                }
                              />
                              <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
                            </label>
                          </div>
                          {/* Item toggle hiển thị tồn kho */}
                          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                            <span>Hiển thị tồn kho</span>
                            <label className="relative inline-flex scale-75 cursor-pointer items-center">
                              <input
                                className="peer sr-only"
                                type="checkbox"
                                checked={quoteOptions.showStock}
                                onChange={(e) =>
                                  setQuoteOptions((prev) => ({
                                    ...prev,
                                    showStock: e.target.checked,
                                  }))
                                }
                              />
                              <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
                            </label>
                          </div>
                          {/* Item toggle hiển thị nhà cung cấp */}
                          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                            <span>Hiển thị nhà cung cấp</span>
                            <label className="relative inline-flex scale-75 cursor-pointer items-center">
                              <input
                                className="peer sr-only"
                                type="checkbox"
                                checked={quoteOptions.showSupplier}
                                onChange={(e) =>
                                  setQuoteOptions((prev) => ({
                                    ...prev,
                                    showSupplier: e.target.checked,
                                  }))
                                }
                              />
                              <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KHỐI 4: THÔNG SỐ KỸ THUẬT SẢN PHẨM */}
              {!isQuotePost && !isClearancePost && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
                      4. Thông số kỹ thuật sản phẩm
                    </h3>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        className="peer sr-only"
                        type="checkbox"
                        checked={showTrustedSpecs}
                        onChange={(event) => setShowTrustedSpecs(event.target.checked)}
                      />
                      <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white peer-checked:bg-[#004785] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {showTrustedSpecs && activeProduct && (
                    <>
                      {/* Bộ điều khiển lật chuyển nhiều sản phẩm sỉ */}
                      <div className="shadow-sm/5 rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <div className="flex items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={handleSupplyRemoveProduct}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50"
                          >
                            <Minus size={14} />
                            <span>Giảm hàng</span>
                          </button>

                          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                            <button
                              type="button"
                              onClick={handleSupplyPrevProduct}
                              className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] hover:bg-white"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span>
                              Sản phẩm {currentProductIndex + 1} / {supplyProducts.length}
                            </span>
                            <button
                              type="button"
                              onClick={handleSupplyNextProduct}
                              className="shadow-sm/5 rounded border border-slate-200 p-0.5 text-[#004785] hover:bg-white"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleSupplyAddProduct}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50"
                          >
                            <Plus size={14} />
                            <span>Thêm hàng</span>
                          </button>
                        </div>
                      </div>

                      {/* Thông tin nhập chi tiết sản phẩm thuộc khối */}
                      <div className="grid grid-cols-1 items-start gap-4 pt-1 md:grid-cols-12">
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Ảnh SP
                          </label>
                          {activeProduct.image ? (
                            <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md group-hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]">
                              <Camera size={20} />
                              <span className="mt-1 text-[9px] font-black uppercase tracking-wider">
                                Tải ảnh
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    setSupplyProducts((p) => {
                                      const up = [...p];
                                      up[currentProductIndex] = {
                                        ...up[currentProductIndex],
                                        image: re.target?.result,
                                      };
                                      return up;
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          )}
                        </div>

                        <div className="space-y-1.5 md:col-span-10">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Tiêu đề sản phẩm cụ thể
                          </label>
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
                            placeholder="Nhập tên sản phẩm cụ thể để khách tra cứu kỹ thuật..."
                            type="text"
                            value={activeProduct.title}
                            onChange={(e) => handleSupplyProductChange('title', e.target.value)}
                          />
                        </div>
                      </div>

                      {!isSupplyPost && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Giá sỉ (VNĐ)</label>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-[#004785]"
                              type="text"
                              value={productWholesalePrice}
                              onChange={(e) => setProductWholesalePrice(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Giá lẻ (VNĐ)</label>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-700"
                              type="text"
                              value={productRetailPrice}
                              onChange={(e) => setProductRetailPrice(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Khối danh sách dòng thuộc tính kỹ thuật linh hoạt */}
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <div className="col-span-5">
                            <span>Tên thông số kỹ thuật</span>
                          </div>
                          <div className="col-span-6">
                            <span>Giá trị / Nội dung chi tiết</span>
                          </div>
                          <div className="col-span-1" />
                        </div>

                        <div className="space-y-2">
                          {activeProduct.specs.map((spec) => (
                            <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                              <div className="col-span-5">
                                <input
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                                  placeholder="Ví dụ: Độ rộng chân bu-lông"
                                  type="text"
                                  value={spec.name}
                                  onChange={(e) =>
                                    handleSupplySpecChange(spec.id, 'name', e.target.value)
                                  }
                                />
                              </div>
                              <div className="col-span-6">
                                <input
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                                  placeholder="Ví dụ: M24 nhúng kẽm nóng"
                                  type="text"
                                  value={spec.value}
                                  onChange={(e) =>
                                    handleSupplySpecChange(spec.id, 'value', e.target.value)
                                  }
                                />
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleSupplyRemoveSpec(spec.id)}
                                  className="rounded-lg p-1 text-slate-400 transition-colors hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleSupplyAddSpec}
                          className="mt-1 flex items-center gap-1.5 p-1 text-xs font-bold text-[#004785] hover:underline"
                        >
                          <Plus size={14} />
                          <span>Thêm thông số kỹ thuật khác</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* HỆ THỐNG ACTION BUTTON CHÂN TRANG ĐÃ QUY CHUẨN SANG ROUNDED-XL */}
              <div className="border-slate-150 flex flex-wrap items-center justify-end gap-3 border-t pt-3">
                <button
                  type="button"
                  onClick={() => alert('Chế độ xem trước đang được phát triển.')}
                  className="group flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <Eye size={16} />
                  <span>Xem trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã lưu nháp (demo).')}
                  className="rounded-xl border-2 border-[#004785] px-5 py-2.5 text-xs font-bold text-[#004785] transition-all hover:bg-blue-50/5 active:scale-95"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePublish}
                  className="rounded-xl bg-[#004785] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/10 transition-all hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Đang đăng tải...' : `Đăng bài ${publishLabel}`}
                </button>
              </div>
            </section>

            {/* ASIDE CỘT PHẢI: TIẾN TRÌNH HOÀN THIỆN VÀ MẸO AI */}
            <aside className="space-y-4 xl:col-span-4">
              <div className="space-y-4 xl:sticky xl:top-2">
                {/* Vòng tròn tiến trình hoàn thiện */}
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <h3 className="mb-4 w-full text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Tiến độ bài đăng
                  </h3>
                  <div className="relative mb-3 flex items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 128 128">
                      <circle
                        className="text-slate-100"
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="6"
                      />
                      <circle
                        className="text-[#004785]"
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="364.42"
                        strokeDashoffset={progressOffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-800">
                        {completionPercent}%
                      </span>
                      <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Hoàn thiện
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-slate-400">
                    Điền thêm các điều kiện sỉ và thông số để tăng 65% độ uy tín B2B.
                  </p>
                </div>

                {/* Hộp cẩm nang mẹo đăng bài */}
                <div className="shadow-sm/5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[#004785]">
                    <Lightbulb size={16} className="fill-[#004785]/10" />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      Mẹo đăng bài hiệu quả
                    </h3>
                  </div>
                  <ul className="space-y-3 text-left text-xs font-semibold leading-relaxed text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
                      <p>
                        Tiêu đề chứa tên thương hiệu thép/ốc vít cụ thể và khu vực giúp tăng 40%
                        lượt tìm kiếm đúng đối tượng.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
                      <p>
                        Sử dụng hình ảnh thực tế từ xưởng hoặc kho bãi bốc xếp để tạo niềm tin tuyệt
                        đối với bạn hàng đại lý.
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
                      <p>
                        Mô tả chi tiết năng lực cung ứng theo tháng hoặc MOQ tối thiểu để thu hút
                        các đầu buôn sỉ lớn nhảy vào thương thảo.
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
