import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserTenantDocument = HydratedDocument<UserTenant>;

@Schema({ collection: 'user_tenants' })
export class UserTenant {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  tenantId!: string;
}

export const UserTenantSchema = SchemaFactory.createForClass(UserTenant);
UserTenantSchema.index({ userId: 1 }, { unique: true });
