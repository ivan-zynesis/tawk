import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service.js';
import { UserTenant } from './schemas/user-tenant.schema.js';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserTenantModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(UserTenant.name),
          useValue: mockUserTenantModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('findTenantByUserId', () => {
    it('should return tenantId when user-tenant mapping exists', async () => {
      mockUserTenantModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: 'user-alice',
          tenantId: 'tenant-alpha',
        }),
      });

      const result = await service.findTenantByUserId('user-alice');

      expect(result).toBe('tenant-alpha');
      expect(mockUserTenantModel.findOne).toHaveBeenCalledWith({
        userId: 'user-alice',
      });
    });

    it('should return null when no mapping exists', async () => {
      mockUserTenantModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findTenantByUserId('unknown-user');

      expect(result).toBeNull();
    });
  });
});
