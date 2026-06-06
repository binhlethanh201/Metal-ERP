import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const ProductImageCarousel = ({ images = [], productName = '' }) => {
  const [current, setCurrent] = useState(0);

  if (!images.length) {
    return (
      <div className="mx-auto flex aspect-video max-w-2xl items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
        <Icon name="image" size={48} className="text-slate-300" />
      </div>
    );
  }

  const prev = () => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
  const next = () => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div className="space-y-3">
      <div className="mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <img
          src={images[current]}
          alt={`${productName} - ảnh ${current + 1}`}
          className="h-full w-full object-cover transition-all duration-300"
        />
      </div>

      {images.length > 1 && (
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-[#004785]"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <div className="flex items-center gap-1 border-x border-slate-100 px-3">
            <span className="text-xs font-bold text-[#004785]">{current + 1}</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">{images.length}</span>
          </div>
          <button
            type="button"
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-all hover:bg-slate-100 hover:text-[#004785]"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
