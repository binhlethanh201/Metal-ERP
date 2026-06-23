/**
 * Panel chi tiết sản phẩm - Gắn API lấy chi tiết sản phẩm & API Ngừng kinh doanh
 */
import { useState, useEffect } from 'react';
import Icon from '../../../../../shared/components/Icon';
import { getProduct } from '../../../services/inventoryService'; // Import API

const formatMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
};

const TABS = [
  { key: 'info', label: 'Thông tin' },
  { key: 'desc', label: 'Mô tả, ghi chú' },
  { key: 'stock-card', label: 'Thẻ kho' },
  { key: 'inventory', label: 'Tồn kho' },
];

/* ---------- Các Tab Component (Nhận data full) ---------- */
const SummaryBar = ({ row }) => {
  const items = [
    { label: 'Mã SP', value: row.productCode || row.id },
    { label: 'Tên SP', value: row.name || row.productName },
    { label: 'Giá bán', value: `${formatMoney(row.salePrice)} đ` },
    { label: 'Giá vốn', value: `${formatMoney(row.costPrice)} đ` },
    { label: 'Tồn kho', value: row.actualStock ?? row.stock },
    { label: 'Trạng thái', value: row.isActive ? 'Đang bán' : 'Ngừng bán' },
  ];
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-slate-200 pb-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-500">{it.label}:</span>
          <span className="font-bold text-slate-800">{it.value || '-'}</span>
        </div>
      ))}
    </div>
  );
};

const InfoTab = ({ row, loading }) => {
  if (loading)
    return <div className="p-8 text-center text-slate-400">Đang tải thông tin chi tiết...</div>;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img
            src={
              row.imageUrl ||
              row.image ||
              'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop'
            }
            alt={row.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-slate-900">{row.productName || row.name}</h3>
          <p className="mb-3 text-xs text-slate-500">
            Danh mục:{' '}
            <span className="font-bold uppercase text-slate-700">
              {row.categoryName || row.group || 'Chưa có'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {row.unit || 'Sản phẩm'}
            </span>
            <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
              {row.directSale !== false ? 'Bán trực tiếp' : 'Không bán trực tiếp'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Mã hàng', row.productCode || row.id],
          ['Mã vạch', row.barcode],
          ['Tồn thực tế', row.actualStock ?? row.stock],
          ['Tồn khả dụng', row.availableStock ?? row.stock],
          ['Giá vốn', `${formatMoney(row.costPrice)} đ`],
          ['Giá bán', `${formatMoney(row.salePrice)} đ`],
          ['Thương hiệu', row.brandName || row.brand || 'Chưa có'],
          ['Vị trí', row.shelfLocation || row.location || 'Chưa có'],
          ['Trọng lượng', row.weight ? `${row.weight} ${row.weightUnit}` : 'Chưa có'],
          ['Kích thước', row.specificationDetail || 'Chưa có'],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1 border-b border-slate-100 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
              {label}
            </p>
            <p
              className={`text-sm font-bold ${value === 'Chưa có' ? 'text-slate-400' : 'text-slate-800'}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DescTab = ({ row, loading, onEdit }) => {
  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải...</div>;
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Mô tả</h4>
        <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
          {row.specification || row.description || 'Chưa có mô tả kỹ thuật'}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onEdit?.(row, 'description')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="edit" size={16} />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

const PlaceholderTab = ({ title }) => (
  <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-400">
    {title} - Đang phát triển
  </div>
);

/* ---------- Popup Xác nhận Đổi Trạng Thái ---------- */
const StatusToggleModal = ({ open, onClose, onConfirm, isActive }) => {
  if (!open) return null;
  const isStopping = isActive !== false;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">
            {isStopping ? 'Ngừng kinh doanh' : 'Mở bán lại'}
          </h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-gray-100">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="p-6 text-sm text-slate-600">
          {isStopping
            ? 'Sản phẩm sẽ bị ẩn khỏi các kênh bán hàng. Thông tin tồn kho vẫn được giữ nguyên. Bạn có chắc chắn?'
            : 'Sản phẩm sẽ hiển thị lại và có thể giao dịch bình thường. Bạn có muốn tiếp tục?'}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white ${isStopping ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Bottom Toolbar ---------- */
const BottomToolbar = ({ row, fullData, onEdit, onDelete, onToggleStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4">
      <div className="flex gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(row.productId || row.id);
          }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600"
        >
          <Icon name="delete" size={18} /> Xóa
        </button>
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

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Icon name="more_horiz" size={20} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 z-30 mb-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStatusModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {row.isActive !== false ? 'Ngừng kinh doanh' : 'Mở bán lại'}
              </button>
            </div>
          )}
        </div>
      </div>

      <StatusToggleModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        isActive={row.isActive}
        onConfirm={() => onToggleStatus?.(row.id || row.productId, row.isActive)}
      />
    </div>
  );
};

/* ---------- Main Component ---------- */
const ProductDetailPanel = ({ row, onEdit, onDelete, onToggleStatus }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [fullData, setFullData] = useState(row);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy full chi tiết khi mở tab
  useEffect(() => {
    setFullData((prev) => ({
      ...prev,
      ...row,
      // Ép các trường của Bảng đè lên các trường của API Detail
      productName: row.name || prev.productName,
      productCode: row.productCode || row.id || prev.productCode,
      actualStock: row.stock ?? prev.actualStock,
      availableStock: row.availableStock ?? row.stock ?? prev.availableStock,
      isActive: row.isActive !== undefined ? row.isActive : prev.isActive,
      salePrice: row.salePrice ?? prev.salePrice,
      costPrice: row.costPrice ?? prev.costPrice,
    }));

    const fetchDetail = async () => {
      const currentId = row?.productId || row?.id;
      if (!currentId) return;

      // Chỉ xoay loading lần đầu, những lần update sau sẽ fetch ngầm không làm giật UI
      if (!fullData?.productName) setLoading(true);
      try {
        const res = await getProduct(currentId);
        if (res?.success && res?.data) {
          setFullData((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  useEffect(() => {
    setFullData((prev) => ({ ...prev, ...row }));
  }, [row]);

  return (
    <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-4 sm:p-6">
      <SummaryBar row={fullData} />

      <div className="mt-4 flex gap-0 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'info' && <InfoTab row={fullData} loading={loading} />}
        {activeTab === 'desc' && <DescTab row={fullData} loading={loading} onEdit={onEdit} />}
        {activeTab === 'stock-card' && <PlaceholderTab title="Thẻ kho" />}
        {activeTab === 'inventory' && <PlaceholderTab title="Tồn kho" />}
      </div>

      {activeTab === 'info' && (
        <BottomToolbar
          row={row}
          fullData={fullData}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      )}
    </div>
  );
};

export default ProductDetailPanel;
