/**
 * Hub Overlay - Menu vòng tròn radial dùng chung cho Dashboard & ProductManagement.
 * Hiển thị danh sách action xung quanh nút trung tâm, hỗ trợ chọn action hoặc đóng.
 */
import Icon from '../../../../shared/components/Icon';

const getHubPosition = (index, total) => {
  const radius = 220;
  const angle = -90 + index * (360 / total);
  const rad = (angle * Math.PI) / 180;
  return { x: Math.round(Math.cos(rad) * radius), y: Math.round(Math.sin(rad) * radius) };
};

const HubOverlay = ({ isOpen, config, onClose, onSelect }) => {
  if (!config) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 backdrop-blur-md transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`}
    >
      <button type="button" aria-label="Đóng hub" className="absolute inset-0" onClick={onClose} />

      <div className="relative z-20 flex flex-col items-center">
        <button
          type="button"
          className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-white/20 bg-primary text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
          onClick={onClose}
        >
          <Icon name={config.centerIcon} className="text-4xl" />
          <span className="mt-1 text-[12px] font-bold uppercase tracking-tight">
            {config.centerLabel}
          </span>
        </button>

        {config.actions.map((action, index) => {
          const pos = getHubPosition(index, config.actions.length);
          return (
            <div
              key={action.id}
              className="absolute left-1/2 top-1/2 transition-all duration-500"
              style={{
                transform: isOpen
                  ? `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`
                  : 'translate(-50%, -50%) scale(0.2)',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect?.(action)}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/10 bg-white text-primary shadow-xl transition-all hover:scale-110 hover:bg-primary hover:text-white"
                >
                  <Icon name={action.icon} className="text-2xl" />
                </button>
                <div className="whitespace-nowrap rounded bg-white/90 px-3 py-1 text-[11px] font-bold uppercase text-primary shadow-sm backdrop-blur">
                  {action.label}
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-pulse text-xs font-medium uppercase tracking-[0.2em] text-white/70"
          onClick={onClose}
        >
          Nhấn vào vùng trống để quay lại
        </button>
      </div>
    </div>
  );
};

export default HubOverlay;
