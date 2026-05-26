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
