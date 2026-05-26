/**
 * ThreadListItem - Một chủ đề thảo luận.
 * Avatar + author + category badge + title + description + tags + stats (comments/views) + bookmark.
 * Props: thread (object).
 */
import Avatar from '../shared/Avatar';
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ThreadListItem = ({ thread }) => (
  <article className="cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#004785]/30 hover:shadow-md">
    <div className="flex gap-4">
      <div className="shrink-0">
        <Avatar src={thread.avatar} name={thread.avatarInitials || thread.author} size="lg" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-bold text-gray-900 transition-colors hover:text-[#004785]">
            {thread.author}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MaterialIcon name="schedule" className="text-[14px]" />
            {thread.time}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${thread.categoryClass}`}
          >
            {thread.category}
          </span>
        </div>
        <h3 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors hover:text-[#004785]">
          {thread.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-[15px] leading-relaxed text-gray-600">
          {thread.description}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {thread.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-6 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-slate-500">
            <MaterialIcon name="forum" className="text-[20px]" />
            <span className="text-xs font-bold">{thread.comments}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <MaterialIcon name="visibility" className="text-[20px]" />
            <span className="text-xs font-medium">{thread.views}</span>
          </div>
          <div className="ml-auto">
            <button type="button" className="text-slate-400 transition-colors hover:text-[#004785]">
              <MaterialIcon name="bookmark" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
);

export default ThreadListItem;
