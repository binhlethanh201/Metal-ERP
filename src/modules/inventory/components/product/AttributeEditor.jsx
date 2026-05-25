/** Quản lý thuộc tính sản phẩm - Dropdown chọn + input giá trị + thêm/sửa/xóa thuộc tính. */
const AttributeEditor = ({ f }) => (
  <>
    <h4 className="mb-1 text-[18px] font-semibold text-gray-800">Thuộc tính</h4>
    <p className="mb-5 text-[14px] text-gray-500">Thêm đặc điểm như hương vị, dung tích, màu sắc</p>

    <div className="space-y-3">
      {(f.form.attributes || []).map((attr) => (
        <div
          key={attr.id}
          className="grid items-center"
          style={{ gridTemplateColumns: '230px 1fr 52px', gap: '12px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                f.setOpenDropdownId(f.openDropdownId === attr.id ? null : attr.id);
              }}
              className={`h-12 w-full border bg-white px-4 text-left ${f.openDropdownId === attr.id ? 'border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-[#d1d5db]'} flex items-center justify-between rounded-[10px] text-[16px]`}
            >
              <span className={`truncate ${attr.name ? 'text-gray-800' : 'text-gray-500'}`}>
                {attr.name || 'Chọn thuộc tính'}
              </span>
              <span className="material-symbols-outlined text-gray-500">expand_more</span>
            </button>
            {f.openDropdownId === attr.id && (
              <div
                className="absolute bottom-full left-0 z-50 mb-2 w-full origin-bottom transform overflow-hidden rounded-lg bg-white shadow-lg"
                style={{ padding: '8px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              >
                {f.availableAttributes.map((item, aidx) => (
                  <div
                    key={item + aidx}
                    onClick={() => {
                      f.updateAttr(attr.id, 'name', item);
                      f.setOpenDropdownId(null);
                    }}
                    className={`flex h-11 cursor-pointer items-center justify-between px-4 ${attr.name === item ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  >
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        f.setEditAttrIndex(aidx);
                        f.setEditAttrValue(item);
                        f.setEditAttrModalOpen(true);
                        f.setOpenDropdownId(null);
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => {
                    f.setEditingAttrId(attr.id);
                    f.setNewAttrName('');
                    f.setCreateAttrModalOpen(true);
                    f.setOpenDropdownId(null);
                  }}
                  className="flex h-11 cursor-pointer items-center px-4 hover:bg-gray-100"
                >
                  <span className="font-medium text-blue-600">+ Tạo thuộc tính mới</span>
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Nhập giá trị thuộc tính"
            value={attr.value || ''}
            onChange={(e) => f.updateAttr(attr.id, 'value', e.target.value)}
            className="h-12 rounded-[10px] bg-[#f3f4f6] px-4 text-[16px] placeholder-gray-400 focus:border focus:border-blue-600 focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => f.removeAttr(attr.id)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white hover:bg-red-50"
            onMouseEnter={(e) => e.currentTarget.classList.add('border-red-500')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('border-red-500')}
          >
            <span className="material-symbols-outlined text-gray-600">delete</span>
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            f.addAttrRow();
          }}
          className="mt-2 text-[18px] font-medium text-blue-600 hover:underline"
        >
          + Thêm thuộc tính
        </button>
      </div>
    </div>
  </>
);

export default AttributeEditor;
