/**
 * Modal Thêm/Sửa sản phẩm - Bọc bằng Wrapper API để load full data trước khi map form.
 */
import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { useEditProductForm } from '../../hooks/useEditProductForm';
import { getProduct } from '../../services/inventoryService'; // Import API
import ProductInfoTab from './tabs/ProductInfoTab';
import ProductDescriptionTab from './tabs/ProductDescriptionTab';
import {
  CreateGroupModal,
  CreateBrandModal,
  CreateLocationModal,
  CreateAttributeModal,
  EditAttributeModal,
  AddConversionUnitModal,
} from './modals/EditProductModals';

// Nội dung Modal - Tách ra để đảm bảo Hook useEditProductForm nhận được data đầy đủ
const EditProductModalContent = ({ onClose, product, onSave, title, productList, initialTab }) => {
  const f = useEditProductForm({ product, onSave, onClose, productList, initialTab });

  return (
    <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white font-sans shadow-2xl sm:mx-6">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-6">
        <h1 className="text-[20px] font-bold leading-tight text-on-surface">
          {title || (product ? 'Sửa hàng hóa' : 'Thêm hàng hóa')}
        </h1>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <Icon name="close" className="text-slate-500" />
        </button>
      </header>

      <div className="flex h-12 border-b border-gray-200">
        {['info', 'description'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => f.setActiveTab(tab)}
            className={`flex h-12 items-center px-4 text-sm tracking-wider ${f.activeTab === tab ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
          >
            {tab === 'info' ? 'Thông tin' : 'Mô tả'}
          </button>
        ))}
      </div>

      <form onSubmit={f.handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <main className="custom-scroll flex-1 space-y-6 overflow-y-auto px-8 py-6 sm:px-6 sm:py-5">
          {f.activeTab === 'info' ? <ProductInfoTab f={f} /> : <ProductDescriptionTab f={f} />}
        </main>

        <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <input
              checked={!!f.form.directSale}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              id="footer-sell-direct"
              type="checkbox"
              onChange={(e) => f.handleChange('directSale', e.target.checked)}
            />
            <label
              className="flex cursor-pointer items-center text-sm font-semibold text-gray-700"
              htmlFor="footer-sell-direct"
            >
              Bán trực tiếp
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700"
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              className="h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              Lưu dữ liệu
            </button>
          </div>
        </footer>
      </form>

      {/* Các Modals con */}
      <CreateAttributeModal
        open={f.createAttrModalOpen}
        newAttrName={f.newAttrName}
        setNewAttrName={f.setNewAttrName}
        onClose={() => {
          f.setCreateAttrModalOpen(false);
          f.setEditingAttrId(null);
        }}
        onSave={() => {
          const name = (f.newAttrName || '').trim();
          if (name) {
            f.addAvailableAttribute(name);
            if (f.editingAttrId) f.updateAttr(f.editingAttrId, 'name', name);
          }
          f.setCreateAttrModalOpen(false);
          f.setEditingAttrId(null);
        }}
      />
      <EditAttributeModal
        open={f.editAttrModalOpen}
        editAttrValue={f.editAttrValue}
        setEditAttrValue={f.setEditAttrValue}
        onClose={() => {
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
        onSave={() => {
          const oldName = f.availableAttributes[f.editAttrIndex];
          const next = (f.availableAttributes || []).map((v, i) =>
            i === f.editAttrIndex ? f.editAttrValue || v : v
          );
          f.persistAvailableAttributes(next);
          f.setForm((c) => ({
            ...c,
            attributes: (c.attributes || []).map((a) =>
              a.name === oldName ? { ...a, name: f.editAttrValue || oldName } : a
            ),
          }));
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
        onDelete={() => {
          const oldName = f.availableAttributes[f.editAttrIndex];
          f.persistAvailableAttributes(
            (f.availableAttributes || []).filter((_, i) => i !== f.editAttrIndex)
          );
          f.setForm((c) => ({
            ...c,
            attributes: (c.attributes || []).map((a) =>
              a.name === oldName ? { ...a, name: '' } : a
            ),
          }));
          f.setEditAttrModalOpen(false);
          f.setEditAttrIndex(null);
        }}
      />
      <CreateGroupModal
        open={f.createGroupModalOpen}
        groups={f.groups}
        newGroupName={f.newGroupName}
        setNewGroupName={f.setNewGroupName}
        newGroupParent={f.newGroupParent}
        setNewGroupParent={f.setNewGroupParent}
        onClose={() => f.setCreateGroupModalOpen(false)}
        onSave={() => {
          const name = (f.newGroupName || '').trim();
          if (name) {
            f.persistGroups([...f.groups, name]);
            f.handleChange('group', name);
          }
          f.setCreateGroupModalOpen(false);
        }}
      />
      <CreateBrandModal
        open={f.createBrandModalOpen}
        newBrandName={f.newBrandName}
        setNewBrandName={f.setNewBrandName}
        onClose={() => f.setCreateBrandModalOpen(false)}
        onSave={() => {
          const name = (f.newBrandName || '').trim();
          if (name) {
            f.persistBrands([...f.brands, name]);
            f.handleChange('brand', name);
          }
          f.setCreateBrandModalOpen(false);
        }}
      />
      <CreateLocationModal
        open={f.createLocationModalOpen}
        newLocationName={f.newLocationName}
        setNewLocationName={f.setNewLocationName}
        onClose={() => f.setCreateLocationModalOpen(false)}
        onSave={() => {
          const name = (f.newLocationName || '').trim();
          if (name) {
            f.persistLocations([...f.locations, name]);
            f.addLocation(name);
          }
          f.setCreateLocationModalOpen(false);
        }}
      />
      <AddConversionUnitModal
        open={f.addConversionUnitModal}
        newConversionUnit={f.newConversionUnit}
        setNewConversionUnit={f.setNewConversionUnit}
        form={f.form}
        formatMoney={f.formatMoney}
        onClose={() => f.setAddConversionUnitModal(false)}
        onSave={f.addConversionUnitHandler}
      />
    </div>
  );
};

// Wrapper chính để lo việc Fetch Data API
const EditProductModal = (props) => {
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(!!props.product); // Nếu có truyền product (sửa) thì loading

  useEffect(() => {
    if (props.open && props.product) {
      setLoading(true);
      getProduct(props.product.productId || props.product.id)
        .then((res) => {
          if (res?.success && res?.data) {
            setFullProduct({ ...props.product, ...res.data });
          } else {
            setFullProduct(props.product);
          }
        })
        .catch(() => setFullProduct(props.product))
        .finally(() => setLoading(false));
    } else {
      setFullProduct(null); // Trường hợp Thêm mới
      setLoading(false);
    }
  }, [props.open, props.product]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      {loading ? (
        <div className="flex h-32 w-64 items-center justify-center rounded-xl bg-white shadow-xl">
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Icon name="sync" className="animate-spin text-3xl" />
            <span className="text-sm font-bold text-slate-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : (
        <EditProductModalContent {...props} product={fullProduct} />
      )}
    </div>
  );
};

export default EditProductModal;
