/**
 * useCreatePostModal - Hook quản lý state + handlers cho CreatePostModal.
 */
import { useMemo, useState, useEffect } from 'react';

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

export const useCreatePostModal = ({ onClose }) => {
  const [postType, setPostType] = useState('trusted');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      specDetail: '',
      specs: [
        { id: 1, name: 'Độ phủ lý thuyết', value: '' },
        { id: 2, name: 'Thời gian khô', value: '' },
        { id: 3, name: 'Quy cách đóng gói', value: '' },
      ],
    },
  ]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [openSpecEditorIndex, setOpenSpecEditorIndex] = useState(null);
  const [expandedSpecDetail, setExpandedSpecDetail] = useState(false);

  useEffect(() => {
    setExpandedSpecDetail(false);
  }, [currentProductIndex]);

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
    return Math.round((checkpoints.filter(Boolean).length / checkpoints.length) * 100);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) =>
      [
        ...prev,
        ...files.map((f) => ({
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(f),
          file: f,
        })),
      ].slice(0, 6)
    );
  };
  const handleRemoveImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSupplyProductChange = (field, value) =>
    setSupplyProducts((prev) =>
      prev.map((p, i) => (i === currentProductIndex ? { ...p, [field]: value } : p))
    );
  const handleSupplySpecChange = (specId, field, value) =>
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: p.specs.map((s) => (s.id === specId ? { ...s, [field]: value } : s)) }
          : p
      )
    );
  const handleSupplyAddSpec = () =>
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: [...p.specs, { id: Date.now(), name: '', value: '' }] }
          : p
      )
    );
  const handleSupplyRemoveSpec = (specId) =>
    setSupplyProducts((prev) =>
      prev.map((p, i) =>
        i === currentProductIndex
          ? { ...p, specs: p.specs.length > 1 ? p.specs.filter((s) => s.id !== specId) : p.specs }
          : p
      )
    );
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
    reader.onload = (re) =>
      setSupplyProducts((prev) =>
        prev.map((p, i) => (i === currentProductIndex ? { ...p, image: re.target?.result } : p))
      );
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

  // Kết hợp sản phẩm đính kèm (quoteProduct) vào mảng supplyProducts cho mục xem trước
  const combinedSupplyProducts = quoteOptions.attachProduct
    ? supplyProducts.some((p) => p.title === quoteProduct.name)
      ? supplyProducts
      : [
          { id: 'attached-1', title: quoteProduct.name, image: quoteProduct.image, specs: [] },
          ...supplyProducts,
        ]
    : supplyProducts;

  const p = {
    postType,
    isQuotePost,
    isClearancePost,
    isSupplyPost,
    formData,
    images,
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
    // Sử dụng mảng đã kết hợp để PreviewTabsSection hiển thị đầy đủ các sản phẩm
    supplyProducts: combinedSupplyProducts,
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

  return {
    postType,
    loading,
    previewOpen,
    setPreviewOpen,
    formData,
    images,
    completionPercent,
    isQuotePost,
    isClearancePost,
    isSupplyPost,
    handleFormField,
    handleAddTag,
    handleRemoveTag,
    handleImageChange,
    handleRemoveImage,
    handlePostTypeChange,
    handlePublish,
    p,
    h,
  };
};

export { CATEGORY_OPTIONS, sampleImage, quoteProduct };
export default useCreatePostModal;
