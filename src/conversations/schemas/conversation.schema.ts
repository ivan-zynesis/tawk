import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ collection: 'conversations' })
export class Conversation {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true })
  name!: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
