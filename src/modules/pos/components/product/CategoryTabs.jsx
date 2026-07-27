/** Tab danh mục sản phẩm ngang - Dạng pill button, chọn danh mục để lọc. */
const CategoryTabs = ({ categories, selected, onSelect }) => (
  <div className="custom-scrollbar mb-6 flex items-center gap-x-2 overflow-x-auto pb-2">
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => onSelect(category)}
        className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-colors active:scale-95 ${selected === category ? 'bg-[#004785] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#004785] hover:text-[#004785] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999] dark:hover:border-[#004785] dark:hover:text-[#004785]'}`}
      >
        {category}
      </button>
    ))}
  </div>
);

export default CategoryTabs;
