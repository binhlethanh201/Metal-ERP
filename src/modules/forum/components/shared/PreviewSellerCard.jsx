/**
 * PreviewSellerCard - Card người bán cho PostPreviewModal.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';
import Avatar from '../shared/Avatar';

const PreviewSellerCard = () => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar name="Nguyễn Văn An" size="lg" />
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
          <Icon name="check" size={10} />
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Nguyễn Văn An</h2>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1E6BB8]">
            Đã xác minh
          </span>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#004785]">
            Nhà phân phối
          </span>
          <span className="text-slate-300">|</span>
          <Icon name="location_on" size={14} />
          <span>TP.HCM</span>
          <span className="text-slate-300">|</span>
          <span>Vừa xong</span>
        </p>
        <div className="mt-1 flex items-center gap-1">
          <Icon name="star" className="text-yellow-400" size={14} />
          <span className="text-sm font-bold">4.9</span>
          <span className="text-xs text-slate-400">(86 đánh giá)</span>
        </div>
      </div>
    </div>
    {/* contact buttons removed per design */}
  </div>
);

export default PreviewSellerCard;
