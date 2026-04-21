import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service.js';
import { Message } from './schemas/message.schema.js';

const mockProducer = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
};

vi.mock('kafkajs', () => ({
  Kafka: function () {
    return { producer: () => mockProducer };
  },
}));

describe('MessagesService', () => {
  let service: MessagesService;

  const savedMessage = {
    id: 'test-ulid',
    tenantId: 'tenant-alpha',
    conversationId: 'conv-1',
    senderId: 'user-alice',
    body: 'Hello world',
    timestamp: '2026-04-21T00:00:00.000Z',
    toObject: function () {
      const { ...rest } = this;
      return rest;
    },
    save: vi.fn(),
  };

  savedMessage.save.mockResolvedValue(savedMessage);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockModel = function () {
    return savedMessage;
  } as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  mockModel.find = vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            id: 'msg-1',
            tenantId: 'tenant-alpha',
            conversationId: 'conv-1',
            senderId: 'user-alice',
            body: 'Hello',
            timestamp: '2026-04-21T00:00:00.000Z',
          },
        ]),
      }),
    }),
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    savedMessage.save.mockResolvedValue(savedMessage);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { provide: getModelToken(Message.name), useValue: mockModel },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue(['localhost:9092']),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('create', () => {
    it('should save message to MongoDB and publish to Kafka', async () => {
      const dto = {
        conversationId: 'conv-1',
        senderId: 'user-alice',
        body: 'Hello world',
      };

      const result = await service.create('tenant-alpha', dto);

      expect(savedMessage.save).toHaveBeenCalled();
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'message-created',
        messages: [
          expect.objectContaining({
            key: 'conv-1',
          }),
        ],
      });
      expect(result).toHaveProperty('tenantId', 'tenant-alpha');
    });

    it('should still return success if Kafka publish fails (DEC-002)', async () => {
      mockProducer.send.mockRejectedValueOnce(new Error('Kafka down'));

      const dto = {
        conversationId: 'conv-1',
        senderId: 'user-alice',
        body: 'Hello',
      };

      const result = await service.create('tenant-alpha', dto);

      expect(result).toHaveProperty('tenantId', 'tenant-alpha');
    });
  });

  describe('findByConversation', () => {
    it('should return messages with pagination info', async () => {
      const result = await service.findByConversation(
        'tenant-alpha',
        'conv-1',
        20,
      );

      expect(result.messages).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant-alpha',
        conversationId: 'conv-1',
      });
    });

    it('should apply cursor filter when provided', async () => {
      await service.findByConversation(
        'tenant-alpha',
        'conv-1',
        20,
        '2026-04-20T00:00:00.000Z',
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant-alpha',
        conversationId: 'conv-1',
        timestamp: { $lt: '2026-04-20T00:00:00.000Z' },
      });
    });
  });
});
