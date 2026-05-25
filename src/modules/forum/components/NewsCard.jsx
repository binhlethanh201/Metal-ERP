/**
 * NewsCard Component - Thẻ hiển thị tin tức ngành
 * Hiển thị ảnh, tiêu đề, mô tả, thẻ, và nút xem chi tiết
 */

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20` }}
  >
    {name}
  </span>
);

export const NewsCard = ({ news }) => {
  const { source, time, isHot, image, title, description, tags } = news;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-6 p-6">
        {/* Ảnh tin tức */}
        <img
          src={image}
          alt={title}
          className="h-32 w-32 flex-shrink-0 rounded-lg bg-slate-100 object-cover"
        />

        {/* Nội dung tin tức */}
        <div className="flex-1 space-y-2">
          {/* Header: Nguồn, Thời gian, Badge Hot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="font-bold text-[#004785]">{source}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-slate-400">{time}</span>
            </div>
            {isHot && (
              <span className="rounded-full bg-orange-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Hot
              </span>
            )}
          </div>

          {/* Tiêu đề */}
          <h3 className="text-xl font-bold leading-tight text-gray-900 transition-colors hover:text-[#004785]">
            {title}
          </h3>

          {/* Mô tả */}
          <p className="line-clamp-2 text-[15px] leading-relaxed text-gray-600">{description}</p>

          {/* Footer: Thẻ và nút xem chi tiết */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-[#004785] transition-colors hover:underline">
              Xem chi tiết
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
