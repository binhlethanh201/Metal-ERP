/**
 * MobileFooter - Thanh điều hướng dưới cùng cho mobile trong form đăng bài.
 * 3 nút: Trang chủ, Tin nhắn, Cá nhân. Hiển thị trên màn hình < md.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const MobileFooter = () => (
  <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-white px-4 md:hidden">
    <button type="button" className="flex flex-col items-center gap-1 text-primary">
      <MaterialIcon name="home" className="text-[20px]" fill />
      <span className="text-[10px] font-bold">Trang chủ</span>
    </button>
    <button type="button" className="flex flex-col items-center gap-1 text-slate-500">
      <MaterialIcon name="forum" className="text-[20px]" />
      <span className="text-[10px]">Tin nhắn</span>
    </button>
    <button type="button" className="flex flex-col items-center gap-1 text-slate-500">
      <MaterialIcon name="person" className="text-[20px]" />
      <span className="text-[10px]">Cá nhân</span>
    </button>
  </footer>
);

export default MobileFooter;
