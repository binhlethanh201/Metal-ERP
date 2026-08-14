/**
 * Exchange Service - Đổi hàng chênh lệch (Exchange with Price Difference)
 * Backend: /api/pos/returns/exchange/*
 *  - POST /exchange/quote  : dry-run tính Delta + check tồn SP B (KHÔNG ghi DB)
 *  - POST /exchange        : tạo phiếu đổi chênh lệch (Pending, reserve ReturnedQuantity)
 *  - POST /returns/{id}/exchange/pay            : thanh toán chênh lệch (delta>0) — CASH→Completed / TRANSFER→QR+Pending
 *  - POST /returns/{id}/exchange/confirm-transfer : xác nhận chuyển khoản → Completed
 *  - POST /returns/{id}/exchange/cancel-payment  : huỷ QR đang chờ
 */
import { apiPosPost } from '../../../services/apiClient';

export const quoteExchange = (payload) =>
  apiPosPost('/pos/returns/exchange/quote', payload);

export const createExchange = (payload) =>
  apiPosPost('/pos/returns/exchange', payload);

export const payExchangeDiff = (returnOrderId, payload) =>
  apiPosPost(`/pos/returns/${returnOrderId}/exchange/pay`, payload);

export const confirmExchangeTransfer = (returnOrderId, payload) =>
  apiPosPost(`/pos/returns/${returnOrderId}/exchange/confirm-transfer`, payload);

export const cancelExchangePayment = (returnOrderId) =>
  apiPosPost(`/pos/returns/${returnOrderId}/exchange/cancel-payment`, {});
