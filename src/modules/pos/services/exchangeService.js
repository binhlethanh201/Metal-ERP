/**
 * Exchange Service - Đổi hàng chênh lệch (Exchange with Price Difference)
 * Backend: /api/pos/returns/exchange/*
 *  - POST /exchange/quote  : dry-run tính Delta + check tồn SP B (KHÔNG ghi DB)
 *  - POST /exchange        : thực thi đầy đủ (1 transaction)
 */
import { apiPosPost } from '../../../services/apiClient';

export const quoteExchange = (payload) =>
  apiPosPost('/pos/returns/exchange/quote', payload);

export const createExchange = (payload) =>
  apiPosPost('/pos/returns/exchange', payload);
