/**
 * PostHeader - Tiêu đề + mô tả động theo loại bài đăng.
 * 5 loại: Hỏi giá, Thanh lý kho, Tìm nguồn, Mua chung, Bán sỉ (mặc định).
 * Props: postType.
 */
const POST_LABELS = {
  quote: {
    title: 'Đăng bài hỏi giá mới',
    desc: 'Điền đầy đủ thông tin để đối tác báo giá nhanh và chính xác hơn.',
  },
  trend: {
    title: 'Đăng Thanh lý kho',
    desc: 'Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.',
  },
  supply: {
    title: 'Đăng nguồn hàng',
    desc: 'Điền đầy đủ thông tin để nhà cung cấp phù hợp liên hệ với bạn.',
  },
  trusted: {
    title: 'Đăng Mua chung',
    desc: 'Điền đầy đủ thông tin để thu hút đối tác và khách hàng B2B tiềm năng.',
  },
};

const getLabel = (type, field) => POST_LABELS[type]?.[field] || POST_LABELS.supply[field];

const PostHeader = ({ postType }) => (
  <header className="mb-6">
    <h1 className="mb-2 text-3xl font-bold leading-tight text-on-surface md:text-4xl">
      {getLabel(postType, 'title')}
    </h1>
    <p className="text-sm text-on-surface-variant md:text-base">{getLabel(postType, 'desc')}</p>
  </header>
);

export default PostHeader;
