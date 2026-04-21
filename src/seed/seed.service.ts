import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserTenant,
  UserTenantDocument,
} from '../auth/schemas/user-tenant.schema.js';
import {
  Conversation,
  ConversationDocument,
} from '../conversations/schemas/conversation.schema.js';

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
  conversations: [
    { id: 'conv-alpha-general', tenantId: 'tenant-alpha', name: '#general' },
    {
      id: 'conv-alpha-engineering',
      tenantId: 'tenant-alpha',
      name: '#engineering',
    },
    { id: 'conv-beta-general', tenantId: 'tenant-beta', name: '#general' },
    { id: 'conv-beta-random', tenantId: 'tenant-beta', name: '#random' },
  ],
} as const;

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(UserTenant.name)
    private readonly userTenantModel: Model<UserTenantDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async onModuleInit() {
    for (const user of SEED_DATA.users) {
      await this.userTenantModel.updateOne(
        { userId: user.userId },
        { $setOnInsert: { userId: user.userId, tenantId: user.tenantId } },
        { upsert: true },
      );
    }

    for (const conv of SEED_DATA.conversations) {
      await this.conversationModel.updateOne(
        { id: conv.id },
        {
          $setOnInsert: {
            id: conv.id,
            tenantId: conv.tenantId,
            name: conv.name,
          },
        },
        { upsert: true },
      );
    }

    this.logger.log(
      `Seeded ${SEED_DATA.users.length} user-tenant mappings and ${SEED_DATA.conversations.length} conversations`,
    );
  }
}
