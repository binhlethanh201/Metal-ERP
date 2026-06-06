/**
 * PostingTips - Hộp cẩm nang mẹo đăng bài hiệu quả.
 */
import React from 'react';
import { Lightbulb } from 'lucide-react';

const tips = [
  'Tiêu đề chứa tên thương hiệu thép/ốc vít cụ thể và khu vực giúp tăng 40% lượt tìm kiếm đúng đối tượng.',
  'Sử dụng hình ảnh thực tế từ xưởng hoặc kho bãi bốc xếp để tạo niềm tin tuyệt đối với bạn hàng đại lý.',
  'Mô tả chi tiết năng lực cung ứng theo tháng hoặc MOQ tối thiểu để thu hút các đầu buôn sỉ lớn nhảy vào thương thảo.',
];

const PostingTips = () => (
  <div className="shadow-sm/5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
    <div className="mb-4 flex items-center gap-2 text-[#004785]">
      <Lightbulb size={16} className="fill-[#004785]/10" />
      <h3 className="text-xs font-black uppercase tracking-widest">Mẹo đăng bài hiệu quả</h3>
    </div>
    <ul className="space-y-3 text-left text-xs font-semibold leading-relaxed text-slate-600">
      {tips.map((tip, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
          <p>{tip}</p>
        </li>
      ))}
    </ul>
  </div>
);

export default PostingTips;
