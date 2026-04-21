import request from 'supertest';
import { App } from 'supertest/types';
import { TestSetup, TestContext } from './helpers/test-setup.js';

describe('Auth Integration', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await TestSetup.create();
  }, 120000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('should reject requests without JWT', async () => {
    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .send({
        conversationId: 'conv-1',
        senderId: 'user-alice',
        body: 'hello',
      })
      .expect(401);
  });

  it('should reject requests with invalid JWT', async () => {
    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        conversationId: 'conv-1',
        senderId: 'user-alice',
        body: 'hello',
      })
      .expect(401);
  });

  it('should reject requests from users with no tenant mapping', async () => {
    const token = ctx.signToken('unknown-user');

    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: 'conv-1',
        senderId: 'user-alice',
        body: 'hello',
      })
      .expect(403);
  });

  it('should accept requests from seeded users with valid JWT', async () => {
    const token = ctx.signToken('user-alice');

    const res = await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: 'conv-auth-test',
        senderId: 'user-alice',
        body: 'authenticated message',
      })
      .expect(201);

    expect(res.body.tenantId).toBe('tenant-alpha');
    expect(res.body.body).toBe('authenticated message');
  });
});
