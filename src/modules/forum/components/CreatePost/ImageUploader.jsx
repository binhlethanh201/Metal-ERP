/**
 * ImageUploader - Upload và hiển thị ảnh sản phẩm.
 * Nút tải lên (input file) + Danh sách ảnh đã chọn (có nút xóa từng ảnh).
 * Props: images[], onRemove, onFilesSelected.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const ImageUploader = ({ images, onRemove, onFilesSelected }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-on-surface">Ảnh sản phẩm</label>
    <div className="flex gap-4">
      <label className="flex h-32 w-32 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-bright transition-all hover:border-primary hover:bg-primary-container/5">
        <MaterialIcon name="add_a_photo" className="text-2xl text-on-surface-variant" />
        <span className="text-center text-xs font-medium text-on-surface-variant">Tải ảnh</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => onFilesSelected?.(Array.from(e.target.files || []))}
        />
      </label>
      {images.length > 0 && (
        <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200"
            >
              <img src={image} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove?.(index)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                aria-label={`Xóa ảnh ${index + 1}`}
              >
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ImageUploader;
