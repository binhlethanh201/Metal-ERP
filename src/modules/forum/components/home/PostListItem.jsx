/**
 * PostListItem - Một item bài viết trong feed trang chủ.
 * Avatar + author + role badge + thời gian + status badge + title + description + tags + comments/views.
 * Props: post (object), onClick, onTagClick.
 */
import Avatar from '../shared/Avatar';
import MaterialIcon from '../shared/MaterialIcon';

const PostListItem = ({ post, onClick, onTagClick }) => (
  <article
    onClick={onClick}
    className="cursor-pointer border-b border-gray-100 bg-white p-5 transition-all last:border-b-0 hover:bg-gray-50/50"
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Avatar src={post.avatar} name={post.author} size="md" />
        <span className="text-sm font-bold text-gray-900">{post.author}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.roleClass}`}
        >
          {post.role}
        </span>
        <span className="text-xs text-slate-400">• {post.time}</span>
      </div>
      {post.status && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${post.statusClass}`}>
          {post.status}
        </span>
      )}
    </div>
    <h3 className="mb-1.5 cursor-pointer text-xl font-bold text-gray-900 hover:text-[#004785]">
      {post.title}
    </h3>
    <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-gray-600">
      {post.description}
    </p>
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 text-slate-400">
        <span className="flex items-center gap-1 text-xs">
          <MaterialIcon name="chat_bubble" className="text-[14px]" /> {post.comments}
        </span>
        <span className="flex items-center gap-1 text-xs">
          <MaterialIcon name="visibility" className="text-[14px]" /> {post.views}
        </span>
      </div>
    </div>
  </article>
);

export default PostListItem;
