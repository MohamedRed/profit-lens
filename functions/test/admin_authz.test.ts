import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDocGet = vi.fn();
const mockDb = {
  doc: vi.fn(() => ({
    get: mockDocGet,
  })),
};

const mockGetUser = vi.fn();

vi.mock('../src/firebase_admin', () => ({
  db: mockDb,
  getAuth: () => ({
    getUser: mockGetUser,
  }),
}));

describe('admin authz', () => {
  beforeEach(() => {
    vi.resetModules();
    mockDocGet.mockReset();
    mockGetUser.mockReset();

    mockDocGet.mockResolvedValue({
      data: () => ({ allowedEmails: ['admin@example.com'] }),
    });
  });

  it('rejects unauthenticated requests', async () => {
    const { assertAdminAccess } = await import('../src/admin/authz');
    await expect(assertAdminAccess({ auth: null })).rejects.toHaveProperty('code', 'unauthenticated');
  });

  it('rejects missing admin claim', async () => {
    const { assertAdminAccess } = await import('../src/admin/authz');
    await expect(
      assertAdminAccess({ auth: { uid: 'u1', token: { email: 'admin@example.com' } } }),
    ).rejects.toHaveProperty('code', 'permission-denied');
  });

  it('rejects users not in allowlist', async () => {
    const { assertAdminAccess } = await import('../src/admin/authz');
    await expect(
      assertAdminAccess({
        auth: { uid: 'u1', token: { admin: true, email: 'other@example.com' } },
      }),
    ).rejects.toHaveProperty('code', 'permission-denied');
  });

  it('allows admin claim and allowlisted email', async () => {
    const { assertAdminAccess } = await import('../src/admin/authz');
    const principal = await assertAdminAccess({
      auth: { uid: 'u1', token: { admin: true, email: 'admin@example.com' } },
    });

    expect(principal.uid).toBe('u1');
    expect(principal.normalizedEmail).toBe('admin@example.com');
  });

  it('falls back to Auth user email when token email is missing', async () => {
    const { assertAdminAccess } = await import('../src/admin/authz');
    mockGetUser.mockResolvedValue({ email: 'admin@example.com' });

    const principal = await assertAdminAccess({
      auth: { uid: 'u2', token: { admin: true } },
    });

    expect(principal.uid).toBe('u2');
    expect(mockGetUser).toHaveBeenCalledWith('u2');
  });
});
