import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTenant, UserTenantDocument } from './schemas/user-tenant.schema.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserTenant.name)
    private readonly userTenantModel: Model<UserTenantDocument>,
  ) {}

  async findTenantByUserId(userId: string): Promise<string | null> {
    const mapping = await this.userTenantModel.findOne({ userId }).lean();
    return mapping?.tenantId ?? null;
  }
}
