import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getProduct } from '../../services/productService';
import { formatMoney, isProductActive } from '../../utils/productUtils';

const fmtMoney = (v) => formatMoney(v);

const SummaryBar = ({ row }) => {
  const items = [
    { label: 'Mã SP', value: row.productCode || row.id },
    { label: 'Tên SP', value: row.productName || row.name },
    { label: 'Giá bán', value: `${fmtMoney(row.salePrice)} đ` },
    { label: 'Giá vốn', value: `${fmtMoney(row.costPrice)} đ` },
    { label: 'Tồn kho', value: row.actualStock ?? row.stock ?? 0 },
    {
      label: 'Trạng thái',
      value: isProductActive(row) ? 'Đang bán' : 'Ngừng bán',
    },
  ];
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 pb-4 dark:border-[#333333]">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-500 dark:text-[#999999]">{it.label}:</span>
          <span className="font-bold text-slate-800 dark:text-[#e5e5e5]">{it.value || '-'}</span>
        </div>
      ))}
    </div>
  );
};

const InfoTabPanel = ({ row, loading }) => {
  if (loading)
    return <div className="p-8 text-center text-slate-400 dark:text-[#808080]">Đang tải thông tin chi tiết...</div>;
  return (
    <div>
      {row.minimumStock > 0 && (row.actualStock ?? row.stock ?? 0) <= row.minimumStock && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          Tồn kho thấp ({row.actualStock ?? row.stock ?? 0}), dưới ngưỡng tối thiểu (
          {row.minimumStock})
        </div>
      )}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
          <img
            src={
              row.imageUrl ||
              row.image ||
              'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop'
            }
            alt={row.productName || row.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-[#e5e5e5]">{row.productName || row.name}</h3>
          <p className="mb-3 text-xs text-slate-500 dark:text-[#999999]">
            Danh mục:{' '}
            <span className="font-bold uppercase text-slate-700 dark:text-[#b3b3b3]">
              {row.categoryName || row.group || 'Chưa có'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-[#272727] dark:text-[#b3b3b3]">
              {row.unit || 'Sản phẩm'}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-[#272727] dark:text-[#b3b3b3]">
              {row.directSale !== false ? 'Bán trực tiếp' : 'Không bán trực tiếp'}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {(() => {
          // Compute a sensible display value for "Kích thước"
          const spec = row.specification || '';
          const dimsFromFields = [row.width, row.length, row.height].filter(Boolean).join(' × ');
          const hasDimsFromFields = Boolean(dimsFromFields);
          const hasSizeRange = Boolean(row.sizeRange);
          const specLooksLikeDim = /[×x]|\b(mm|cm|m|in|inch)\b/i.test(spec);
          const dimValue = hasDimsFromFields
            ? dimsFromFields + (row.sizeUnit ? ` ${row.sizeUnit}` : '')
            : hasSizeRange
              ? row.sizeRange + (row.sizeUnit ? ` ${row.sizeUnit}` : '')
              : spec && specLooksLikeDim
                ? spec
                : null;

          const items = [
            ['Mã hàng', row.productCode || row.id],
            ['Mã vạch', row.barcode || 'Chưa có'],
            ['Tồn thực tế', row.actualStock ?? row.stock ?? 0],
            ['Tồn khả dụng', row.availableStock ?? row.stock ?? 0],
            ['Giá vốn', `${fmtMoney(row.costPrice)} đ`],
            ['Giá bán', `${fmtMoney(row.salePrice)} đ`],
            ['Thương hiệu', row.brandName || row.brand || 'Chưa có'],
            ['Vị trí', row.shelfLocation || row.location || 'Chưa có'],
            ['Trọng lượng', row.weight ? `${row.weight} ${row.weightUnit || 'g'}` : 'Chưa có'],
            ['Kích thước', dimValue || 'Chưa có'],
          ];

          return items.map(([label, value]) => (
            <div key={label} className="space-y-1 border-b border-slate-100 pb-3 dark:border-[#333333]">
              <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 dark:text-[#808080]">
                {label}
              </p>
              <p
                className={`text-sm font-bold ${value === 'Chưa có' ? 'text-slate-400 dark:text-[#808080]' : 'text-slate-800 dark:text-[#e5e5e5]'}`}
              >
                {value}
              </p>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

const DescTabPanel = ({ row, loading, onEdit }) => {
  if (loading) return <div className="p-8 text-center text-slate-400 dark:text-[#808080]">Đang tải...</div>;
  
  const hasAttributes = row.attributes && row.attributes.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-[#b3b3b3]">Mô tả</h4>
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400 dark:text-[#808080] min-h-[120px]">
            {row.specification || row.description || 'Chưa có mô tả kỹ thuật'}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-[#b3b3b3]">Thuộc tính</h4>
          <div className="flex flex-1 flex-col text-sm text-slate-600 dark:text-[#d4d4d4] min-h-[120px]">
            {hasAttributes ? (
              <div className="w-full space-y-3">
                {row.attributes.map((attr, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-[#333333]">
                    <span className="font-medium text-slate-500 dark:text-[#999999]">{attr.name || 'Thuộc tính'}:</span>
                    <span className="font-semibold text-slate-800 dark:text-[#e5e5e5]">{attr.value || '-'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-slate-400 dark:text-[#808080]">
                Chưa có thuộc tính
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onEdit?.(row, 'description')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
        >
          <Icon name="edit" size={16} /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

const BottomToolbar = ({ row, fullData, onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const stock = fullData?.actualStock ?? fullData?.stock ?? fullData?.inventory ?? 0;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (stock > 0) {
      setShowConfirm(true);
    } else {
      onDelete?.(row.id || row.productId);
    }
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
    onDelete?.(row.id || row.productId, true); // skip native confirm
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4 dark:border-[#333333]">
      <div className="flex gap-4 relative">
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600 dark:text-[#b3b3b3] dark:hover:text-red-400"
        >
          <Icon name="delete" size={18} /> Xóa
        </button>

        {showConfirm && (
          <div 
            className="absolute bottom-full left-0 mb-3 w-72 z-50 rounded-xl bg-red-600 p-4 shadow-xl border border-red-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <Icon name="warning" size={24} className="text-white shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-white leading-snug">
                Sản phẩm này vẫn còn tồn kho. Bạn có chắc chắn muốn xóa sản phẩm này không?
              </p>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button 
                onClick={handleCancelDelete} 
                className="rounded-lg bg-red-500/50 border border-red-400/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 shadow-sm transition"
              >
                Chắc chắn xóa
              </button>
            </div>
            {/* Arrow tail */}
            <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-red-700 bg-red-600"></div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(fullData);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Icon name="edit" size={18} /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export const ProductDetailPanel = ({ row, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [fullData, setFullData] = useState(row);
  const [loading, setLoading] = useState(false);
  const TABS = [
    { key: 'info', label: 'Thông tin' },
    { key: 'desc', label: 'Mô tả, ghi chú' },
  ];
  const productId = row?.id || row?.productId;

  useEffect(() => {
    setFullData((prev) => ({ ...prev, ...row }));
    const fetchDetail = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await getProduct(productId);
        if (res?.success && res?.data) {
          const apiData = res.data;
          // Map PascalCase từ backend C# sang lowercase frontend
          setFullData((prev) => ({
            ...prev,
            ...apiData,
            width: apiData.width ?? apiData.Width ?? prev.width,
            length: apiData.length ?? apiData.Length ?? prev.length,
            height: apiData.height ?? apiData.Height ?? prev.height,
            sizeUnit: apiData.sizeUnit || apiData.SizeUnit || prev.sizeUnit || 'mm',
            weight: apiData.weight ?? apiData.Weight ?? prev.weight,
            weightUnit: apiData.weightUnit || apiData.WeightUnit || prev.weightUnit || 'g',
            specification:
              apiData.specification || apiData.Specification || prev.specification || '',
            // Luon lay productStatus tu row (bang ngoai) - nguon su that duy nhat
            productStatus: row.productStatus,
            isActive: row.productStatus !== 'inactive',
          }));
        }
      } catch (err) {
        console.error('Loi tai chi tiet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId, row]);

  return (
    <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-4 sm:p-6 dark:bg-[#0f0f0f]">
      <SummaryBar row={fullData} />
      <div className="mt-4 flex gap-0 border-b border-slate-200 dark:border-[#333333]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-[#999999] dark:hover:text-[#b3b3b3]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === 'info' && <InfoTabPanel row={fullData} loading={loading} />}
        {activeTab === 'desc' && <DescTabPanel row={fullData} loading={loading} onEdit={onEdit} />}
      </div>
      {activeTab === 'info' && (
        <BottomToolbar
          row={row}
          fullData={fullData}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default ProductDetailPanel;
