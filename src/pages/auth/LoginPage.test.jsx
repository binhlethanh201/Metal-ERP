import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { loginRequest } from '../../services/authService';
import { useAuth } from '../../shared/hooks/useAuth';

// 1. Mock module điều hướng router
const mockNavigate = jest.fn();
jest.mock('../../shared/router', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

// 2. Mock các dịch vụ API và Hook bảo mật của dự án
jest.mock('../../services/authService', () => ({
  loginRequest: jest.fn(),
}));

jest.mock('../../shared/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('PHÂN HỆ: ĐĂNG NHẬP HỆ THỐNG (LoginPage)', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Đảm bảo hook useAuth luôn trả về hàm login giả lập trước mỗi test case
    useAuth.mockReturnValue({ login: mockLogin });
  });

  // Giao diện (GUI Testing)
  it('Hiển thị form đăng nhập trực quan và đầy đủ các thành phần giao diện chính', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /chào mừng trở lại\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  // Tiêu chí CL-04 & CL-06 trong Báo cáo Capstone
  it('Kiểm tra validate bắt buộc - Báo lỗi khi để trống hoặc nhập toàn khoảng trắng', async () => {
    render(<LoginPage />);

    const phoneInput = screen.getByLabelText(/số điện thoại/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    // Giả lập gõ khoảng trắng
    await userEvent.type(phoneInput, '   ');
    await userEvent.type(passwordInput, '   ');
    await userEvent.click(submitButton);

    // Xác nhận thông báo lỗi hiển thị đúng vị trí
    expect(await screen.findByText(/vui lòng nhập email/i)).toBeInTheDocument();
    expect(await screen.findByText(/mật khẩu không được để trống/i)).toBeInTheDocument();
  });

  // Tiêu chí CL-03 trong Báo cáo Capstone
  it('Kiểm tra xử lý ngoại lệ - Hiển thị thông báo cảnh báo lỗi trực quan từ Server trả về', async () => {
    // Giả lập Server từ chối liên kết đăng nhập do sai mật khẩu
    loginRequest.mockRejectedValueOnce({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/số điện thoại/i), '0987654321');
    await userEvent.type(
      screen.getByLabelText(/mật khẩu/i, { selector: 'input' }),
      'wrongpassword'
    );
    await userEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    // Form phải render thông báo lỗi màu đỏ dạng alert tổng quan
    expect(
      await screen.findByText(/tài khoản hoặc mật khẩu không chính xác\./i)
    ).toBeInTheDocument();
  });

  // Tiêu chí CL-09 trong Báo cáo Capstone
  it('Kiểm tra Happy Path - Đăng nhập thành công, lưu trữ JWT Token và điều hướng chính xác', async () => {
    const mockUser = { role: 'admin', name: 'Quản trị viên hệ thống' };
    loginRequest.mockResolvedValueOnce({ user: mockUser, token: 'mock-valid-jwt-token' });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/số điện thoại/i), '0912345678');
    await userEvent.type(
      screen.getByLabelText(/mật khẩu/i, { selector: 'input' }),
      'vaildpassword123'
    );
    await userEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
      // Xác nhận hàm login của Custom Hook đã được gọi để nạp Token vào LocalStorage
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'mock-valid-jwt-token');
      // Xác nhận hệ thống tự động đẩy Admin vào đúng phân hệ quản trị
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });
});
