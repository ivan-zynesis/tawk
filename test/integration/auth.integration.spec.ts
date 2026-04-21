import request from 'supertest';
import { App } from 'supertest/types';
import { TestSetup, TestContext } from './helpers/test-setup';

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

  it('should return tenant-scoped conversations', async () => {
    const token = ctx.signToken('user-alice');

    const res = await request(ctx.app.getHttpServer() as App)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    expect(res.body.map((c: { name: string }) => c.name).sort()).toEqual([
      '#engineering',
      '#general',
    ]);
  });

  it('should return different conversations for different tenants', async () => {
    const token = ctx.signToken('user-charlie');

    const res = await request(ctx.app.getHttpServer() as App)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    expect(res.body.map((c: { name: string }) => c.name).sort()).toEqual([
      '#general',
      '#random',
    ]);
  });

  it('should accept requests from seeded users with valid JWT', async () => {
    const token = ctx.signToken('user-alice');

    const res = await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId: 'conv-alpha-general',
        senderId: 'user-alice',
        body: 'authenticated message',
      })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.tenantId).toBe('tenant-alpha');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.body).toBe('authenticated message');
  });
});
