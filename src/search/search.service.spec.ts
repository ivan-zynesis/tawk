import { SearchService } from './search.service.js';
import { ConfigService } from '@nestjs/config';

vi.mock('@elastic/elasticsearch', () => ({
  Client: function () {
    return {
      indices: {
        exists: vi.fn().mockResolvedValue(true),
        create: vi.fn(),
      },
      index: vi.fn().mockResolvedValue({}),
      search: vi.fn().mockResolvedValue({
        hits: {
          hits: [
            {
              _source: {
                id: 'msg-1',
                tenantId: 'tenant-alpha',
                conversationId: 'conv-1',
                senderId: 'user-alice',
                body: 'Hello world',
                timestamp: '2026-04-21T00:00:00.000Z',
              },
            },
          ],
        },
      }),
    };
  },
}));

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    const configService = {
      get: vi.fn().mockReturnValue('http://localhost:9200'),
    } as unknown as ConfigService;
    service = new SearchService(configService);
  });

  describe('indexMessage', () => {
    it('should index a message into Elasticsearch', async () => {
      await expect(
        service.indexMessage({
          id: 'msg-1',
          tenantId: 'tenant-alpha',
          conversationId: 'conv-1',
          senderId: 'user-alice',
          body: 'Hello',
          timestamp: '2026-04-21T00:00:00.000Z',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    it('should return matching messages filtered by tenant and conversation', async () => {
      const results = await service.search(
        'tenant-alpha',
        'conv-1',
        'Hello',
        20,
      );

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('msg-1');
      expect(results[0]?.tenantId).toBe('tenant-alpha');
    });
  });
});
