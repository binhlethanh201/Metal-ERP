/** Tab "Mô tả" trong modal sản phẩm - Rich text editor + ghi chú hóa đơn. */
const ProductDescriptionTab = () => (
  <div className="px-6 pb-6">
    <div className="mt-5 overflow-hidden rounded-md border border-[#dcdfe6] bg-white">
      <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-[#f5f6f7] px-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Mô tả</span>
          <select className="rounded border bg-transparent px-2 py-1 text-sm text-gray-700">
            <option>Format</option>
          </select>
        </div>
        <div className="ml-4 flex items-center gap-2">
          {[
            'format_bold',
            'format_italic',
            'format_underlined',
            'format_align_left',
            'format_align_center',
            'format_align_right',
            'format_list_bulleted',
            'format_list_numbered',
            'link',
            'image',
          ].map((icon) => (
            <button key={icon} type="button" className="h-8 w-8 rounded p-1 hover:bg-gray-100">
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="min-h-[160px] w-full resize-none bg-white p-4 text-[15px] leading-[1.4] outline-none"
        placeholder="Nhập mô tả sản phẩm"
      />
    </div>
    <div className="mt-4 overflow-hidden rounded-md border border-[#dcdfe6]">
      <div className="bg-[#f5f6f7] px-4 py-3 font-semibold">Mẫu ghi chú (hóa đơn, đặt hàng)</div>
      <textarea
        className="min-h-[120px] w-full resize-none border-none p-4 outline-none"
        placeholder=""
      />
    </div>
  </div>
);

export default ProductDescriptionTab;
