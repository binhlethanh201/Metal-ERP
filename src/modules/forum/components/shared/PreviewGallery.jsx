/**
 * PreviewGallery - Gallery ảnh cho PostPreviewModal.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const PreviewGallery = ({ postType, images }) => {
  if (postType === 'supply' || postType === 'quote') {
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

  const urls = (images || []).map((img) => img?.url || img).filter(Boolean);
  if (!urls.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-400">Chưa có hình ảnh sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 overflow-hidden rounded-2xl shadow-sm">
        <img src={urls[0]} alt="Ảnh chính" className="h-[350px] w-full object-cover md:h-[400px]" />
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        {urls.slice(1, 3).map((url, i) => (
          <div key={i} className="h-1/2 overflow-hidden rounded-xl shadow-sm">
            <img src={url} alt={`Ảnh ${i + 2}`} className="h-full w-full object-cover" />
          </div>
        ))}
        {urls.length > 3 && (
          <div className="relative h-1/2 overflow-hidden rounded-xl shadow-sm">
            <img src={urls[3]} alt="Thêm" className="h-full w-full object-cover" />
            {urls.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="font-bold text-white">+{urls.length - 3} ảnh</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewGallery;
