import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../auth/tenant.guard.js';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator.js';
import { ConversationsService } from './conversations.service.js';

@Controller('conversations')
@UseGuards(AuthGuard, TenantGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.conversationsService.findByTenant(tenantId);
  }
}
