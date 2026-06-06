/**
 * PreviewInfoBar - Thanh thông tin theo loại bài cho PostPreviewModal.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const InfoItem = ({ icon, iconTone, label, value, tone = 'text-slate-700' }) => (
  <div className="flex items-center gap-2">
    <Icon name={icon} size={16} className={iconTone || 'text-slate-400'} />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <span className={`text-sm font-bold ${tone}`}>{value}</span>
  </div>
);

const PreviewInfoBar = ({ p }) => {
  const { postType, formData, attachedWholesalePrice, retailPrice, clearancePrice } = p;

  if (postType === 'wholesale' || postType === 'trusted') {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
        <InfoItem
          icon="sell"
          label="Giá sỉ:"
          value={attachedWholesalePrice ? `${attachedWholesalePrice}đ` : 'Liên hệ'}
          tone="text-[#004785]"
        />
        <span className="h-5 w-px bg-emerald-200" />
        <span className="flex items-center gap-1.5 rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Còn hàng
        </span>
        <span className="h-5 w-px bg-emerald-200" />
        <InfoItem icon="location_on" label="KV:" value={formData.area || 'Toàn quốc'} />
      </div>
    );
  }

  if (postType === 'trend') {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name="sell" size={16} className="text-red-500" />
          <span className="text-xs font-semibold text-red-600">Thanh lý:</span>
          <span className="text-lg font-black text-red-600">{clearancePrice}đ</span>
        </div>
        <span className="h-5 w-px bg-red-200" />
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-slate-500">Giá gốc:</span>
          <span className="text-sm font-bold text-slate-400 line-through">{retailPrice}đ</span>
        </div>
        <span className="h-5 w-px bg-red-200" />
        <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
          -32%
        </span>
        <span className="h-5 w-px bg-red-200" />
        <InfoItem icon="inventory_2" label="Còn:" value="850 đơn vị" tone="text-red-700" />
        <span className="h-5 w-px bg-red-200" />
        <InfoItem icon="location_on" label="KV:" value={formData.area || 'Toàn quốc'} />
      </div>
    );
  }

  if (postType === 'supply') {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3">
        <InfoItem
          icon="inventory_2"
          iconTone="text-orange-700"
          label="Cần mua:"
          value={formData.productName || 'Liên hệ'}
          tone="text-orange-700"
        />
        <span className="h-5 w-px bg-orange-200" />
        <div className="flex items-center gap-2">
          <Icon name="calendar_today" size={16} className="text-red-500" />
          <span className="text-xs font-semibold text-red-600">Deadline:</span>
          <span className="text-sm font-bold text-red-600">30/06/2026</span>
        </div>
        <span className="h-5 w-px bg-orange-200" />
        <InfoItem icon="location_on" label="KV:" value={formData.area || 'Toàn quốc'} />
      </div>
    );
  }

  if (postType === 'quote') {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name="request_quote" size={16} className="text-[#004785]" />
          <span className="text-sm font-bold text-[#004785]">Đang chờ báo giá từ nhà cung cấp</span>
        </div>
        <span className="h-5 w-px bg-blue-200" />
        <InfoItem icon="location_on" label="KV:" value={formData.area || 'Toàn quốc'} />
      </div>
    );
  }

  return null;
};

export default PreviewInfoBar;
