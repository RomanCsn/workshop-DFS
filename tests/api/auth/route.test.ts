import { describe, expect, it, vi } from 'vitest';

describe('Auth API route', () => {
  it('re-exports handlers from better-auth adapter', async () => {
    vi.resetModules();

    const mockHandlers = { GET: vi.fn(), POST: vi.fn() } as const;
    const mockAuthHandler = { name: 'auth-handler' };

    vi.doMock('better-auth/next-js', () => ({
      toNextJsHandler: vi.fn(() => mockHandlers),
    }));

    vi.doMock('@/lib/auth', () => ({
      auth: { handler: mockAuthHandler },
    }));

    const route = await import('@/app/api/auth/[...all]/route');
    const { toNextJsHandler } = await import('better-auth/next-js');

    expect(toNextJsHandler).toHaveBeenCalledWith(mockAuthHandler);
    expect(route.GET).toBe(mockHandlers.GET);
    expect(route.POST).toBe(mockHandlers.POST);
  });
});
