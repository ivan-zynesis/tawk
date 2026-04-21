import { type Mock } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard.js';
import { AuthService } from './auth.service.js';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let authService: AuthService;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    authService = {
      findTenantByUserId: vi.fn(),
    } as any;
    guard = new TenantGuard(authService);
  });

  function createMockContext(user?: { userId: string }): ExecutionContext {
    const request = { user, tenantId: undefined as string | undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should attach tenantId to request when user has a tenant mapping', async () => {
    (authService.findTenantByUserId as Mock).mockResolvedValue('tenant-alpha');
    const ctx = createMockContext({ userId: 'user-alice' });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(request.tenantId).toBe('tenant-alpha');
  });

  it('should throw ForbiddenException when user is not authenticated', async () => {
    const ctx = createMockContext(undefined);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no tenant mapping', async () => {
    (authService.findTenantByUserId as Mock).mockResolvedValue(null);
    const ctx = createMockContext({ userId: 'orphan-user' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
