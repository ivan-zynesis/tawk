import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserTenant,
  UserTenantSchema,
} from '../auth/schemas/user-tenant.schema.js';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTenant.name, schema: UserTenantSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
