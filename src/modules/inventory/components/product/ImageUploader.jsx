/**
 * Upload ảnh sản phẩm - Main preview + thumbnail list + thao tác pin/remove.
 * Props: images, maxImages, fileInputRef, onOpenFilePicker, onUpload, onPinImage, onRemoveImage, productName.
 */
import MaterialIcon from '../shared/MaterialIcon';

const ImageUploader = ({
  images,
  maxImages,
  fileInputRef,
  onOpenFilePicker,
  onUpload,
  onPinImage,
  onRemoveImage,
  productName,
}) => (
  <div className="flex flex-col gap-3">
    <input
      ref={fileInputRef}
      onChange={onUpload}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
    />

    <div className="flex w-full items-start gap-4">
      <div className="relative flex-1 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb]">
        <div className="aspect-[1/1] w-full">
          {images?.length > 0 ? (
            <img
              src={images[0].url}
              alt={productName || 'Product'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center py-8 text-gray-400">
              <button
                type="button"
                onClick={onOpenFilePicker}
                className="flex flex-col items-center gap-2"
              >
                <MaterialIcon name="add" className="text-3xl text-gray-400" />
                <span className="text-sm">Upload</span>
              </button>
            </div>
          )}
        </div>
        {images?.length > 0 && (
          <div className="absolute left-2 top-2 z-20 rounded-full bg-black/75 px-3 py-1 text-[12px] font-semibold text-white">
            Main
          </div>
        )}
      </div>

      <div className="flex w-20 flex-col items-center gap-3">
        {images.length < maxImages ? (
          <button
            onClick={onOpenFilePicker}
            type="button"
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed border-[#d1d5db] bg-white text-[28px] text-[#6b7280] transition-all duration-200 hover:border-blue-600 hover:bg-[#eff6ff] hover:text-blue-600"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">+</span>
            </div>
          </button>
        ) : (
          <div className="h-20 w-20" />
        )}

        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative h-20 w-20 overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb]"
          >
            <button
              type="button"
              onClick={() => onPinImage(idx)}
              className="absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90"
              title={idx === 0 ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}
            >
              <MaterialIcon
                name="push_pin"
                className={idx === 0 ? 'text-blue-600' : 'text-gray-600'}
              />
            </button>
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute bottom-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90"
              title="Xóa ảnh"
            >
              <MaterialIcon name="delete" className="text-red-500" />
            </button>
            <img
              src={img.url}
              alt={`thumb-${idx}`}
              className={`h-full w-full object-cover ${idx === 0 ? 'ring-2 ring-blue-300' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ImageUploader;
