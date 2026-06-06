import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const PostDetailGallery = ({ images = [], type }) => {
  const [current, setCurrent] = useState(0);

  if (type === 'supply') {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <Icon name="search" className="text-orange-500" size={28} />
          </div>
          <p className="text-sm font-bold text-slate-500">Đang tìm nguồn hàng</p>
          <p className="mt-1 text-xs text-slate-400">Bài viết yêu cầu báo giá từ nhà cung cấp</p>
        </div>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-400">Chưa có hình ảnh sản phẩm</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl shadow-sm">
        <img
          src={images[0]}
          alt="Sản phẩm"
          className="h-[350px] w-full object-cover md:h-[400px]"
        />
      </div>
    );
  }

  const prev = () => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
  const next = () => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="grid h-[350px] grid-cols-4 gap-4 md:h-[400px]">
          <div className="col-span-3 overflow-hidden rounded-2xl shadow-sm">
            <img
              src={images[current]}
              alt={`Ảnh ${current + 1}`}
              className="h-full w-full object-cover transition-all duration-300"
            />
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            {images.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1/2 cursor-pointer overflow-hidden rounded-xl shadow-sm transition-all ${
                  current === idx ? 'ring-2 ring-[#004785]' : 'hover:opacity-80'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
            {images.length > 2 && (
              <div
                onClick={() => setCurrent(2)}
                className="group relative h-1/2 cursor-pointer overflow-hidden rounded-xl shadow-sm"
              >
                <img src={images[2]} alt="Thumb 3" className="h-full w-full object-cover" />
                {images.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="font-bold text-white">+{images.length - 3} ảnh</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute -left-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#004785] hover:text-[#004785] xl:flex"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            onClick={next}
            className="absolute -right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#004785] hover:text-[#004785] xl:flex"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${
                current === idx ? 'w-6 bg-[#004785]' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-bold text-slate-500">
            {current + 1}/{images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default PostDetailGallery;
