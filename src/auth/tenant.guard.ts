import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as { userId: string } | undefined;

    if (!user?.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const tenantId = await this.authService.findTenantByUserId(user.userId);
    if (!tenantId) {
      throw new ForbiddenException('User is not associated with any tenant');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request.tenantId = tenantId;
    return true;
  }
}
