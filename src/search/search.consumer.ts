import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { SearchService, IndexedMessage } from './search.service.js';

@Injectable()
export class SearchConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    private readonly searchService: SearchService,
    configService: ConfigService,
  ) {
    const kafka = new Kafka({
      clientId: 'tawk-search-consumer',
      brokers: configService.get<string[]>('kafka.brokers', ['localhost:9092']),
    });
    this.consumer = kafka.consumer({ groupId: 'search-indexer' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'message-created',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ message: kafkaMessage }) => {
        try {
          const value = kafkaMessage.value?.toString();
          if (!value) return;

          const parsed = JSON.parse(value) as IndexedMessage;
          await this.searchService.indexMessage(parsed);
          this.logger.debug(`Indexed message ${parsed.id}`);
        } catch (error) {
          this.logger.error('Failed to index message', error);
        }
      },
    });

    this.logger.log('Kafka consumer subscribed to message-created');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
