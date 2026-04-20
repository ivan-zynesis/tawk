import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration.js';
import { validationSchema } from './config/validation.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SeedModule } from './seed/seed.module.js';
import { MessagesModule } from './messages/messages.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),
    AuthModule,
    SeedModule,
    MessagesModule,
    HealthModule,
  ],
})
export class AppModule {}
