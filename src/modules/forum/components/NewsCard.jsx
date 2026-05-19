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
    <article className="overflow-hidden rounded-xl border border-slate-100 bg-surface-container-lowest transition-all hover:shadow-xl hover:shadow-slate-200">
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
            <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
              <span className="font-bold text-primary">{source}</span>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span>{time}</span>
            </div>
            {isHot && (
              <span className="rounded-full bg-secondary-container px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-container">
                Hot
              </span>
            )}
          </div>

          {/* Tiêu đề */}
          <h3 className="text-xl font-bold leading-tight transition-colors hover:text-primary">
            {title}
          </h3>

          {/* Mô tả */}
          <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>

          {/* Footer: Thẻ và nút xem chi tiết */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:underline">
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
