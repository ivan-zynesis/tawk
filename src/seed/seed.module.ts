import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserTenant, UserTenantSchema } from '../auth/schemas/user-tenant.schema.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTenant.name, schema: UserTenantSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
