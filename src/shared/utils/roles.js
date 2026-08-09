/**
 * Chuẩn hóa danh sách role từ API.
 * Backend có thể trả về nhiều bản ghi trùng về mặt ngữ nghĩa
 * (vd: "Sale Staff", "SalesStaff", "SalesStaffs", "Inventory Staff", "InventoryStaffs"...).
 * Chỉ giữ lại 3 role gốc: Owner, Sale Staff, Inventory Staff.
 */

export const ASSIGNABLE_ROLES = [
  { key: 'Owner', roleName: 'Owner', label: 'Owner' },
  { key: 'SalesStaff', roleName: 'SalesStaff', label: 'Sale Staff' },
  { key: 'InventoryStaff', roleName: 'InventoryStaff', label: 'Inventory Staff' },
];

const normalizeRoleName = (name = '') => (name || '').replace(/[^a-zA-Z]/g, '').toLowerCase();

export { normalizeRoleName };

// role có thể là string ('SalesStaff') hoặc object ({ roleId, roleName }).
// Tài khoản do Owner tạo thường có roles là mảng string, Admin tạo là mảng object.
export const getRoleName = (role) => (typeof role === 'string' ? role : role?.roleName) || '';

export const getRoleId = (role) => (typeof role === 'object' && role ? role.roleId : undefined);

// Quy đổi bất kỳ tên role lộn xộn nào về khóa chuẩn (nếu khớp), ngược lại trả null.
export const canonicalizeRoleName = (roleName) => {
  const core = normalizeRoleName(roleName);
  if (core.includes('owner')) return 'Owner';
  if (core.includes('inventory')) return 'InventoryStaff';
  if (core.includes('sale')) return 'SalesStaff';
  return null;
};

// Lọc + gộp danh sách role từ API về đúng 3 role chuẩn.
// Giữ roleId của bản ghi có tên "chuẩn" nhất (không khoảng trắng, không số nhiều).
export const getAssignableRoles = (roles = []) =>
  ASSIGNABLE_ROLES.map((canonical) => {
    const candidates = roles.filter((r) => canonicalizeRoleName(r.roleName) === canonical.key);
    if (candidates.length === 0) return null;
    const exact =
      candidates.find((r) => normalizeRoleName(r.roleName) === canonical.key.toLowerCase()) ||
      candidates[0];
    return { ...exact, key: canonical.key, roleName: canonical.roleName, label: canonical.label };
  }).filter(Boolean);

// Nhãn hiển thị đẹp cho tên role (dùng cho badge), giữ nguyên nếu không phải role chuẩn.
export const getRoleLabel = (roleName) => {
  const canonical = canonicalizeRoleName(roleName);
  const found = canonical && ASSIGNABLE_ROLES.find((r) => r.key === canonical);
  return found ? found.label : roleName;
};