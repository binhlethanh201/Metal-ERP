/**
 * Tab "Mo ta" trong modal san pham - Rich text editor + ghi chu hoa don.
 * Nhan f tu useEditProductForm de dong bo form state.
 */

const TOOLBAR_ICONS = [
  { icon: 'B', label: 'Bold' },
  { icon: 'I', label: 'Italic' },
  { icon: 'U', label: 'Underline' },
];

const ProductDescriptionTab = ({ f }) => {
  const desc = f?.form?.description ?? '';
  const notes = f?.form?.notes ?? '';

  return (
    <div>
      <div className="overflow-hidden rounded-md border border-[#dcdfe6] bg-white">
        <div className="flex h-10 items-center gap-2 border-b border-gray-200 bg-[#f5f6f7] px-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Mo ta</span>
            <select className="rounded border bg-transparent px-2 py-1 text-sm text-gray-700">
              <option>Format</option>
            </select>
          </div>
          <div className="mx-2 h-5 w-px bg-gray-300" />
          {TOOLBAR_ICONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-gray-600 hover:bg-gray-200"
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-gray-300" />
          {[
            'align-left',
            'align-center',
            'align-right',
            'list-bullet',
            'list-number',
            'link',
            'image',
          ].map((action) => (
            <button
              key={action}
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded text-sm text-gray-500 hover:bg-gray-200"
              title={action}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {action === 'align-left' && <path d="M3 6h14M3 12h18M3 18h10" />}
                {action === 'align-center' && <path d="M5 6h14M3 12h18M5 18h14" />}
                {action === 'align-right' && <path d="M7 6h14M3 12h18M9 18h14" />}
                {action === 'list-bullet' && (
                  <>
                    <circle cx="5" cy="6" r="1.5" />
                    <path d="M9 6h12" />
                    <circle cx="5" cy="12" r="1.5" />
                    <path d="M9 12h12" />
                    <circle cx="5" cy="18" r="1.5" />
                    <path d="M9 18h12" />
                  </>
                )}
                {action === 'list-number' && (
                  <>
                    <path d="M4 6h2v12H4z" />
                    <path d="M9 6h12M9 12h12M9 18h12" />
                  </>
                )}
                {action === 'link' && (
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                )}
                {action === 'image' && (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </>
                )}
              </svg>
            </button>
          ))}
        </div>
        <textarea
          className="min-h-[160px] w-full resize-none bg-white p-4 text-[15px] leading-[1.4] outline-none"
          placeholder="Nhap mo ta san pham"
          value={desc}
          onChange={(e) => f?.handleChange?.('description', e.target.value)}
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-[#dcdfe6]">
        <div className="bg-[#f5f6f7] px-4 py-3 text-sm font-semibold text-gray-700">
          Mau ghi chu (hoa don, dat hang)
        </div>
        <textarea
          className="min-h-[120px] w-full resize-none border-none p-4 outline-none"
          placeholder="Nhap ghi chu"
          value={notes}
          onChange={(e) => f?.handleChange?.('notes', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductDescriptionTab;
