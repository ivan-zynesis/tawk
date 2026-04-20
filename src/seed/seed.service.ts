import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTenant, UserTenantDocument } from '../auth/schemas/user-tenant.schema.js';

export const SEED_DATA = {
  tenants: [
    { tenantId: 'tenant-alpha', name: 'Alpha Corp' },
    { tenantId: 'tenant-beta', name: 'Beta Inc' },
  ],
  users: [
    { userId: 'user-alice', tenantId: 'tenant-alpha' },
    { userId: 'user-bob', tenantId: 'tenant-alpha' },
    { userId: 'user-charlie', tenantId: 'tenant-beta' },
  ],
} as const;

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(UserTenant.name)
    private readonly userTenantModel: Model<UserTenantDocument>,
  ) {}

  async onModuleInit() {
    for (const user of SEED_DATA.users) {
      await this.userTenantModel.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, tenantId: user.tenantId } },
        { upsert: true },
      );
    }
    this.logger.log(`Seeded ${SEED_DATA.users.length} user-tenant mappings`);
  }
}
