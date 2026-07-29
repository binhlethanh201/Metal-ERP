import { hasPermission, hasAnyPermission, hasRoleOrPermission } from './permissions';

describe('inventory permission helpers', () => {
  it('matches permission codes case-insensitively from string arrays', () => {
    const user = { permissions: ['STOCK_CHECK_APPROVE'] };

    expect(hasPermission(user, 'stock_check_approve')).toBe(true);
    expect(hasPermission(user, 'STOCK_CHECK_CREATE')).toBe(false);
  });

  it('supports permission objects and multiple permission checks', () => {
    const user = { permissionCodes: [{ permissionCode: 'STOCK_CHECK_CREATE' }] };

    expect(hasPermission(user, 'STOCK_CHECK_CREATE')).toBe(true);
    expect(hasAnyPermission(user, ['STOCK_CHECK_APPROVE', 'STOCK_CHECK_CANCEL'])).toBe(false);
  });

  it('grants all stock check actions for owner users', () => {
    const owner = { roles: ['Owner'] };

    expect(hasRoleOrPermission(owner, 'STOCK_CHECK_CREATE')).toBe(true);
    expect(hasRoleOrPermission(owner, 'STOCK_CHECK_APPROVE')).toBe(true);
    expect(hasRoleOrPermission(owner, 'STOCK_CHECK_CANCEL')).toBe(true);
  });
});
