import request from 'supertest';
import { App } from 'supertest/types';
import { TestSetup, TestContext } from './helpers/test-setup';

describe('Search Pipeline Integration (POST → Kafka → ES → Search)', () => {
  let ctx: TestContext;
  let aliceToken: string;
  const conversationId = 'conv-search-pipeline';

  beforeAll(async () => {
    ctx = await TestSetup.create();
    aliceToken = ctx.signToken('user-alice');
  }, 120000);

  afterAll(async () => {
    await ctx.teardown();
  });

  it('should index a message through Kafka and make it searchable in ES', async () => {
    // Create a message with unique content
    const uniqueWord = `testword${Date.now()}`;

    await request(ctx.app.getHttpServer() as App)
      .post('/api/messages')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        conversationId,
        senderId: 'user-alice',
        body: `This contains ${uniqueWord} for search`,
      })
      .expect(201);

    // Wait for Kafka → ES pipeline (async processing)
    // Poll with retries since the pipeline is eventually consistent
    let found = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));

      const res = await request(ctx.app.getHttpServer() as App)
        .get(
          `/api/conversations/${conversationId}/messages/search?q=${uniqueWord}`,
        )
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);

      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      if (res.body.length > 0) {
        expect(res.body[0].body).toContain(uniqueWord);
        expect(res.body[0].tenantId).toBe('tenant-alpha');
        expect(res.body[0].conversationId).toBe(conversationId);
        found = true;
        break;
      }
    }

    expect(found).toBe(true);
  }, 60000);
});
