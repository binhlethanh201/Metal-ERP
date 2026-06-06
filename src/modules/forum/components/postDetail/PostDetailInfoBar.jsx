import React from 'react';
import Icon from '../../../../shared/components/Icon';

const WholesaleBar = ({ product }) => {
  if (!product) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon name="sell" size={16} className="text-[#004785]" />
        <span className="text-xs font-semibold text-slate-500">Giá sỉ:</span>
        <span className="text-sm font-bold text-[#004785]">{product.priceRange || 'Liên hệ'}</span>
      </div>
      <span className="h-5 w-px bg-emerald-200" />
      <span
        className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold ${
          product.stock === 'Sắp hết hàng'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${product.stock === 'Sắp hết hàng' ? 'bg-orange-500' : 'bg-green-500'}`}
        />
        {product.stock || 'Còn hàng'}
      </span>
      <span className="h-5 w-px bg-emerald-200" />
      <div className="flex items-center gap-2">
        <Icon name="location_on" size={16} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">KV:</span>
        <span className="text-sm font-bold text-slate-700">{product.area || '-'}</span>
      </div>
    </div>
  );
};

const SupplyBar = ({ post }) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3">
    <div className="flex items-center gap-2">
      <Icon name="inventory_2" size={16} className="text-orange-700" />
      <span className="text-xs font-semibold text-slate-500">Cần mua:</span>
      <span className="text-sm font-bold text-orange-700">{post.neededQty}</span>
    </div>
    <span className="h-5 w-px bg-orange-200" />
    <div className="flex items-center gap-2">
      <Icon name="calendar_today" size={16} className="text-red-500" />
      <span className="text-xs font-semibold text-red-600">Deadline:</span>
      <span className="text-sm font-bold text-red-600">{post.deadline}</span>
    </div>
    <span className="h-5 w-px bg-orange-200" />
    <div className="flex items-center gap-2">
      <Icon name="location_on" size={16} className="text-slate-400" />
      <span className="text-xs font-semibold text-slate-500">KV:</span>
      <span className="text-sm font-bold text-slate-700">{post.area}</span>
    </div>
  </div>
);

const ClearanceBar = ({ product }) => {
  if (!product) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon name="sell" size={16} className="text-red-500" />
        <span className="text-xs font-semibold text-red-600">Thanh lý:</span>
        <span className="text-lg font-black text-red-600">{product.clearancePrice}</span>
      </div>
      <span className="h-5 w-px bg-red-200" />
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-slate-500">Giá gốc:</span>
        <span className="text-sm font-bold text-slate-400 line-through">
          {product.originalPrice}
        </span>
      </div>
      <span className="h-5 w-px bg-red-200" />
      <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        {product.discount}
      </span>
      <span className="h-5 w-px bg-red-200" />
      <div className="flex items-center gap-2">
        <Icon name="inventory_2" size={16} className="text-red-500" />
        <span className="text-xs font-semibold text-slate-500">Còn:</span>
        <span className="text-sm font-bold text-red-700">{product.remaining}</span>
      </div>
      <span className="h-5 w-px bg-red-200" />
      <div className="flex items-center gap-2">
        <Icon name="location_on" size={16} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">KV:</span>
        <span className="text-sm font-bold text-slate-700">{product.area}</span>
      </div>
    </div>
  );
};

const GroupBuyBar = ({ post }) => {
  const pct = Math.round((post.participants / post.targetParticipants) * 100);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-purple-100 bg-purple-50/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon name="groups" size={18} className="text-purple-600" />
        <span className="text-sm font-bold text-purple-700">
          {post.participants}/{post.targetParticipants} người
        </span>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-purple-200">
          <div
            className="h-full rounded-full bg-purple-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-purple-500">{pct}%</span>
      </div>
      <span className="h-5 w-px bg-purple-200" />
      <div className="flex items-center gap-2">
        <Icon name="schedule" size={16} className="text-orange-500" />
        <span className="text-xs font-semibold text-orange-600">{post.deadline}</span>
      </div>
      <span className="h-5 w-px bg-purple-200" />
      <div className="flex items-center gap-2">
        <Icon name="location_on" size={16} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">KV:</span>
        <span className="text-sm font-bold text-slate-700">{post.area}</span>
      </div>
    </div>
  );
};

const PostDetailInfoBar = ({ post, product, type }) => {
  if (type === 'supply') return <SupplyBar post={post} />;
  if (type === 'clearance') return <ClearanceBar product={product} />;
  if (type === 'groupBuy') return <GroupBuyBar post={post} />;
  return <WholesaleBar product={product} />;
};

export default PostDetailInfoBar;
