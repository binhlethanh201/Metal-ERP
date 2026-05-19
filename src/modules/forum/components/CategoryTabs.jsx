/**
 * CategoryTabs Component - Tabs tin tức ngành
 */

export const CategoryTabs = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
          <span className="text-xs opacity-75">({category.postCount})</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
