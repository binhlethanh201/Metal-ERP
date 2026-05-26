/**
 * src/modules/forum/components/supply/SupplyPostCard.jsx
 * Card thông tin nguồn hàng B2B - Đồng bộ icon Lucide và bo góc hệ thống rounded-xl.
 */
import React from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const SupplyPostCard = ({ post }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:border-[#004785]/30 hover:shadow-md">
    {/* HEADER CARD NGUỒN HÀNG */}
    <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar src={post.avatar} name={post.avatarInitials || post.author} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900">{post.author}</h4>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004785]">
              {post.role}
            </span>
            {post.verified && (
              <Icon name="check_circle" className="fill-blue-500/10 text-blue-500" size={14} />
            )}
          </div>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-400">
            <Icon name="clock" size={12} />
            {post.time}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785]"
      >
        <Icon name="more_horizontal" size={18} />
      </button>
    </header>

    {/* THÂN BÀI VIẾT NGUỒN HÀNG */}
    <div className="p-5">
      <span
        className={`mb-2.5 inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-tight ${post.typeTone}`}
      >
        {post.type}
      </span>
      <h3 className="mb-2 cursor-pointer text-lg font-bold leading-tight text-gray-900 transition-colors hover:text-[#004785]">
        {post.title}
      </h3>
      <p className="line-clamp-3 text-[15px] leading-relaxed text-slate-600">{post.description}</p>

      {post.tags && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* KHỐI PRODUCT THÔNG SỐ SỈ (NẾU CÓ) */}
      {'product' in post && (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:flex-row">
          <img
            alt={post.product.name}
            className="h-24 w-full rounded-xl border border-slate-100 object-cover shadow-sm md:h-20 md:w-24"
            src={post.product.image}
          />
          <div className="grid w-full grid-cols-2 gap-4 font-medium md:grid-cols-4">
            <div>
              <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Sản phẩm
              </p>
              <p className="truncate text-sm font-bold text-slate-700">{post.product.name}</p>
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Giá sỉ / lẻ
              </p>
              <p className="text-sm font-bold text-[#004785]">{post.product.price}</p>
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                MOQ / Khu vực
              </p>
              <p className="text-sm font-bold text-slate-700">{post.product.moq}</p>
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Trạng thái
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <p className="text-sm font-bold text-green-600">{post.product.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHÂN ĐẾ CHỨA TIỆN ÍCH TƯƠNG TÁC & BUTTON CHUẨN ROUNDED-XL */}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        {'stats' in post ? (
          <div className="flex items-center gap-1">
            {post.stats.map((item) => (
              <button
                key={item.icon}
                type="button"
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                <Icon name={item.icon === 'forum' ? 'chat_bubble' : item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-5 font-semibold text-slate-400">
            {post.meta.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs">
                <Icon name={item.icon === 'visibility' ? 'visibility' : 'chat_bubble'} size={14} />
                {item.label}
              </span>
            ))}
          </div>
        )}

        {/* NHÓM ACTION CHUYỂN HOÀN TOÀN SANG ROUNDED-XL ĐỒNG BỘ POS */}
        <div className="flex items-center gap-2">
          {post.id === 1 ? (
            <>
              <button
                type="button"
                className="rounded-xl border-[2px] border-[#004785] px-4 py-2 text-xs font-bold text-[#004785] transition-all hover:bg-[#004785]/5 active:scale-95"
              >
                Nhắn tin
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#004785] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
              >
                Xem chi tiết
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-xl bg-[#004785] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
            >
              Báo giá ngay
            </button>
          )}
        </div>
      </footer>
    </div>
  </article>
);

export default SupplyPostCard;
