import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Table from '../../../../shared/components/Table';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import {
  getProductLocations,
  createProductLocation,
  renameProductLocation,
  deleteProductLocation,
  getAttributeTypes,
  createAttributeType,
  updateAttributeType,
  deleteAttributeType,
} from '../../services/productService';

const extractErrorMessage = (err, fallback) => {
  const msg = err?.data?.message;
  const errors = err?.data?.errors;
  if (Array.isArray(errors) && errors.length) {
    return `${msg ? msg + ': ' : ''}${errors.join(', ')}`;
  }
  return msg || fallback;
};

const TABS = [
  { key: 'locations', label: 'Vị trí' },
  { key: 'attributeTypes', label: 'Thuộc tính' },
];

const PLACEHOLDERS = {
  locations: 'Nhập tên vị trí mới...',
  attributeTypes: 'Nhập tên thuộc tính mới...',
};

const EMPTY_MESSAGES = {
  locations: 'Chưa có vị trí nào.',
  attributeTypes: 'Chưa có loại thuộc tính nào.',
};

export const LocationAttributeModal = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('locations');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [newNameInput, setNewNameInput] = useState('');
  const [editCode, setEditCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'locations') {
        const res = await getProductLocations();
        data =
          res?.success && Array.isArray(res?.data)
            ? res.data.map((loc) => ({
                id: loc.locationId,
                name: loc.locationName,
                code: loc.locationCode,
              }))
            : [];
      } else if (activeTab === 'attributeTypes') {
        const res = await getAttributeTypes();
        data = res?.success && Array.isArray(res?.data) ? res.data : [];
      }
      setItems(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeTab]);

  const handleCreate = async () => {
    const trimmed = (createName || '').trim();
    if (!trimmed) return;
    try {
      let res;
      if (activeTab === 'locations') {
        res = await createProductLocation(trimmed);
      } else if (activeTab === 'attributeTypes') {
        res = await createAttributeType(trimmed, createCode);
      }
      if (res?.success) {
        alert(res?.message || 'Tạo mới thành công');
        setCreateName('');
        setCreateCode('');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(extractErrorMessage(err, 'Lỗi tạo mới'));
    }
  };

  const handleSaveEdit = async (item) => {
    if (activeTab === 'attributeTypes') {
      const name = (newNameInput || '').trim();
      if (!name) {
        setEditingName('');
        return;
      }
      try {
        const res = await updateAttributeType(item.typeId, {
          typeName: name,
          typeCode: editCode,
        });
        if (res?.success) {
          alert(res?.message || 'Cập nhật thành công');
          setEditingName('');
          loadData();
          onSuccess?.();
        }
      } catch (err) {
        alert(extractErrorMessage(err, 'Lỗi cập nhật'));
      }
    } else {
      const trimmed = (newNameInput || '').trim();
      if (!trimmed || trimmed === item.name) {
        setEditingName('');
        return;
      }
      try {
        const res = await renameProductLocation(item.id, trimmed);
        if (res?.success) {
          alert(res?.message || 'Đổi tên thành công');
          setEditingName('');
          loadData();
          onSuccess?.();
        }
      } catch (err) {
        alert(extractErrorMessage(err, 'Lỗi đổi tên'));
      }
    }
  };

  const handleDelete = async (item) => {
    let label, name;
    if (activeTab === 'locations') {
      label = 'vị trí';
      name = item.name;
    } else {
      label = 'loại thuộc tính';
      name = item.typeName;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${label} "${name}"?`)) return;

    try {
      let res;
      if (activeTab === 'locations') {
        res = await deleteProductLocation(item.id);
      } else {
        res = await deleteAttributeType(item.typeId);
      }
      if (res?.success) {
        alert(res?.message || 'Xóa thành công');
        loadData();
        onSuccess?.();
      }
    } catch (err) {
      alert(extractErrorMessage(err, 'Lỗi khi xóa'));
    }
  };

  const startEdit = (item) => {
    if (activeTab === 'attributeTypes') {
      setEditingName(item.typeId);
      setNewNameInput(item.typeName);
      setEditCode(item.typeCode || '');
    } else {
      setEditingName(item.name);
      setNewNameInput(item.name);
    }
  };

  const cancelEdit = () => {
    setEditingName('');
    setNewNameInput('');
    setEditCode('');
  };

  const getColumns = () => {
    const actionsCol = {
      key: 'actions',
      header: <div className="text-right">Thao tác</div>,
      width: '100px',
      render: (_, item) => {
        const isEditing =
          activeTab === 'attributeTypes' ? editingName === item.typeId : editingName === item.name;
        if (isEditing) return null;
        return (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
              title={activeTab === 'attributeTypes' ? 'Sửa' : 'Đổi tên'}
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Xóa"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        );
      },
    };

    if (activeTab === 'attributeTypes') {
      return [
        {
          key: 'typeName',
          header: 'Tên thuộc tính',
          render: (_, item) => {
            const isEditing = editingName === item.typeId;
            if (!isEditing) {
              return <span className="font-medium text-slate-800">{item.typeName}</span>;
            }
            return (
              <div className="flex flex-col gap-2 py-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  className="!w-full max-w-[220px]"
                  autoFocus
                  placeholder="Tên thuộc tính"
                />
                <Input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="!w-full max-w-[220px]"
                  placeholder="Mã thuộc tính (tùy chọn)"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item)}
                    className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            );
          },
        },
        {
          key: 'typeCode',
          header: 'Mã thuộc tính',
          render: (_, item) => (
            <span className={item.typeCode ? 'text-sm text-slate-600' : 'text-sm text-slate-400'}>
              {item.typeCode || '---'}
            </span>
          ),
        },
        actionsCol,
      ];
    }

    // Locations: name + code + actions
    return [
      {
        key: 'name',
        header: 'Tên vị trí',
        render: (name, item) => {
          const isEditing = editingName === item.name;
          if (!isEditing) {
            return <span className="font-medium text-slate-800">{name}</span>;
          }
          return (
            <div
              className="flex flex-wrap items-center gap-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="!w-full max-w-[220px]"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSaveEdit(item)}
                  className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          );
        },
      },
      {
        key: 'code',
        header: 'Mã vị trí',
        render: (_, item) => (
          <span className={item.code ? 'text-sm text-slate-600' : 'text-sm text-slate-400'}>
            {item.code || '---'}
          </span>
        ),
      },
      actionsCol,
    ];
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Quản lý Vị trí & Thuộc tính"
      size="2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="-mt-2 mb-5 flex gap-6 border-b border-slate-200 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              cancelEdit();
              setCreateName('');
              setCreateCode('');
            }}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              activeTab === tab.key ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-md bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            placeholder={PLACEHOLDERS[activeTab]}
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          {activeTab === 'attributeTypes' && (
            <input
              className="w-[160px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
              placeholder="Mã thuộc tính"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          )}
        </div>
        <Button variant="primary" onClick={handleCreate}>
          Thêm mới
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table
          columns={getColumns()}
          data={items}
          loading={loading}
          emptyMessage={EMPTY_MESSAGES[activeTab]}
        />
      </div>
    </Modal>
  );
};

export default LocationAttributeModal;
