import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';
import { createAuthToken } from './helpers';

vi.mock('../src/db', () => ({
  default: {
    category: {
      findMany: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests without token', async () => {
    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  it('rejects requests with invalid token', async () => {
    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid token');
  });

  it('allows requests with valid token', async () => {
    mockedPrisma.category.findMany.mockResolvedValue([]);

    const token = createAuthToken(1, 'user@example.com');
    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
