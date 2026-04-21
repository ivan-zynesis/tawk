import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema.js';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findByTenant(tenantId: string): Promise<Conversation[]> {
    return this.conversationModel.find({ tenantId }).lean();
  }

  async findByIdAndTenant(
    id: string,
    tenantId: string,
  ): Promise<Conversation | null> {
    return this.conversationModel.findOne({ id, tenantId }).lean();
  }
}
