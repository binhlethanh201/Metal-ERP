import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Icon from '../../shared/components/Icon';
import Button from '../../shared/components/Button';
import { useAuth } from '../../shared/hooks/useAuth';

const AccountSettingsLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex flex-1 justify-start">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <Icon name="chevron_left" size={16} />
            <span>Quay lại</span>
          </Button>
        </div>

        <div className="flex flex-1 justify-center">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Quản lý tài khoản
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <Button
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 !border-red-600 !bg-red-600 text-white hover:!bg-red-700"
          >
            <Icon name="logout" size={16} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountSettingsLayout;
