/**
 * CreatePostModal - Modal đăng bài nhanh (phiên bản popup của CreatePost page).
 */
import { useMemo, useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import ProgressCircle from '../../../../shared/components/ProgressCircle';
import TagInput from './TagInput';
import PostingTips from './PostingTips';
import ModalAttachmentSection from './ModalAttachmentSection';
import ModalSpecsSection from './ModalSpecsSection';
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
  Eye,
} from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: TRUSTED_POST_PRESET.title,
    category: CATEGORY_OPTIONS[0],
    area: TRUSTED_POST_PRESET.area,
    content: TRUSTED_POST_PRESET.content,
    tags: TRUSTED_POST_PRESET.tags,
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
      specDetail: '',
    },
  ]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [openSpecEditorIndex, setOpenSpecEditorIndex] = useState(null);
  const [expandedSpecDetail, setExpandedSpecDetail] = useState(false);

  useEffect(() => {
    setExpandedSpecDetail(false);
  }, [currentProductIndex]);

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

  const isQuotePost = postType === 'quote';
  const isClearancePost = postType === 'trend';
  const isSupplyPost = postType === 'supply';

  const completionPercent = useMemo(() => {
    const checkpoints =
      postType === 'trusted'
        ? [
            formData.title.trim(),
            formData.category.trim(),
            formData.area.trim(),
            formData.content.trim(),
            formData.tags.length > 0,
            quoteOptions.attachProduct,
            showTrustedSpecs,
            supplyProducts[currentProductIndex]?.title.trim(),
          ]
        : [
            formData.title.trim(),
            formData.category.trim(),
            formData.area.trim(),
            formData.content.trim(),
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

  const handleFormField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleAddTag = (tag) => setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
  const handleRemoveTag = (tag) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

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
  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSupplyProductChange = (field, value) => {
    setSupplyProducts((prev) =>
      prev.map((p, i) => (i === currentProductIndex ? { ...p, [field]: value } : p))
    );
  };
  const handleSupplySpecChange = (specId, field, value) => {
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: p.specs.map((s) => (s.id === specId ? { ...s, [field]: value } : s)) }
          : p
      )
    );
  };
  const handleSupplyAddSpec = () => {
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: [...p.specs, { id: Date.now(), name: '', value: '' }] }
          : p
      )
    );
  };
  const handleSupplyRemoveSpec = (specId) => {
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: p.specs.length > 1 ? p.specs.filter((s) => s.id !== specId) : p.specs }
          : p
      )
    );
  };
  const handleSupplyAddProduct = () => {
    const nextId = Math.max(...supplyProducts.map((p) => p.id), 0) + 1;
    setSupplyProducts((prev) => [
      ...prev,
      { id: nextId, title: '', image: null, specs: [{ id: 1, name: '', value: '' }] },
    ]);
    setCurrentProductIndex(supplyProducts.length);
  };
  const handleSupplyRemoveProduct = () => {
    if (supplyProducts.length === 1) {
      alert('Phải giữ lại ít nhất 1 sản phẩm.');
      return;
    }
    setSupplyProducts((prev) => prev.filter((_, i) => i !== currentProductIndex));
    setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
  };
  const handleSpecImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      setSupplyProducts((prev) =>
        prev.map((p, i) => (i === currentProductIndex ? { ...p, image: re.target?.result } : p))
      );
    };
    reader.readAsDataURL(file);
  };

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
    setFormData((prev) => ({ ...prev, ...TRUSTED_POST_PRESET }));
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
      const messages = {
        quote: 'hỏi giá',
        trend: 'thanh lý kho',
        supply: 'nguồn hàng',
        trusted: 'mua chung',
      };
      alert(`Đăng bài ${messages[postType] || ''} thành công (demo).`);
      onClose();
    }, 1000);
  };

  const activeProduct = supplyProducts[currentProductIndex];

  // Props grouped for sub-components
  const p = {
    postType,
    isQuotePost,
    isClearancePost,
    isSupplyPost,
    quoteOptions,
    activeProduct,
    quoteProduct,
    attachedWholesalePrice,
    attachedRetailPrice,
    retailPrice,
    clearancePrice,
    productWholesalePrice,
    productRetailPrice,
    showTrustedSpecs,
    supplyProducts,
    currentProductIndex,
    openSpecEditorIndex,
    expandedSpecDetail,
  };
  const h = {
    setQuoteOptions,
    setAttachedWholesalePrice,
    setAttachedRetailPrice,
    setRetailPrice,
    setClearancePrice,
    setProductWholesalePrice,
    setProductRetailPrice,
    setShowTrustedSpecs,
    setSupplyProducts,
    setCurrentProductIndex,
    setOpenSpecEditorIndex,
    setExpandedSpecDetail,
    handleSupplyProductChange,
    handleSupplySpecChange,
    handleSupplyAddSpec,
    handleSupplyRemoveSpec,
    handleSupplyAddProduct,
    handleSupplyRemoveProduct,
    handleSpecImageUpload,
  };

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
              {/* 1. Chọn loại bài đăng */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[#004785]">
                  1. Chọn loại bài đăng
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {POST_TYPES.map((item) => {
                    const active = postType === item.key;
                    const TypeIcon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handlePostTypeChange(item.key)}
                        className={`group flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 active:scale-95 ${active ? 'shadow-sm/5 border-2 border-blue-200 bg-blue-50/50 font-bold text-[#004785]' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-[#004785]'}`}
                      >
                        <TypeIcon className="mb-2" size={22} />
                        <span className="text-xs font-semibold md:text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Nội dung chi tiết */}
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
                    onChange={(e) => handleFormField('title', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Danh mục</label>
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#004785] focus:bg-white"
                      value={formData.category}
                      onChange={(e) => handleFormField('category', e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Khu vực</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white focus:ring-0"
                      placeholder="Toàn quốc, Hà Nội, TP.HCM..."
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleFormField('area', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nội dung bài viết</label>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex gap-1 border-b border-slate-200 bg-slate-50 p-2">
                      {[Bold, Italic, List, Link2].map((IconEl, i) => (
                        <button
                          key={i}
                          type="button"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                        >
                          <IconEl size={16} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full resize-none bg-white p-4 text-sm font-medium text-slate-600 outline-none placeholder:text-slate-400"
                      placeholder="Mô tả chi tiết về nhu cầu mua chung, số lượng, khu vực giao hàng, yêu cầu chứng từ..."
                      rows="5"
                      value={formData.content}
                      onChange={(e) => handleFormField('content', e.target.value)}
                    />
                  </div>
                </div>

                <TagInput tags={formData.tags} onAdd={handleAddTag} onRemove={handleRemoveTag} />

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

              {/* 3. Gắn sản phẩm từ kho */}
              {postType !== 'wholesale' && <ModalAttachmentSection p={p} h={h} />}

              {/* 4. Thông số kỹ thuật */}
              {!isQuotePost && !isClearancePost && <ModalSpecsSection p={p} h={h} />}

              {/* Action buttons */}
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

            {/* Aside: tiến độ + mẹo */}
            <aside className="space-y-4 xl:col-span-4">
              <div className="space-y-4 xl:sticky xl:top-2">
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <h3 className="mb-4 w-full text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Tiến độ bài đăng
                  </h3>
                  <ProgressCircle percent={completionPercent} />
                  <p className="text-xs font-medium leading-relaxed text-slate-400">
                    Điền thêm các điều kiện sỉ và thông số để tăng 65% độ uy tín B2B.
                  </p>
                </div>
                <PostingTips />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
