/**
 * SpecsForm - Form thông số kỹ thuật (dùng cho Default + Supply)
 */
import React from 'react';
import { Plus, X } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

const SpecsForm = ({ specRows, onAdd, onRemove, onChange }) => (
  <div className="space-y-3">
    {/* Vòng lặp kết xuất các hàng thuộc tính thông số kỹ thuật */}
    {specRows.map((row) => (
      <div key={row.id} className="animate-fadeIn flex items-center gap-3">
        {/* Ô nhập Tên thông số */}
        <input
          className="w-[45%] rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
          placeholder="Ví dụ: Độ chịu lực"
          value={row.name}
          onChange={(event) => onChange?.(row.id, 'name', event.target.value)}
        />

        {/* Ô nhập Giá trị tương ứng */}
        <input
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
          placeholder="Ví dụ: 10.9 HRC nhúng kẽm"
          value={row.value}
          onChange={(event) => onChange?.(row.id, 'value', event.target.value)}
        />

        {/* Nút xóa dòng thông số dạng hộp vuông bo mềm */}
        <button
          type="button"
          onClick={() => onRemove?.(row.id)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 active:scale-95"
          aria-label="Xóa thông số này"
        >
          <X size={16} />
        </button>
      </div>
    ))}

    {/* Nút bấm Thêm thông số mới dạng viền nét đứt (Dashed) */}
    <button
      type="button"
      onClick={onAdd}
      className="border-slate-250 shadow-sm/5 mt-1 flex items-center gap-1.5 rounded-xl border-2 border-dashed bg-white px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:border-[#004785] hover:text-[#004785] active:scale-95"
    >
      <Plus size={14} />
      <span>Thêm thông số kỹ thuật khác</span>
    </button>
  </div>
);

export default SpecsForm;
