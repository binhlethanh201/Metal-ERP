/**
 * ProductImageField - Upload / hiển thị ảnh cho sản phẩm trong phần thông số kỹ thuật.
 */
import React from 'react';
import { Camera, X } from 'lucide-react';

const ProductImageField = ({ image, defaultImage, onRemove, onUpload }) => {
  const hasCustomImage = image && image !== defaultImage;

  if (hasCustomImage) {
    return (
      <div className="group relative aspect-square h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <img src={image} alt="Product Preview" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white shadow-md transition-colors group-hover:bg-red-600"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label className="flex aspect-square h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-[#004785] hover:text-[#004785]">
      <Camera size={20} />
      <span className="mt-1 text-[9px] font-black uppercase tracking-wider">Tải ảnh</span>
      <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
    </label>
  );
};

export default ProductImageField;
