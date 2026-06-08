import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';
import { createAuthToken } from './helpers';

vi.mock('../src/db', () => ({
  default: {
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

describe('GET /api/categories/:id/products', () => {
  const token = createAuthToken(1);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without auth token', async () => {
    const response = await request(app).get('/api/categories/1/products');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided');
  });

  it('returns 403 when category does not belong to user', async () => {
    mockedPrisma.category.findUnique.mockResolvedValue({
      id: 1,
      name: 'Electronics',
      userId: 2,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .get('/api/categories/1/products')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Category not found or not yours');
  });

  it('returns products from category and descendants with isFromChildCategory flag', async () => {
    mockedPrisma.category.findUnique.mockResolvedValue({
      id: 1,
      name: 'Electronics',
      userId: 1,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockedPrisma.category.findMany.mockResolvedValue([
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
      { id: 3, parentId: 2 },
    ]);

    mockedPrisma.product.findMany.mockResolvedValue([
      {
        id: 10,
        name: 'Phone',
        userId: 1,
        categoryId: 1,
        category: { id: 1, name: 'Electronics', userId: 1, parentId: null, createdAt: new Date(), updatedAt: new Date() },
        gpsrIdentificationDetails: null,
        gpsrWarningPhrases: null,
        gpsrWarningText: null,
        gpsrPictograms: null,
        gpsrAdditionalSafetyInfo: null,
        gpsrStatementOfCompliance: null,
        gpsrOnlineInstructionsUrl: null,
        gpsrInstructionsManual: null,
        gpsrDeclarationsOfConformity: null,
        gpsrCertificates: null,
        gpsrModerationStatus: 'PENDING',
        gpsrModerationComment: null,
        gpsrLastSubmissionDate: null,
        gpsrLastModerationDate: null,
        gpsrSubmittedBySupplierUser: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 11,
        name: 'Laptop',
        userId: 1,
        categoryId: 2,
        category: { id: 2, name: 'Computers', userId: 1, parentId: 1, createdAt: new Date(), updatedAt: new Date() },
        gpsrIdentificationDetails: null,
        gpsrWarningPhrases: null,
        gpsrWarningText: null,
        gpsrPictograms: null,
        gpsrAdditionalSafetyInfo: null,
        gpsrStatementOfCompliance: null,
        gpsrOnlineInstructionsUrl: null,
        gpsrInstructionsManual: null,
        gpsrDeclarationsOfConformity: null,
        gpsrCertificates: null,
        gpsrModerationStatus: 'APPROVED',
        gpsrModerationComment: null,
        gpsrLastSubmissionDate: null,
        gpsrLastModerationDate: null,
        gpsrSubmittedBySupplierUser: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: 12,
        name: 'Mouse',
        userId: 1,
        categoryId: 3,
        category: { id: 3, name: 'Accessories', userId: 1, parentId: 2, createdAt: new Date(), updatedAt: new Date() },
        gpsrIdentificationDetails: null,
        gpsrWarningPhrases: null,
        gpsrWarningText: null,
        gpsrPictograms: null,
        gpsrAdditionalSafetyInfo: null,
        gpsrStatementOfCompliance: null,
        gpsrOnlineInstructionsUrl: null,
        gpsrInstructionsManual: null,
        gpsrDeclarationsOfConformity: null,
        gpsrCertificates: null,
        gpsrModerationStatus: 'PENDING',
        gpsrModerationComment: null,
        gpsrLastSubmissionDate: null,
        gpsrLastModerationDate: null,
        gpsrSubmittedBySupplierUser: null,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ]);

    const response = await request(app)
      .get('/api/categories/1/products')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.category).toEqual({ id: 1, name: 'Electronics' });
    expect(response.body.products).toHaveLength(3);

    const directProduct = response.body.products.find((p: { name: string }) => p.name === 'Phone');
    const childProduct = response.body.products.find((p: { name: string }) => p.name === 'Laptop');
    const grandchildProduct = response.body.products.find((p: { name: string }) => p.name === 'Mouse');

    expect(directProduct.isFromChildCategory).toBe(false);
    expect(childProduct.isFromChildCategory).toBe(true);
    expect(grandchildProduct.isFromChildCategory).toBe(true);

    expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
        categoryId: { in: [1, 2, 3] },
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('returns empty products list when category has no products', async () => {
    mockedPrisma.category.findUnique.mockResolvedValue({
      id: 5,
      name: 'Empty Category',
      userId: 1,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockedPrisma.category.findMany.mockResolvedValue([
      { id: 5, parentId: null },
    ]);

    mockedPrisma.product.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get('/api/categories/5/products')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.category).toEqual({ id: 5, name: 'Empty Category' });
    expect(response.body.products).toEqual([]);
  });
});
