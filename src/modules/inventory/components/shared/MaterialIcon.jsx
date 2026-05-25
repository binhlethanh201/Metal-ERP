/**
 * Icon Google Material Symbols - Bản local cho module inventory.
 * Props: name (tên icon), className, fill (boolean), opsz (optical size, mặc định 20), wght (weight, mặc định 400).
 */
const MaterialIcon = ({ name, className = '', fill = false, opsz = 20, wght = 400 }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${wght}, 'GRAD' 0, 'opsz' ${opsz}`,
    }}
  >
    {name}
  </span>
);

export default MaterialIcon;
