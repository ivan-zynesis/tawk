import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { ulid } from 'ulid';
import { Message, MessageDocument } from './schemas/message.schema.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private producer: Producer;

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly configService: ConfigService,
  ) {
    const kafka = new Kafka({
      clientId: 'tawk-api',
      brokers: this.configService.get<string[]>('kafka.brokers', [
        'localhost:9092',
      ]),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async create(tenantId: string, dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      id: ulid(),
      tenantId,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      body: dto.body,
      timestamp: new Date().toISOString(),
    });

    const saved = await message.save();

    // Best-effort Kafka publish (DEC-002)
    try {
      await this.producer.send({
        topic: 'message-created',
        messages: [
          {
            key: dto.conversationId, // Partition by conversationId (DEC-004)
            value: JSON.stringify(saved.toObject()),
          },
        ],
      });
    } catch (error) {
      this.logger.error('Failed to publish message to Kafka', error);
    }

    return saved.toObject();
  }

  async findByConversation(
    tenantId: string,
    conversationId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ messages: Message[]; nextCursor: string | null }> {
    const query: Record<string, unknown> = { tenantId, conversationId };

    if (cursor) {
      query['timestamp'] = { $lt: cursor };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore
      ? (results[results.length - 1]?.timestamp ?? null)
      : null;

    return { messages: results, nextCursor };
  }
}
