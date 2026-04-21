import request from 'supertest';
import { App } from 'supertest/types';
import { TestSetup, TestContext } from './helpers/test-setup';

describe('Messages CRUD Integration', () => {
  let ctx: TestContext;
  let aliceToken: string;
  let charlieToken: string;
  const conversationId = 'conv-alpha-general';

  beforeAll(async () => {
    ctx = await TestSetup.create();
    aliceToken = ctx.signToken('user-alice');
    charlieToken = ctx.signToken('user-charlie');
  }, 120000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('should reject messages to non-existent conversations', async () => {
    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        conversationId: 'conv-does-not-exist',
        senderId: 'user-alice',
        body: 'hello',
      })
      .expect(404);
  });

  it('should reject messages to conversations of another tenant', async () => {
    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        conversationId: 'conv-beta-general',
        senderId: 'user-alice',
        body: 'cross-tenant attempt',
      })
      .expect(404);
  });

  it('should validate required fields on POST', async () => {
    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ body: 'missing fields' })
      .expect(400);
  });

  it('should create a message and return it with generated id and tenantId', async () => {
    const res = await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        conversationId,
        senderId: 'user-alice',
        body: 'first message',
      })
      .expect(201);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    expect(res.body.id).toBeDefined();
    expect(res.body.tenantId).toBe('tenant-alpha');
    expect(res.body.conversationId).toBe(conversationId);
    expect(res.body.timestamp).toBeDefined();
  });

  it('should retrieve messages for a conversation', async () => {
    // Create a few more messages
    for (let i = 0; i < 3; i++) {
      await request(ctx.app.getHttpServer() as App)
        .post('/api/messages')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          conversationId,
          senderId: 'user-alice',
          body: `message ${i}`,
        })
        .expect(201);
    }

    const res = await request(ctx.app.getHttpServer() as App)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(res.body.messages.length).toBeGreaterThanOrEqual(4);
    expect(res.body.messages[0].conversationId).toBe(conversationId);
  });

  it('should support cursor-based pagination', async () => {
    const page1 = await request(ctx.app.getHttpServer() as App)
      .get(`/api/conversations/${conversationId}/messages?limit=2`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(page1.body.messages).toHaveLength(2);
    expect(page1.body.nextCursor).toBeDefined();

    const page2 = await request(ctx.app.getHttpServer() as App)
      .get(
        `/api/conversations/${conversationId}/messages?limit=2&cursor=${page1.body.nextCursor}`,
      )
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(page2.body.messages).toHaveLength(2);
    // Pages should not overlap
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    const page1Ids = page1.body.messages.map((m: { id: string }) => m.id);
    const page2Ids = page2.body.messages.map((m: { id: string }) => m.id);
    expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids));
  });

  it('should enforce tenant isolation — charlie cannot see alice messages', async () => {
    const res = await request(ctx.app.getHttpServer() as App)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${charlieToken}`)
      .expect(200);

    expect(res.body.messages).toHaveLength(0);
  });
});
