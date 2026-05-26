/**
 * PostTypeSelector - Chọn loại bài đăng
 */
import React from 'react';
// Import trực tiếp các icon cần thiết để map động cho 5 loại bài đăng
import { Store, SearchCode, FileText, TrendingUp, CheckCircle } from 'lucide-react';

// Đối sánh chuỗi tên icon cũ sang component Lucide tương ứng
const iconMap = {
  storefront: Store,
  search_insights: SearchCode,
  request_quote: FileText,
  trending_up: TrendingUp,
  verified: CheckCircle,
};

const PostTypeSelector = ({ postTypes, selectedType, onChange }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-[#004785]">
        1. Chọn loại bài đăng
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {postTypes.map((item) => {
          const active = selectedType === item.key;

          // Lấy component Icon tương ứng từ map, nếu không có thì fallback về Store
          const TargetIcon = iconMap[item.icon] || Store;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`group flex min-h-24 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                active
                  ? 'shadow-sm/5 border-2 border-blue-200 bg-blue-50/50 font-bold text-[#004785]'
                  : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-[#004785]'
              }`}
            >
              {/* Render icon Lucide phẳng mượt mà */}
              <TargetIcon className="mb-2" size={22} />
              <span className="text-xs font-semibold md:text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PostTypeSelector;
