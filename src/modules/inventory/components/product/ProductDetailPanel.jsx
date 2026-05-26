/**
 * Panel chi tiết sản phẩm khi expand row trong bảng - Ảnh, thông tin, thao tác (sửa/xóa/sao chép/in tem).
 */
import Icon from '../../../../shared/components/Icon';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v);

const ProductDetailPanel = ({ row, onEdit, onDelete }) => (
  <div className="overflow-hidden border-l-4 border-blue-500 bg-[#f8fbff] p-6">
    <div className="mb-8 flex gap-8">
      <div className="h-32 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img
          src={
            row.image ||
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop'
          }
          alt={row.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="mb-1 text-xl font-bold text-slate-900">{row.name}</h3>
        <p className="mb-3 text-xs text-slate-500">
          Nhóm hàng: <span className="font-bold uppercase text-slate-700">{row.group}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            Hàng hóa thường
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            Bán trực tiếp
          </span>
          <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-600">
            Không tích điểm
          </span>
        </div>
      </div>
    </div>

    <div className="mb-8 grid grid-cols-1 gap-x-12 gap-y-6 xl:grid-cols-4">
      {[
        ['Mã hàng', row.productCode || row.id],
        ['Giá vốn', formatMoney(row.costPrice)],
        ['Trọng lượng', row.weight || 'Chưa có'],
        ['Mã vạch', row.barcode],
        ['Giá bán', formatMoney(row.salePrice)],
        ['Kích thước', row.dimension || 'Chưa có'],
        ['Tồn kho', row.stock],
        ['Thương hiệu', row.brand || 'Chưa có'],
        ['Định mức tồn', row.stockLevel],
        ['Vị trí', row.location || 'Chưa có'],
      ].map(([label, value], i) => (
        <div key={i} className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-800">{value}</p>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-6">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(row);
          }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600"
        >
          <Icon name="delete" className="text-[18px]" />
          Xóa
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600"
        >
          <Icon name="copy" className="text-[18px]" />
          Sao chép
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(row);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Icon name="edit" className="text-[18px]" />
          Chỉnh sửa
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="barcode_scanner" className="text-[18px]" />
          In tem mã
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
        >
          <Icon name="MoreHorizontal" className="text-[20px]" />
        </button>
      </div>
    </div>
  </div>
);

export default ProductDetailPanel;
