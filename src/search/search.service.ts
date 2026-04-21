import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

const INDEX_NAME = 'messages';

const INDEX_MAPPING = {
  properties: {
    id: { type: 'keyword' as const },
    tenantId: { type: 'keyword' as const },
    conversationId: { type: 'keyword' as const },
    senderId: { type: 'keyword' as const },
    body: { type: 'text' as const, analyzer: 'standard' },
    timestamp: { type: 'date' as const },
  },
};

export interface IndexedMessage {
  id: string;
  tenantId: string;
  conversationId: string;
  senderId: string;
  body: string;
  timestamp: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: Client;

  constructor(configService: ConfigService) {
    this.client = new Client({
      node: configService.get<string>(
        'elasticsearch.url',
        'http://localhost:9200',
      ),
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: INDEX_NAME });
    if (!exists) {
      await this.client.indices.create({
        index: INDEX_NAME,
        mappings: INDEX_MAPPING,
      });
      this.logger.log(`Created Elasticsearch index "${INDEX_NAME}"`);
    }
  }

  async indexMessage(message: IndexedMessage): Promise<void> {
    await this.client.index({
      index: INDEX_NAME,
      id: message.id,
      document: message,
    });
  }

  async search(
    tenantId: string,
    conversationId: string,
    query: string,
    limit: number = 20,
  ): Promise<IndexedMessage[]> {
    const result = await this.client.search<IndexedMessage>({
      index: INDEX_NAME,
      size: limit,
      query: {
        bool: {
          must: [{ match: { body: query } }],
          filter: [{ term: { tenantId } }, { term: { conversationId } }],
        },
      },
      sort: [{ timestamp: { order: 'desc' } }],
    });

    return result.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is IndexedMessage => source !== undefined);
  }
}
