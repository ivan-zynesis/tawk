import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Kafka } from 'kafkajs';
import { MongoDBContainer } from '@testcontainers/mongodb';
import { KafkaContainer } from '@testcontainers/kafka';
import { ElasticsearchContainer } from '@testcontainers/elasticsearch';
import { AppModule } from '../../../src/app.module.js';
import { JWT_SECRET, signTestToken } from './jwt.helper.js';

export interface TestContext {
  app: INestApplication;
  jwtService: JwtService;
  mongoUri: string;
  kafkaBroker: string;
  esUrl: string;
  signToken: (userId: string) => string;
  teardown: () => Promise<void>;
}

export class TestSetup {
  static async create(): Promise<TestContext> {
    // Start all containers in parallel
    const [mongo, kafka, es] = await Promise.all([
      new MongoDBContainer('mongo:7').start(),
      new KafkaContainer('confluentinc/cp-kafka:7.5.0')
        .withKraft()
        .withEnvironment({
          KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
        })
        .start(),
      new ElasticsearchContainer(
        'docker.elastic.co/elasticsearch/elasticsearch:8.11.0',
      )
        .withEnvironment({ 'xpack.security.enabled': 'false' })
        .start(),
    ]);

    const mongoUri = mongo.getConnectionString() + '?directConnection=true';
    const kafkaBroker = `${kafka.getHost()}:${kafka.getMappedPort(9093)}`;
    const esUrl = es.getHttpUrl();

    // Pre-create the message-created topic before NestJS consumer subscribes
    const adminKafka = new Kafka({ brokers: [kafkaBroker] });
    const admin = adminKafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic: 'message-created', numPartitions: 1 }],
    });
    await admin.disconnect();

    // Override env vars before NestJS bootstraps
    process.env['MONGODB_URI'] = mongoUri;
    process.env['KAFKA_BROKERS'] = kafkaBroker;
    process.env['ELASTICSEARCH_URL'] = esUrl;
    process.env['JWT_SECRET'] = JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const jwtService = moduleFixture.get<JwtService>(JwtService);

    return {
      app,
      jwtService,
      mongoUri,
      kafkaBroker,
      esUrl,
      signToken: (userId: string) => signTestToken(jwtService, userId),
      teardown: async () => {
        await app.close();
        await Promise.all([mongo.stop(), kafka.stop(), es.stop()]);
      },
    };
  }
}
