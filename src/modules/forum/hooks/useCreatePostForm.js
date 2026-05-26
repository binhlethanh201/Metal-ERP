/**
 * useCreatePostForm - Custom hook quản lý TOÀN BỘ state + handlers của form đăng bài.
 * 30+ state variables, 20+ handler functions.
 * Output: object chứa tất cả state + handlers để truyền xuống các section component.
 * Dùng trong CreatePost page.
 */
import { useMemo, useState } from 'react';
import {
  createPostInitialSpecs as INITIAL_SPECS,
  createPostTrustedPreset as TRUSTED_POST_PRESET,
  createPostSampleImage as sampleImage,
  createPostQuoteProduct as quoteProduct,
} from '../data/forumPageData';

export const useCreatePostForm = () => {
  const [postType, setPostType] = useState('trend');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Cần báo giá thép xây dựng Hòa Phát số lượng lớn tại TP.HCM',
    category: 'Vật liệu xây dựng',
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

  const isQuotePost = postType === 'quote';
  const isClearancePost = postType === 'trend';
  const isSupplyPost = postType === 'supply';
  const isTrustedPost = postType === 'trusted';

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

  const handleFormField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddTag = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const normalizedTag = newTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (!normalizedTag || formData.tags.includes(normalizedTag) || formData.tags.length >= 5)
      return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, normalizedTag] }));
    setNewTag('');
  };

  const handleRemoveTag = (tag) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const handleSpecChange = (id, field, value) =>
    setSpecRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const handleAddSpec = () =>
    setSpecRows((prev) => [...prev, { id: Date.now(), name: '', value: '' }]);
  const handleRemoveSpec = (id) =>
    setSpecRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  const handleRemoveImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handlePostTypeChange = (nextType) => {
    setPostType(nextType);
    if (nextType !== 'trusted') return;
    setFormData((prev) => ({ ...prev, ...TRUSTED_POST_PRESET }));
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

  const handleSupplyProductChange = (field, value) =>
    setSupplyProducts((prev) =>
      prev.map((p, idx) => (idx === currentProductIndex ? { ...p, [field]: value } : p))
    );
  const handleSupplySpecChange = (specId, field, value) =>
    setSupplyProducts((prev) =>
      prev.map((p, idx) =>
        idx === currentProductIndex
          ? { ...p, specs: p.specs.map((s) => (s.id === specId ? { ...s, [field]: value } : s)) }
          : p
      )
    );
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
  const handleSupplyRemoveSpec = (specId) =>
    setSupplyProducts((prev) =>
      prev.map((p, idx) =>
        idx === currentProductIndex
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
    setSupplyProducts((prev) => prev.filter((_, idx) => idx !== currentProductIndex));
    setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
  };
  const handleSupplyPrevProduct = () =>
    setCurrentProductIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleSupplyNextProduct = () =>
    setCurrentProductIndex((prev) => (prev < supplyProducts.length - 1 ? prev + 1 : prev));

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
    }, 1000);
  };

  return {
    postType,
    newTag,
    loading,
    formData,
    specRows,
    images,
    quoteOptions,
    retailPrice,
    clearancePrice,
    attachedWholesalePrice,
    attachedRetailPrice,
    productWholesalePrice,
    productRetailPrice,
    showTrustedSpecs,
    supplyProducts,
    currentProductIndex,
    isQuotePost,
    isClearancePost,
    isSupplyPost,
    isTrustedPost,
    completionPercent,
    progressOffset,
    setPostType,
    setNewTag,
    setFormData,
    setSpecRows,
    setImages,
    setQuoteOptions,
    setRetailPrice,
    setClearancePrice,
    setAttachedWholesalePrice,
    setAttachedRetailPrice,
    setProductWholesalePrice,
    setProductRetailPrice,
    setShowTrustedSpecs,
    setSupplyProducts,
    setCurrentProductIndex,
    handleFormField,
    handleAddTag,
    handleRemoveTag,
    handleSpecChange,
    handleAddSpec,
    handleRemoveSpec,
    handleRemoveImage,
    handlePostTypeChange,
    handleSupplyProductChange,
    handleSupplySpecChange,
    handleSupplyAddSpec,
    handleSupplyRemoveSpec,
    handleSupplyAddProduct,
    handleSupplyRemoveProduct,
    handleSupplyPrevProduct,
    handleSupplyNextProduct,
    handlePublish,
  };
};

export default useCreatePostForm;
