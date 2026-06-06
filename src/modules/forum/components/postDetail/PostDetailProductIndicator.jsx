import React from 'react';
import Icon from '../../../../shared/components/Icon';

const PostDetailProductIndicator = ({ products, productIdx, total, onPrev, onNext, onSelect }) => (
  <div className="flex items-center justify-center gap-4">
    <button
      type="button"
      onClick={onPrev}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#004785] hover:text-[#004785] xl:hidden"
    >
      <Icon name="chevron_left" size={18} />
    </button>

    <div className="flex items-center gap-2">
      {products.map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(idx)}
          className={`h-2 rounded-full transition-all ${productIdx === idx ? 'w-6 bg-[#004785]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
        />
      ))}
    </div>
    <span className="text-sm font-bold text-slate-600">
      {productIdx + 1}/{total}
    </span>

    <button
      type="button"
      onClick={onNext}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#004785] hover:text-[#004785] xl:hidden"
    >
      <Icon name="chevron_right" size={18} />
    </button>
  </div>
);

export default PostDetailProductIndicator;
