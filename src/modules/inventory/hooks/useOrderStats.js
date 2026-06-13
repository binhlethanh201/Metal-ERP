import { useMemo } from 'react';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const useOrderStats = (orders) => {
  // ── Thống kê hàng hóa ──
  const productStats = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.sku;
        if (!map[key]) {
          map[key] = {
            sku: item.sku,
            name: item.name,
            unit: item.unit,
            quantity: 0,
            revenue: 0,
            orders: 0,
          };
        }
        map[key].quantity += item.quantity;
        map[key].revenue += item.price * item.quantity;
        map[key].orders += 1;
      });
    });
    const list = Object.values(map);
    list.sort((a, b) => b.revenue - a.revenue);
    return list;
  }, [orders]);

  const productTopByQty = useMemo(() => {
    const sorted = [...productStats].sort((a, b) => b.quantity - a.quantity);
    return sorted.slice(0, 10);
  }, [productStats]);

  const productTopByRevenue = useMemo(() => {
    const sorted = [...productStats].sort((a, b) => b.revenue - a.revenue);
    return sorted.slice(0, 10);
  }, [productStats]);

  const productSummary = useMemo(() => {
    const totalQty = productStats.reduce((s, p) => s + p.quantity, 0);
    const totalRevenue = productStats.reduce((s, p) => s + p.revenue, 0);
    return { totalProducts: productStats.length, totalQty, totalRevenue };
  }, [productStats]);

  // ── Thống kê đơn hàng ──
  const orderSummary = useMemo(
    () => ({
      total: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.totalPayment, 0),
      avgValue:
        orders.length > 0
          ? Math.round(orders.reduce((s, o) => s + o.totalPayment, 0) / orders.length)
          : 0,
      totalCod: orders.reduce((s, o) => s + o.codAmount, 0),
      totalShippingCustomer: orders.reduce((s, o) => s + o.shippingFeeCustomer, 0),
      totalShippingPartner: orders.reduce((s, o) => s + o.shippingFeePartner, 0),
    }),
    [orders]
  );

  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.status || 'Không xác định';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([key, count]) => ({ label: key, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const ordersByChannel = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.salesChannel || 'Không xác định';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([key, count]) => ({ label: key, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const ordersByPartner = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = (o.deliveryPartner || '').split('\n')[0] || 'Không xác định';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([key, count]) => ({ label: key, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const topCustomers = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.recipientName || 'Không xác định';
      if (!map[key]) map[key] = { name: key, count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += o.totalPayment;
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [orders]);

  const dailyRevenue = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const day = o.createdDate || '';
      if (!map[day]) map[day] = { date: day, count: 0, revenue: 0 };
      map[day].count += 1;
      map[day].revenue += o.totalPayment;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  // ── Chart helpers ──
  const maxBarValue = (items, key) => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((i) => i[key]), 1);
  };

  const STATUS_COLORS = {
    'Hoàn thành': 'bg-emerald-500',
    'Đã giao hàng': 'bg-blue-500',
    'Đang giao hàng': 'bg-amber-500',
    'Chờ lấy hàng': 'bg-orange-400',
    'Đã hủy': 'bg-red-400',
  };

  const CHANNEL_COLORS = {
    'Tại cửa hàng': 'bg-indigo-500',
    Shopee: 'bg-orange-500',
    Lazada: 'bg-blue-600',
    'TikTok Shop': 'bg-slate-800',
    Website: 'bg-cyan-500',
  };

  return {
    productStats,
    productTopByQty,
    productTopByRevenue,
    productSummary,
    orderSummary,
    ordersByStatus,
    ordersByChannel,
    ordersByPartner,
    topCustomers,
    dailyRevenue,
    maxBarValue,
    STATUS_COLORS,
    CHANNEL_COLORS,
    formatCurrency,
  };
};
