import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForumHeader from '../components/ForumHeader';
import ForumLeftSidebar from '../components/ForumLeftSidebar';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

const POST_TYPES = [
  { key: 'wholesale', icon: 'storefront', label: 'Đăng bán sỉ' },
  { key: 'supply', icon: 'search_insights', label: 'Tìm nguồn hàng' },
  { key: 'quote', icon: 'request_quote', label: 'Hỏi giá' },
  { key: 'trend', icon: 'trending_up', label: 'Thanh lý kho' },
  { key: 'trusted', icon: 'verified', label: 'Mua chung' },
];

const CATEGORY_OPTIONS = ['Vật liệu xây dựng', 'Thiết bị điện', 'Kim khí', 'Máy móc công nghiệp'];

const INITIAL_SPECS = [
  { id: 1, name: 'Độ phủ lý thuyết', value: '' },
  { id: 2, name: 'Thời gian khô', value: '' },
  { id: 3, name: 'Quy cách đóng gói', value: '' },
];

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

export const CreatePost = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('trend');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Cần báo giá thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
    category: CATEGORY_OPTIONS[0],
    area: 'TP.HCM & Miền Tây',
    content:
      'Tôi đang cần báo giá thép cuộn, thép cây thương hiệu Hòa Phát cho công trình tại TP.HCM. Ưu tiên đơn vị có CO/CQ đầy đủ và giao hàng nhanh...',
    tags: ['kim_khi', 'son_chong_tham'],
  });
  const [specRows, setSpecRows] = useState(INITIAL_SPECS);
  const [images, setImages] = useState([sampleImage]);
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
  // Trạng thái cho form Tìm nguồn hàng (Supply)
  const [supplyProducts, setSupplyProducts] = useState([
    {
      id: 1,
      title: 'Máy khoan bê tông chuyên dụng',
      image: quoteProduct.image,
      specs: [
        { id: 1, name: 'Độ phủ lý thuyết', value: '' },
        { id: 2, name: 'Thời gian khô', value: '' },
      ],
    },
    {
      id: 2,
      title: 'Thép cuộn xây dựng',
      image: sampleImage,
      specs: [{ id: 1, name: 'Tỷ lệ dãn suất', value: '' }],
    },
    {
      id: 3,
      title: 'Xi măng Portland',
      image: sampleImage,
      specs: [{ id: 1, name: 'Độ mềm', value: '' }],
    },
  ]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const completionPercent = useMemo(() => {
    const checkpoints =
      postType === 'quote' || postType === 'trend'
        ? [
            Boolean(formData.title.trim()),
            Boolean(formData.category.trim()),
            Boolean(formData.area.trim()),
            Boolean(formData.content.trim()),
            formData.tags.length > 0,
            quoteOptions.attachProduct,
          ]
        : [
            Boolean(formData.title.trim()),
            Boolean(formData.category.trim()),
            Boolean(formData.area.trim()),
            Boolean(formData.content.trim()),
            formData.tags.length > 0,
            specRows.some((row) => row.name.trim() && row.value.trim()),
          ];

    const done = checkpoints.filter(Boolean).length;
    return Math.round((done / checkpoints.length) * 100);
  }, [formData, postType, quoteOptions.attachProduct, specRows]);

  const progressOffset = useMemo(() => {
    const circumference = 364.42;
    return circumference - (completionPercent / 100) * circumference;
  }, [completionPercent]);

  const handleFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

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

  const handleSpecChange = (id, field, value) => {
    setSpecRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleAddSpec = () => {
    const nextId = Date.now();
    setSpecRows((prev) => [...prev, { id: nextId, name: '', value: '' }]);
  };

  const handleRemoveSpec = (id) => {
    setSpecRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const isQuotePost = postType === 'quote';
  const isClearancePost = postType === 'trend';
  const isSupplyPost = postType === 'supply';
  const isTrustedPost = postType === 'trusted';

  const handlePostTypeChange = (nextType) => {
    setPostType(nextType);

    if (nextType !== 'trusted') {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ...TRUSTED_POST_PRESET,
    }));
    setImages([{ id: 1, url: sampleImage, file: null }]);
    setQuoteOptions({
      attachProduct: true,
      showPrice: false,
      showStock: false,
      showSupplier: false,
    });
    setAttachedWholesalePrice('1.250.000');
    setAttachedRetailPrice('850.000');
    setProductWholesalePrice('15.500.000');
    setProductRetailPrice('Liên hệ');
    setShowTrustedSpecs(true);
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
    setSpecRows(INITIAL_SPECS);
  };

  // Xử lý sự kiện form Tìm nguồn hàng
  const handleSupplyProductChange = (field, value) => {
    setSupplyProducts((prev) =>
      prev.map((p, idx) => (idx === currentProductIndex ? { ...p, [field]: value } : p))
    );
  };

  const handleSupplySpecChange = (specId, field, value) => {
    setSupplyProducts((prev) =>
      prev.map((p, idx) =>
        idx === currentProductIndex
          ? {
              ...p,
              specs: p.specs.map((s) => (s.id === specId ? { ...s, [field]: value } : s)),
            }
          : p
      )
    );
  };

  const handleSupplyAddSpec = () => {
    const nextId = Date.now();
    setSupplyProducts((prev) =>
      prev.map((p, idx) =>
        idx === currentProductIndex
          ? { ...p, specs: [...p.specs, { id: nextId, name: '', value: '' }] }
          : p
      )
    );
  };

  const handleSupplyRemoveSpec = (specId) => {
    setSupplyProducts((prev) =>
      prev.map((p, idx) =>
        idx === currentProductIndex
          ? {
              ...p,
              specs: p.specs.length > 1 ? p.specs.filter((s) => s.id !== specId) : p.specs,
            }
          : p
      )
    );
  };

  const handleSupplyAddProduct = () => {
    const nextId = Math.max(...supplyProducts.map((p) => p.id), 0) + 1;
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
    setSupplyProducts((prev) => prev.filter((_, idx) => idx !== currentProductIndex));
    setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
  };

  const handleSupplyPrevProduct = () => {
    setCurrentProductIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSupplyNextProduct = () => {
    setCurrentProductIndex((prev) => (prev < supplyProducts.length - 1 ? prev + 1 : prev));
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.category.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề, tin tức ngành và nội dung bài viết.');
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
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased">
      <ForumHeader />

      <div className="relative mx-auto flex max-w-[1200px] gap-4">
        <ForumLeftSidebar activeKey="" />

        <main className="min-w-0 flex-1 bg-surface py-4 pb-24 lg:pb-10">
          <div className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-8 md:px-8">
            <header className="mb-6">
              <h1 className="mb-2 text-3xl font-bold leading-tight text-on-surface md:text-4xl">
                {isQuotePost
                  ? 'Đăng bài hỏi giá mới'
                  : isClearancePost
                    ? 'Đăng Thanh lý kho'
                    : isSupplyPost
                      ? 'Đăng nguồn hàng'
                      : isTrustedPost
                        ? 'Đăng Mua chung'
                        : 'Đăng bài nguồn hàng mới'}
              </h1>
              <p className="text-sm text-on-surface-variant md:text-base">
                {isQuotePost
                  ? 'Điền đầy đủ thông tin để đối tác báo giá nhanh và chính xác hơn.'
                  : isClearancePost
                    ? 'Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.'
                    : isSupplyPost
                      ? 'Điền đầy đủ thông tin để nhà cung cấp phù hợp liên hệ với bạn.'
                      : isTrustedPost
                        ? 'Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.'
                        : 'Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.'}
              </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
              <section className="space-y-6 xl:col-span-8">
                <div className="rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    1. Chọn loại bài đăng
                  </h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
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
                          <MaterialIcon
                            name={item.icon}
                            className="mb-2 text-[24px]"
                            fill={active}
                          />
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
                    <label className="text-sm font-medium text-on-surface">
                      {isQuotePost ? 'Tiêu đề yêu cầu báo giá' : 'Tiêu đề bài đăng'}
                    </label>
                    <input
                      className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                      placeholder={
                        isQuotePost
                          ? 'Ví dụ: Cần báo giá thép xây dựng Hòa Phát số lượng lớn tại TP.HCM'
                          : 'Ví dụ: Cung cấp thép xây dựng Hòa Phát số lượng lớn tại TP.HCM'
                      }
                      type="text"
                      value={formData.title}
                      onChange={(event) => handleFormField('title', event.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">
                        {isQuotePost ? 'Tin tức ngành' : 'Danh mục'}
                      </label>
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
                    <label className="text-sm font-medium text-on-surface">
                      {isQuotePost ? 'Nội dung yêu cầu báo giá' : 'Nội dung bài viết'}
                    </label>
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
                        placeholder={
                          isQuotePost
                            ? 'Mô tả nhu cầu, số lượng, khu vực giao hàng, yêu cầu chứng từ...'
                            : 'Mô tả chi tiết về nguồn hàng, năng lực cung ứng...'
                        }
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
                        {/* Upload Area */}
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
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach((file) => {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setImages((prev) => [...prev, event.target.result]);
                                };
                                reader.readAsDataURL(file);
                              });
                            }}
                          />
                        </label>

                        {/* Images Display */}
                        {images.length > 0 && (
                          <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
                            {images.map((image, index) => (
                              <div
                                key={index}
                                className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200"
                              >
                                <img
                                  src={image}
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

                {isQuotePost || isClearancePost ? (
                  <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <MaterialIcon
                          name="inventory_2"
                          className="text-[20px] text-primary"
                          fill
                        />
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

                    {quoteOptions.attachProduct && (
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
                                src={quoteProduct.image}
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="mb-1 text-base font-semibold text-on-surface">
                                  {quoteProduct.name}
                                </h4>
                                <p className="mb-2 text-xs text-on-surface-variant">
                                  {quoteProduct.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-400">
                                  <span>SKU: {quoteProduct.sku}</span>
                                  <span>NSX: {quoteProduct.supplier}</span>
                                </div>
                                {isTrustedPost && (
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
                                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        Giá bán sỉ (VNĐ)
                                      </label>
                                      <div className="relative max-w-[180px]">
                                        <input
                                          className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 pr-12 text-sm font-semibold text-on-surface"
                                          placeholder="Nhập giá..."
                                          type="text"
                                          value={retailPrice}
                                          onChange={(event) => setRetailPrice(event.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                                          VNĐ
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[11px] font-bold uppercase tracking-wider text-error">
                                        Giá bán thanh lý
                                      </label>
                                      <div className="relative max-w-[180px]">
                                        <input
                                          className="w-full rounded-lg border border-error/30 bg-error-container/10 px-3 py-2 pr-12 text-sm font-bold text-error outline-none transition-all focus:border-error focus:ring-2 focus:ring-error/20"
                                          placeholder="Nhập giá..."
                                          type="text"
                                          value={clearancePrice}
                                          onChange={(event) =>
                                            setClearancePrice(event.target.value)
                                          }
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-error/60">
                                          VNĐ
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="flex flex-col items-center text-error"
                              >
                                <MaterialIcon name="delete" />
                                <span className="text-[10px] font-bold">Xóa khỏi bài</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
                              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                                <span className="text-sm text-on-surface-variant">
                                  Hiển thị giá
                                </span>
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
                ) : isSupplyPost || isTrustedPost ? (
                  <>
                    {/* Phần 3: Gắn sản phẩm từ kho */}
                    <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <MaterialIcon
                            name="inventory_2"
                            className="text-[20px] text-primary"
                            fill
                          />
                          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                            3. Gắn sản phẩm từ kho (tùy chọn)
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
                              onChange={(e) =>
                                setQuoteOptions((prev) => ({
                                  ...prev,
                                  attachProduct: e.target.checked,
                                }))
                              }
                            />
                            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      </div>

                      {quoteOptions.attachProduct && (
                        <div className="space-y-4">
                          {/* Search box */}
                          <div className="relative">
                            <MaterialIcon
                              name="search"
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-bright py-3 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                              placeholder="Tìm sản phẩm trong kho..."
                              type="text"
                            />
                          </div>

                          {/* Sản phẩm đã chọn */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                              Sản phẩm đã chọn
                            </p>
                            <div className="rounded-xl border border-outline-variant p-4">
                              <div className="mb-4 flex items-start gap-4">
                                <img
                                  src={quoteProduct.image}
                                  alt={quoteProduct.name}
                                  className="h-20 w-20 flex-shrink-0 rounded-lg border border-outline-variant object-cover"
                                />
                                <div className="flex-1 space-y-1">
                                  <h4 className="text-base font-medium text-on-surface">
                                    {quoteProduct.name}
                                  </h4>
                                  <p className="text-xs text-on-surface-variant">
                                    {quoteProduct.description}
                                  </p>
                                  <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
                                    <span>SKU: {quoteProduct.sku}</span>
                                    <span>NSX: {quoteProduct.supplier}</span>
                                  </div>
                                  {isTrustedPost && (
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
                                </div>
                                <button
                                  type="button"
                                  className="flex flex-col items-center text-error"
                                  aria-label="Xóa sản phẩm"
                                >
                                  <MaterialIcon name="delete" className="text-[20px]" />
                                  <span className="text-[10px] font-bold">Xóa khỏi bài</span>
                                </button>
                              </div>

                              {/* Toggles section */}
                              <div className="space-y-2 border-t border-slate-100 pt-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                                    <span className="text-sm text-on-surface-variant">
                                      Hiển thị giá
                                    </span>
                                    <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                      <input
                                        type="checkbox"
                                        checked={quoteOptions.showPrice}
                                        onChange={(e) =>
                                          setQuoteOptions((prev) => ({
                                            ...prev,
                                            showPrice: e.target.checked,
                                          }))
                                        }
                                        className="peer sr-only"
                                      />
                                      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                                    </label>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                                    <span className="text-sm text-on-surface-variant">
                                      Hiển thị tồn kho
                                    </span>
                                    <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                      <input
                                        type="checkbox"
                                        checked={quoteOptions.showStock}
                                        onChange={(e) =>
                                          setQuoteOptions((prev) => ({
                                            ...prev,
                                            showStock: e.target.checked,
                                          }))
                                        }
                                        className="peer sr-only"
                                      />
                                      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                                    </label>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                                    <span className="text-sm text-on-surface-variant">
                                      Hiển thị nhà cung cấp
                                    </span>
                                    <label className="relative inline-flex scale-75 cursor-pointer items-center">
                                      <input
                                        type="checkbox"
                                        checked={quoteOptions.showSupplier}
                                        onChange={(e) =>
                                          setQuoteOptions((prev) => ({
                                            ...prev,
                                            showSupplier: e.target.checked,
                                          }))
                                        }
                                        className="peer sr-only"
                                      />
                                      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phần 4: Thông số kỹ thuật sản phẩm */}
                    <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name="settings" className="text-[20px] text-primary" fill />
                          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                            {isTrustedPost
                              ? '4. Thông tin & Thông số kỹ thuật sản phẩm'
                              : '4. Thông số kỹ thuật sản phẩm'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant">
                            Hiển thị thông tin
                          </span>
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

                      {showTrustedSpecs && (
                        <>
                          {/* Điều hướng sản phẩm */}
                          <div className="mb-6 flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={handleSupplyRemoveProduct}
                                className="flex items-center gap-1 rounded-lg border border-error/20 px-3 py-1.5 text-sm font-medium text-error transition-all hover:bg-error/10"
                              >
                                <MaterialIcon name="remove" className="text-[20px]" />
                                <span>Giảm sản phẩm</span>
                              </button>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={handleSupplyPrevProduct}
                                  className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                                >
                                  <MaterialIcon name="chevron_left" className="text-[20px]" />
                                </button>
                                <span className="min-w-[100px] text-center font-medium text-on-surface">
                                  Sản phẩm {currentProductIndex + 1} / {supplyProducts.length}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleSupplyNextProduct}
                                  className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                                >
                                  <MaterialIcon name="chevron_right" className="text-[20px]" />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleSupplyAddProduct}
                              className="flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary-container/10"
                            >
                              <MaterialIcon name="add" className="text-[20px]" />
                              <span>Thêm sản phẩm</span>
                            </button>
                          </div>

                          {/* Form sản phẩm hiện tại */}
                          {supplyProducts[currentProductIndex] && (
                            <div className="space-y-6">
                              {/* Hàng: Ảnh + Tiêu đề */}
                              <div className="flex flex-col gap-6 md:flex-row">
                                {/* Upload ảnh */}
                                <div className="w-full md:w-auto md:flex-shrink-0">
                                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                    Ảnh SP
                                  </label>
                                  {supplyProducts[currentProductIndex].image &&
                                  supplyProducts[currentProductIndex].image !==
                                    quoteProduct.image ? (
                                    <div className="group relative aspect-square h-32 w-32 overflow-hidden rounded-xl bg-gray-200">
                                      <img
                                        src={supplyProducts[currentProductIndex].image}
                                        alt="Product"
                                        className="h-full w-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSupplyProducts((prev) => {
                                            const updated = [...prev];
                                            updated[currentProductIndex].image = quoteProduct.image;
                                            return updated;
                                          });
                                        }}
                                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                      >
                                        <MaterialIcon name="close" className="text-[16px]" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex aspect-square h-32 w-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright text-on-surface-variant transition-all hover:border-primary hover:bg-primary-container/5">
                                      <MaterialIcon name="add_a_photo" className="text-2xl" />
                                      <span className="mt-1 text-[10px]">Tải ảnh</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              setSupplyProducts((prev) => {
                                                const updated = [...prev];
                                                updated[currentProductIndex].image =
                                                  event.target.result;
                                                return updated;
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>

                                {/* Tiêu đề sản phẩm */}
                                <div className="flex-1 space-y-2">
                                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                    Tiêu đề sản phẩm
                                  </label>
                                  <input
                                    className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                    placeholder="Ví dụ: Máy khoan bê tông chuyên dụng"
                                    type="text"
                                    value={supplyProducts[currentProductIndex].title}
                                    onChange={(e) =>
                                      handleSupplyProductChange('title', e.target.value)
                                    }
                                  />
                                  <p className="text-[11px] text-slate-400">
                                    Tên sản phẩm cụ thể giúp khách hàng dễ dàng tra cứu kỹ thuật.
                                  </p>
                                </div>
                              </div>

                              {isTrustedPost && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-on-surface">
                                      Giá sỉ (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                      placeholder="Thỏa thuận"
                                      type="text"
                                      value={productWholesalePrice}
                                      onChange={(event) =>
                                        setProductWholesalePrice(event.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-on-surface">
                                      Giá lẻ (VNĐ)
                                    </label>
                                    <input
                                      className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
                                      placeholder="Liên hệ"
                                      type="text"
                                      value={productRetailPrice}
                                      onChange={(event) =>
                                        setProductRetailPrice(event.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Bảng thông số kỹ thuật */}
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
                                  {supplyProducts[currentProductIndex].specs.map((spec) => (
                                    <div
                                      key={spec.id}
                                      className="grid grid-cols-12 items-center gap-4"
                                    >
                                      <div className="col-span-5">
                                        <input
                                          className="w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                          placeholder="Ví dụ: Độ phủ lý thuyết"
                                          type="text"
                                          value={spec.name}
                                          onChange={(e) =>
                                            handleSupplySpecChange(spec.id, 'name', e.target.value)
                                          }
                                        />
                                      </div>
                                      <div className="col-span-6">
                                        <input
                                          className="w-full rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                          placeholder="Ví dụ: 10-12 m²/lít"
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
                                          className="rounded p-1 text-slate-300 transition-colors hover:text-error"
                                        >
                                          <MaterialIcon name="delete" className="text-[18px]" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={handleSupplyAddSpec}
                                  className="flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/5"
                                >
                                  <MaterialIcon name="add_circle" className="text-[20px]" />
                                  <span>Thêm thông số khác</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                          3. Thông tin giao thương
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant">
                            Hiển thị thông tin
                          </span>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              className="peer sr-only"
                              type="checkbox"
                              checked={formData.showTradeInfo}
                              onChange={(event) =>
                                handleFormField('showTradeInfo', event.target.checked)
                              }
                            />
                            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      </div>

                      {formData.showTradeInfo && (
                        <>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-on-surface">
                                Tên sản phẩm đại diện
                              </label>
                              <input
                                className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                placeholder="Thép cuộn CB300-V"
                                type="text"
                                value={formData.productName}
                                onChange={(event) =>
                                  handleFormField('productName', event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-on-surface">Đơn vị</label>
                              <input
                                className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                placeholder="Tấn, Kg, Cái..."
                                type="text"
                                value={formData.unit}
                                onChange={(event) => handleFormField('unit', event.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-on-surface">
                                Giá sỉ (VNĐ)
                              </label>
                              <input
                                className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                placeholder="Thỏa thuận"
                                type="text"
                                value={formData.wholesalePrice}
                                onChange={(event) =>
                                  handleFormField('wholesalePrice', event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-on-surface">
                                Giá lẻ (VNĐ)
                              </label>
                              <input
                                className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                placeholder="Liên hệ"
                                type="text"
                                value={formData.retailPrice}
                                onChange={(event) =>
                                  handleFormField('retailPrice', event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-on-surface">
                                MOQ (Tối thiểu)
                              </label>
                              <input
                                className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                placeholder="100 đơn vị"
                                type="text"
                                value={formData.moq}
                                onChange={(event) => handleFormField('moq', event.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 py-1 md:flex-row md:items-center md:gap-6">
                            <span className="text-sm font-medium text-on-surface">
                              Trạng thái hàng:
                            </span>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="stock"
                                checked={formData.stockStatus === 'in-stock'}
                                onChange={() => handleFormField('stockStatus', 'in-stock')}
                                className="text-primary focus:ring-primary-container"
                              />
                              Sẵn kho
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="stock"
                                checked={formData.stockStatus === 'pre-order'}
                                onChange={() => handleFormField('stockStatus', 'pre-order')}
                                className="text-primary focus:ring-primary-container"
                              />
                              Hàng đặt trước (Pre-order)
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="stock"
                                checked={formData.stockStatus === 'hidden'}
                                onChange={() => handleFormField('stockStatus', 'hidden')}
                                className="text-primary focus:ring-primary-container"
                              />
                              Không hiển thị
                            </label>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-5 rounded-xl border border-outline-variant bg-white p-4 md:p-6">
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                          4. Thông số kỹ thuật
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant">
                            Hiển thị thông tin
                          </span>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              className="peer sr-only"
                              type="checkbox"
                              checked={formData.showSpecInfo}
                              onChange={(event) =>
                                handleFormField('showSpecInfo', event.target.checked)
                              }
                            />
                            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      </div>

                      {formData.showSpecInfo && (
                        <>
                          <div className="grid grid-cols-1 gap-2 px-1 text-sm font-medium text-on-surface md:grid-cols-2">
                            <label>Tên thông số</label>
                            <label>Giá trị / Nội dung</label>
                          </div>

                          <div className="space-y-3">
                            {specRows.map((row) => (
                              <div
                                key={row.id}
                                className="flex flex-col gap-3 md:flex-row md:items-center"
                              >
                                <div className="flex-1">
                                  <input
                                    className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                    placeholder="Ví dụ: Độ phủ lý thuyết"
                                    type="text"
                                    value={row.name}
                                    onChange={(event) =>
                                      handleSpecChange(row.id, 'name', event.target.value)
                                    }
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    className="w-full rounded-xl border border-outline-variant bg-surface-bright px-4 py-3 text-sm"
                                    placeholder="Ví dụ: 10-12 m²/lít"
                                    type="text"
                                    value={row.value}
                                    onChange={(event) =>
                                      handleSpecChange(row.id, 'value', event.target.value)
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpec(row.id)}
                                  className="px-1 text-on-surface-variant transition-colors hover:text-error"
                                >
                                  <MaterialIcon name="delete" className="text-[22px]" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddSpec}
                            className="mt-1 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                          >
                            <MaterialIcon name="add" className="text-[18px]" />
                            Thêm thông số khác
                          </button>
                        </>
                      )}
                    </div>
                  </>
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
                    {loading
                      ? 'Đang đăng...'
                      : isQuotePost
                        ? 'Đăng bài hỏi giá'
                        : isClearancePost
                          ? 'Đăng bài thanh lý kho'
                          : isSupplyPost
                            ? 'Đăng nguồn hàng'
                            : isTrustedPost
                              ? 'Đăng bài mua chung'
                              : 'Đăng bài'}
                  </button>
                </div>
              </section>

              <aside className="space-y-6 xl:col-span-4">
                <div className="space-y-6 xl:sticky xl:top-24">
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
                      <h3 className="text-xs font-bold uppercase tracking-[0.12em]">
                        Mẹo đăng bài
                      </h3>
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
                          Mô tả chi tiết năng lực cung ứng để thu hút đối tác mua số lượng lớn.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <MaterialIcon name="dashboard" className="text-[20px]" />
          <span className="text-[10px]">Tổng quan</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-primary">
          <MaterialIcon name="add_circle" className="text-[20px]" fill />
          <span className="text-[10px] font-bold">Đăng tin</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-slate-500">
          <MaterialIcon name="forum" className="text-[20px]" />
          <span className="text-[10px]">Tin nhắn</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-slate-500">
          <MaterialIcon name="person" className="text-[20px]" />
          <span className="text-[10px]">Cá nhân</span>
        </button>
      </footer>
    </div>
  );
};

export default CreatePost;
