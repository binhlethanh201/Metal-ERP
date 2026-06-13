import { useState, useMemo } from 'react';
import { ALL_COLS, FROZEN_COLS } from '../data/orderPageData';

const LS_KEY = 'order_column_config';

const getDefaultColConfig = () => {
  const cfg = {};
  ALL_COLS.forEach((col, idx) => {
    cfg[col.key] = {
      visible: true,
      pinned: idx < FROZEN_COLS.length,
      displayName: col.header,
    };
  });
  return cfg;
};

const loadColConfig = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultColConfig();
};

export const useOrderColumns = () => {
  const [colConfig, setColConfig] = useState(loadColConfig);
  const [editColConfig, setEditColConfig] = useState(null);
  const [editColOrder, setEditColOrder] = useState([]);
  const [selectedColKey, setSelectedColKey] = useState(null);

  const { frozenCols, scrollCols } = useMemo(() => {
    const frozen = [];
    const scroll = [];
    const sorted = [...ALL_COLS].sort((a, b) => {
      const oa = colConfig[a.key]?.order ?? ALL_COLS.indexOf(a);
      const ob = colConfig[b.key]?.order ?? ALL_COLS.indexOf(b);
      return oa - ob;
    });
    sorted.forEach((col) => {
      const cfg = colConfig[col.key] || { visible: true, pinned: false, displayName: col.header };
      if (!cfg.visible) return;
      const displayCol = { ...col, header: cfg.displayName || col.header, pinned: cfg.pinned };
      if (cfg.pinned) frozen.push(displayCol);
      else scroll.push(displayCol);
    });
    const cbIdx = frozen.findIndex((c) => c.key === 'checkbox');
    if (cbIdx > 0) {
      const [cb] = frozen.splice(cbIdx, 1);
      frozen.unshift(cb);
    }
    return { frozenCols: frozen, scrollCols: scroll };
  }, [colConfig]);

  const openColumnModal = () => {
    setEditColConfig(JSON.parse(JSON.stringify(colConfig)));
    const ordered = [...ALL_COLS].sort((a, b) => {
      const oa = colConfig[a.key]?.order ?? ALL_COLS.indexOf(a);
      const ob = colConfig[b.key]?.order ?? ALL_COLS.indexOf(b);
      return oa - ob;
    });
    setEditColOrder(ordered.filter((c) => c.key !== 'checkbox').map((c) => c.key));
    setSelectedColKey(null);
  };

  const saveColumnConfig = () => {
    if (!editColConfig) return;
    const finalConfig = { ...editColConfig };
    editColOrder.forEach((key, idx) => {
      if (finalConfig[key]) finalConfig[key] = { ...finalConfig[key], order: idx };
    });
    setColConfig(finalConfig);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(finalConfig));
    } catch {}
  };

  const resetColumnConfig = () => {
    setEditColConfig(getDefaultColConfig());
    setEditColOrder(ALL_COLS.filter((c) => c.key !== 'checkbox').map((c) => c.key));
    setSelectedColKey(null);
  };

  return {
    colConfig,
    frozenCols,
    scrollCols,
    editColConfig,
    setEditColConfig,
    editColOrder,
    setEditColOrder,
    selectedColKey,
    setSelectedColKey,
    openColumnModal,
    saveColumnConfig,
    resetColumnConfig,
  };
};
