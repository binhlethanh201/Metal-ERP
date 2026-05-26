/**
 * NewsCard - Thẻ tin tức ngành (dùng trong ForumNews).
 */
import React from 'react';
import { ArrowRight } from 'lucide-react'; // Import trực tiếp từ thư viện lucide-react

export const NewsCard = ({ news }) => {
  const { source, time, isHot, image, title, description, tags } = news;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-200 hover:border-[#004785]/30 hover:shadow-md">
      <div className="flex items-start gap-5 p-5">
        {/* Ảnh thu nhỏ tin tức - Bo góc rounded-xl đồng bộ */}
        <img
          src={image}
          alt={title}
          className="h-28 w-28 flex-shrink-0 rounded-xl border border-slate-100 bg-slate-100 object-cover"
        />

        {/* Khối nội dung tin tức */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Vùng Header: Nguồn báo, Thời gian, Badge Hot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="font-bold text-[#004785]">{source}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{time}</span>
            </div>
            {isHot && (
              <span className="rounded-md border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Hot
              </span>
            )}
          </div>

          {/* Tiêu đề tin tức ngành */}
          <h3 className="line-clamp-1 text-base font-bold leading-snug text-slate-900 transition-colors hover:text-[#004785]">
            {title}
          </h3>

          {/* Mô tả tóm tắt nội dung */}
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
            {description}
          </p>

          {/* Vùng Chân đế: Thẻ Hashtags và nút hành động chuyển trang */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Nút Xem chi tiết tích hợp trực tiếp Icon ArrowRight của Lucide */}
            <button
              type="button"
              className="group flex items-center gap-1 text-xs font-bold text-[#004785] transition-colors hover:text-black"
            >
              <span>Xem chi tiết</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
