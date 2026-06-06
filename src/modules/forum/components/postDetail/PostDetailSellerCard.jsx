import React from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const typeConfig = {
  wholesale: {
    roleBadge: 'bg-blue-50 text-[#1E6BB8]',
    contactLabel: 'Nhắn tin',
    contactStyle: 'border-[#0F766E] text-[#0F766E]',
    showCall: true,
  },
  supply: {
    roleBadge: 'bg-orange-50 text-orange-700',
    contactLabel: 'Liên hệ báo giá',
    contactStyle: 'border-[#004785] text-[#004785]',
    showCall: false,
  },
  clearance: {
    roleBadge: 'bg-red-50 text-red-700',
    contactLabel: 'Nhắn tin ngay',
    contactStyle: 'border-red-500 text-red-500',
    showCall: true,
  },
  groupBuy: {
    roleBadge: 'bg-purple-50 text-purple-700',
    contactLabel: 'Nhắn tin',
    contactStyle: 'border-[#004785] text-[#004785]',
    showCall: false,
  },
};

const PostDetailSellerCard = ({ post, type }) => {
  const cfg = typeConfig[type] || typeConfig.wholesale;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={post.author} src={post.avatar} size="lg" />
          {post.authorVerified && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
              <Icon name="check" size={10} />
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{post.author}</h2>
            {post.authorVerified && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1E6BB8]">
                Đã xác minh
              </span>
            )}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cfg.roleBadge}`}>
              {post.authorRole}
            </span>
            <span className="text-slate-300">|</span>
            <Icon name="location_on" size={14} />
            <span>{post.location}</span>
            <span className="text-slate-300">|</span>
            <span>{post.date}</span>
          </p>
          {post.authorRating && (
            <div className="mt-1 flex items-center gap-1">
              <Icon name="star" className="text-yellow-400" size={14} />
              <span className="text-sm font-bold">{post.authorRating}</span>
              <span className="text-xs text-slate-400">({post.authorReviewCount} đánh giá)</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 ${cfg.contactStyle}`}
        >
          {cfg.contactLabel}
        </button>
        {cfg.showCall && (
          <button
            type="button"
            className="rounded-full bg-[#1E6BB8] px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            Gọi ngay
          </button>
        )}
      </div>
    </div>
  );
};

export default PostDetailSellerCard;
