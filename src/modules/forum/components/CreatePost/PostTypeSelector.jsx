/**
 * PostTypeSelector - Bước 1: Chọn loại bài đăng.
 * 5 nút: Đăng bán sỉ, Tìm nguồn hàng, Hỏi giá, Thanh lý kho, Mua chung.
 * Props: postTypes[], selectedType, onChange.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const PostTypeSelector = ({ postTypes, selectedType, onChange }) => (
  <div className="rounded-lg border border-outline-variant bg-white p-4 md:p-6">
    <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
      1. Chọn loại bài đăng
    </h3>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {postTypes.map((item) => {
        const active = selectedType === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`group flex min-h-24 flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
              active
                ? 'border-2 border-primary-container bg-surface-container-low text-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary'
            }`}
          >
            <MaterialIcon name={item.icon} className="mb-2 text-[24px]" fill={active} />
            <span className="text-xs font-medium md:text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default PostTypeSelector;
