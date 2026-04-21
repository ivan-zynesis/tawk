import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './jwt.strategy.js';
import { AuthGuard } from './auth.guard.js';
import { TenantGuard } from './tenant.guard.js';
import { AuthService } from './auth.service.js';
import { UserTenant, UserTenantSchema } from './schemas/user-tenant.schema.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret', 'dev-secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MongooseModule.forFeature([
      { name: UserTenant.name, schema: UserTenantSchema },
    ]),
  ],
  providers: [JwtStrategy, AuthGuard, TenantGuard, AuthService],
  exports: [AuthGuard, TenantGuard, AuthService, JwtModule],
})
export class AuthModule {}
