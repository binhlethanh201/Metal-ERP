/**
 * Forum Service - Tất cả API calls cho module Diễn đàn
 * Gọi đến apiClient và endpoints tập trung
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';

// ============ Categories ============
export const getCategories = () => {
  return apiGet(ENDPOINTS.FORUM.GET_CATEGORIES);
};

export const getCategory = (id) => {
  return apiGet(ENDPOINTS.FORUM.GET_CATEGORY(id));
};

// ============ Posts ============
export const getPosts = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.FORUM.GET_POSTS}?${queryParams}`;
  return apiGet(endpoint);
};

export const getPost = (id) => {
  return apiGet(ENDPOINTS.FORUM.GET_POST(id));
};

export const createPost = (postData) => {
  return apiPost(ENDPOINTS.FORUM.CREATE_POST, postData);
};

export const updatePost = (id, postData) => {
  return apiPut(ENDPOINTS.FORUM.UPDATE_POST(id), postData);
};

export const deletePost = (id) => {
  return apiDelete(ENDPOINTS.FORUM.DELETE_POST(id));
};

// ============ Comments ============
export const getComments = (postId, filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.FORUM.GET_COMMENTS(postId)}?${queryParams}`;
  return apiGet(endpoint);
};

export const createComment = (postId, commentData) => {
  return apiPost(ENDPOINTS.FORUM.CREATE_COMMENT(postId), commentData);
};

export const updateComment = (commentId, commentData) => {
  return apiPut(ENDPOINTS.FORUM.UPDATE_COMMENT(commentId), commentData);
};

export const deleteComment = (commentId) => {
  return apiDelete(ENDPOINTS.FORUM.DELETE_COMMENT(commentId));
};

// ============ Votes/Likes ============
export const votePost = (postId, voteData) => {
  return apiPost(ENDPOINTS.FORUM.VOTE_POST(postId), voteData);
};

export const unvotePost = (postId) => {
  return apiDelete(ENDPOINTS.FORUM.UNVOTE_POST(postId));
};

// ============ Trends & Insights ============
export const getTrends = (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const endpoint = `${ENDPOINTS.FORUM.GET_TRENDS}?${queryParams}`;
  return apiGet(endpoint);
};

export const getProductSuggestions = () => {
  return apiGet(ENDPOINTS.FORUM.GET_PRODUCT_SUGGESTIONS);
};

export const getTrendingCategories = () => {
  return apiGet(ENDPOINTS.FORUM.GET_TRENDING_CATEGORIES);
};

export default {
  getCategories,
  getCategory,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  votePost,
  unvotePost,
  getTrends,
  getProductSuggestions,
  getTrendingCategories,
};
