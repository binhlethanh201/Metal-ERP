/**
 * SupplyPostCard - Card nguồn hàng.
 * Header: Avatar + role + verified badge + thời gian.
 * Body: Loại bài (Bán sỉ/Tìm nguồn) + title + description + tags + product info (ảnh/giá/MOQ/trạng thái).
 * Footer: Stats + Action buttons (Nhắn tin/Xem chi tiết/Báo giá).
 * Props: post (object).
 */
import MaterialIconBase from '../shared/MaterialIcon';
import Avatar from '../shared/Avatar';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const SupplyPostCard = ({ post }) => (
  <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-[#004785]/30 hover:shadow-md">
    <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar src={post.avatar} name={post.avatarInitials || post.author} size="md" />
          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900">{post.author}</h4>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004785]">
              {post.role}
            </span>
            {post.verified && (
              <MaterialIcon name="verified" fill className="text-[16px] text-blue-500" />
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MaterialIcon name="schedule" className="text-[14px]" />
            {post.time}
          </span>
        </div>
      </div>
      <button type="button" className="p-2 text-slate-400 transition-colors hover:text-[#004785]">
        <MaterialIcon name="more_horiz" />
      </button>
    </header>
    <div className="p-5">
      <span
        className={`mb-3 inline-block rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-tight ${post.typeTone}`}
      >
        {post.type}
      </span>
      <h3 className="mb-3 cursor-pointer text-xl font-bold leading-tight text-gray-900 transition-colors hover:text-[#004785]">
        {post.title}
      </h3>
      <p className="line-clamp-3 text-[15px] leading-relaxed text-gray-600">{post.description}</p>
      {post.tags && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {'product' in post && (
        <div className="mt-5 flex flex-col items-center gap-5 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 md:flex-row">
          <img
            alt={post.product.name}
            className="h-28 w-full rounded-xl object-cover shadow-sm md:h-24 md:w-28"
            src={post.product.image}
          />
          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sản phẩm
              </p>
              <p className="truncate text-sm font-bold text-slate-700">{post.product.name}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Giá sỉ / lẻ
              </p>
              <p className="text-sm font-bold text-[#004785]">{post.product.price}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                MOQ / Khu vực
              </p>
              <p className="text-sm font-bold text-slate-700">{post.product.moq}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Trạng thái
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <p className="text-sm font-bold text-green-600">{post.product.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
        {'stats' in post ? (
          <div className="flex items-center gap-1">
            {post.stats.map((item) => (
              <button
                key={item.icon}
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-500 transition-colors hover:bg-gray-100"
              >
                <MaterialIcon name={item.icon} className="text-[20px]" />
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-5">
            {post.meta.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400"
              >
                <MaterialIcon name={item.icon} className="text-[18px]" />
                {item.label}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          {post.id === 1 ? (
            <>
              <button className="rounded-full border-2 border-[#004785] px-5 py-2.5 text-xs font-bold text-[#004785] transition-all hover:bg-[#004785]/5">
                Nhắn tin
              </button>
              <button className="rounded-full bg-[#004785] px-7 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#00376b] hover:shadow-lg active:scale-95">
                Xem chi tiết
              </button>
            </>
          ) : (
            <button className="rounded-full bg-[#004785] px-7 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#00376b] hover:shadow-lg active:scale-95">
              Báo giá ngay
            </button>
          )}
        </div>
      </footer>
    </div>
  </article>
);

export default SupplyPostCard;
