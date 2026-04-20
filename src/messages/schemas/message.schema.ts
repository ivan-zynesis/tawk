import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ collection: 'messages', timestamps: false })
export class Message {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true })
  conversationId!: string;

  @Prop({ required: true })
  senderId!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: true })
  timestamp!: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ tenantId: 1, conversationId: 1, timestamp: 1 });
