/**
 * 6 Modal con dùng trong EditProductModal: CreateGroup, CreateBrand, CreateLocation,
 * CreateAttribute, EditAttribute, AddConversionUnit. Mỗi modal là 1 component riêng.
 */
import Icon from '../../../../../shared/components/Icon';

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/40">
    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
      {children}
    </div>
  </div>
);

const ModalFooter = ({ onCancel, onSave, saveLabel = 'Lưu', extraLeft }) => (
  <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
    <div>{extraLeft}</div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium"
      >
        Bỏ qua
      </button>
      <button
        type="button"
        onClick={onSave}
        className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white"
      >
        {saveLabel}
      </button>
    </div>
  </div>
);

export const CreateGroupModal = ({
  open,
  groups,
  newGroupName,
  setNewGroupName,
  newGroupParent,
  setNewGroupParent,
  onClose,
  onSave,
}) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo nhóm hàng</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="mb-2 block text-sm text-gray-700">Tên nhóm</label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder=""
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-700">Nhóm cha</label>
          <select
            value={newGroupParent}
            onChange={(e) => setNewGroupParent(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Chọn nhóm hàng</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Lưu" />
    </ModalWrapper>
  );
};

export const CreateBrandModal = ({ open, newBrandName, setNewBrandName, onClose, onSave }) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo thương hiệu</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Tên thương hiệu</label>
        <input
          type="text"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Lưu" />
    </ModalWrapper>
  );
};

export const CreateLocationModal = ({
  open,
  newLocationName,
  setNewLocationName,
  onClose,
  onSave,
}) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo vị trí</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Vị trí</label>
        <input
          type="text"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          autoFocus
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Lưu" />
    </ModalWrapper>
  );
};

export const CreateAttributeModal = ({ open, newAttrName, setNewAttrName, onClose, onSave }) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Tạo thuộc tính</h3>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
        <input
          type="text"
          value={newAttrName}
          onChange={(e) => setNewAttrName(e.target.value)}
          placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
        />
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Xong" />
    </ModalWrapper>
  );
};

export const EditAttributeModal = ({
  open,
  editAttrValue,
  setEditAttrValue,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!open) return null;
  return (
    <ModalWrapper>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Sửa thuộc tính</h3>
      </div>
      <div className="p-6">
        <label className="mb-2 block text-sm text-gray-700">Tên thuộc tính</label>
        <input
          type="text"
          value={editAttrValue}
          onChange={(e) => setEditAttrValue(e.target.value)}
          placeholder="Ví dụ: Hương vị, Dung tích, Màu sắc"
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:outline-none"
        />
      </div>
      <ModalFooter
        onCancel={onClose}
        onSave={onSave}
        saveLabel="Xong"
        extraLeft={
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 items-center gap-2 rounded-md border border-transparent bg-white px-3 text-sm font-medium text-gray-700 hover:bg-red-50"
          >
            <Icon name="delete" />
            <span className="text-sm">Xóa</span>
          </button>
        }
      />
    </ModalWrapper>
  );
};

export const AddConversionUnitModal = ({
  open,
  newConversionUnit,
  setNewConversionUnit,
  form,
  formatMoney,
  onClose,
  onSave,
}) => {
  if (!open) return null;
  const base = Number(form.baseUnit?.price) || 0;
  const cv = Number(newConversionUnit.convertValue) || 0;
  const from = newConversionUnit.convertFrom;
  const unitsByName = (form.conversionUnits || []).reduce((acc, u) => {
    acc[u.name] = u;
    return acc;
  }, {});
  const computeMultiplierPreview = (fromName, visited = new Set()) => {
    if (!fromName || visited.has(fromName)) return null;
    if (!form.baseUnit?.name || fromName === form.baseUnit.name) return 1;
    const u = unitsByName[fromName];
    if (!u) return null;
    visited.add(fromName);
    if (u.convertFrom === form.baseUnit.name) return u.convertValue;
    const pm = computeMultiplierPreview(u.convertFrom, visited);
    return pm == null ? null : u.convertValue * pm;
  };
  const previewMultiplier = from
    ? from === form.baseUnit?.name
      ? cv
      : (() => {
          const pm = computeMultiplierPreview(from);
          return pm == null ? null : cv * pm;
        })()
    : null;
  const previewPrice = previewMultiplier && base ? base * previewMultiplier : 0;

  return (
    <ModalWrapper>
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold">Thêm đơn vị quy đổi</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name="close" />
        </button>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <label className="mb-2 block text-sm text-gray-700">Tên đơn vị</label>
          <input
            type="text"
            value={newConversionUnit.name}
            onChange={(e) => setNewConversionUnit({ ...newConversionUnit, name: e.target.value })}
            placeholder="Ví dụ: lốc, thùng"
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm font-medium text-blue-900">Công thức quy đổi:</div>
          <div className="mt-2 text-base">
            <span className="font-semibold">1 {newConversionUnit.name || '[tên đơn vị]'}</span>
            <span className="mx-2">=</span>
            <span className="font-semibold">{newConversionUnit.convertValue || '?'}</span>
            <span className="ml-2">{newConversionUnit.convertFrom || '[đơn vị gốc]'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-gray-700">Giá trị quy đổi</label>
            <input
              type="number"
              value={newConversionUnit.convertValue}
              onChange={(e) =>
                setNewConversionUnit({ ...newConversionUnit, convertValue: e.target.value })
              }
              placeholder="Ví dụ: 4, 20"
              min="1"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-700">Đơn vị quy đổi từ</label>
            <select
              value={newConversionUnit.convertFrom}
              onChange={(e) =>
                setNewConversionUnit({ ...newConversionUnit, convertFrom: e.target.value })
              }
              className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Chọn đơn vị</option>
              {form.baseUnit?.name && (
                <option value={form.baseUnit.name}>{form.baseUnit.name}</option>
              )}
              {(form.conversionUnits || []).map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-700">Giá bán (tự tính)</label>
          <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-right text-sm text-gray-700">
            {previewPrice ? formatMoney(previewPrice) : '-'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="direct-sell-conv"
            checked={newConversionUnit.directSale}
            onChange={(e) =>
              setNewConversionUnit({ ...newConversionUnit, directSale: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-[#1E6BB8]"
          />
          <label htmlFor="direct-sell-conv" className="text-sm text-gray-700">
            Cho phép bán đơn vị này
          </label>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={onSave} saveLabel="Thêm" />
    </ModalWrapper>
  );
};
