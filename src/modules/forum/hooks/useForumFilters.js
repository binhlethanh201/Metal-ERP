/**
 * useForumFilters - Custom hook xử lý logic tìm kiếm + lọc tab.
 * Input: posts[] (danh sách gốc).
 * Output: filteredPosts, activeTab, searchTerm, setActiveTab, setSearchTerm, handleSearchByTag.
 * Dùng trong ForumHome.
 */
import { useState, useMemo, useCallback } from 'react';

export const useForumFilters = (posts = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Nổi bật');

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      const matchTab =
        activeTab === 'Nổi bật' || post.tab === activeTab || post.status === activeTab;
      const content =
        `${post.title} ${post.description} ${post.tags?.join(' ') || ''}`.toLowerCase();
      const matchSearch = !keyword || content.includes(keyword);
      return matchTab && matchSearch;
    });
  }, [posts, activeTab, searchTerm]);

  const handleSearchByTag = useCallback((tag) => {
    setSearchTerm(tag);
    setActiveTab('Nổi bật');
  }, []);

  return { filteredPosts, activeTab, searchTerm, setActiveTab, setSearchTerm, handleSearchByTag };
};

export default useForumFilters;
