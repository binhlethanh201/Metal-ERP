/**
 * Upload áº£nh sáº£n pháº©m - Main preview + thumbnail list + thao tÃ¡c ghim/xÃ³a áº£nh.
 * ÄÃ£ Ä‘á»“ng bá»™ bá»™ icon Lucide má»›i.
 */
import Icon from '../../../../../shared/components/Icon';

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
                <Icon name="add" className="text-gray-400" size={28} />
                <span className="text-sm font-medium">Upload</span>
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
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border-2 border-dashed border-[#d1d5db] bg-white text-xl text-[#6b7280] transition-all duration-200 hover:border-blue-600 hover:bg-[#eff6ff] hover:text-blue-600"
          >
            <div className="flex flex-col items-center">
              <Icon name="add" size={20} />
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
              className="absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90 shadow-sm"
              title={idx === 0 ? 'áº¢nh Ä‘áº¡i diá»‡n' : 'Äáº·t lÃ m áº£nh Ä‘áº¡i diá»‡n'}
            >
              <Icon
                name="push_pin"
                className={idx === 0 ? 'text-blue-600' : 'text-gray-600'}
                size={14}
              />
            </button>
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute bottom-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white/90 shadow-sm"
              title="XÃ³a áº£nh"
            >
              <Icon name="delete" className="text-red-500" size={14} />
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
