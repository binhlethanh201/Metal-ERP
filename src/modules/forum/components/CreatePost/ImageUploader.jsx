/**
 * ImageUploader - Upload và hiển thị ảnh sản phẩm
 */
import React from 'react';
import { Camera, X } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

const ImageUploader = ({ images, onRemove, onFilesSelected }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">Ảnh sản phẩm</label>
    <div className="flex gap-4">
      {/* Ô nút bấm kích hoạt Tải ảnh */}
      <label className="flex h-28 w-28 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-all hover:border-[#004785] hover:bg-blue-50/30 hover:text-[#004785]">
        <Camera size={22} />
        <span className="text-center text-[10px] font-black uppercase tracking-wider">Tải ảnh</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => onFilesSelected?.(Array.from(e.target.files || []))}
        />
      </label>

      {/* Danh sách luồng ảnh preview đã chọn */}
      {images.length > 0 && (
        <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100"
            >
              <img
                src={image}
                alt={`Khách hàng tải lên ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
              {/* Nút xóa ảnh thiết kế dạng tag vuông bo mềm tinh tế */}
              <button
                type="button"
                onClick={() => onRemove?.(index)}
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
);

export default ImageUploader;
