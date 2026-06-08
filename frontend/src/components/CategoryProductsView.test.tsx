import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryProductsView from './CategoryProductsView';
import { categoriesAPI } from '../api';
import { Category } from './CategoriesList';

vi.mock('../api', () => ({
  categoriesAPI: {
    getProducts: vi.fn(),
  },
}));

const mockedGetProducts = vi.mocked(categoriesAPI.getProducts);

const category: Category = {
  id: 1,
  name: 'Electronics',
  parentId: null,
  userId: 1,
  children: [],
  products: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('CategoryProductsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockedGetProducts.mockReturnValue(new Promise(() => {}));

    render(<CategoryProductsView category={category} onBack={vi.fn()} />);

    expect(screen.getByText('Ładowanie produktów...')).toBeInTheDocument();
  });

  it('renders products with source badges', async () => {
    mockedGetProducts.mockResolvedValue({
      data: {
        category: { id: 1, name: 'Electronics' },
        products: [
          {
            id: 1,
            name: 'Phone',
            categoryId: 1,
            category: { id: 1, name: 'Electronics' },
            isFromChildCategory: false,
            gpsrModerationStatus: 'PENDING',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Laptop',
            categoryId: 2,
            category: { id: 2, name: 'Computers' },
            isFromChildCategory: true,
            gpsrModerationStatus: 'APPROVED',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ],
      },
    } as any);

    render(<CategoryProductsView category={category} onBack={vi.fn()} />);

    expect(await screen.findByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Ta kategoria')).toBeInTheDocument();
    expect(screen.getByText('Podkategoria')).toBeInTheDocument();
    expect(screen.getByText('Produkty: Electronics')).toBeInTheDocument();
    expect(mockedGetProducts).toHaveBeenCalledWith(1);
  });

  it('shows empty state when no products found', async () => {
    mockedGetProducts.mockResolvedValue({
      data: {
        category: { id: 1, name: 'Electronics' },
        products: [],
      },
    } as any);

    render(<CategoryProductsView category={category} onBack={vi.fn()} />);

    expect(
      await screen.findByText('Brak produktów w tej kategorii i podkategoriach.')
    ).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    mockedGetProducts.mockRejectedValue({
      response: { data: { error: 'Category not found or not yours' } },
    });

    render(<CategoryProductsView category={category} onBack={vi.fn()} />);

    expect(
      await screen.findByText('Category not found or not yours')
    ).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    mockedGetProducts.mockResolvedValue({
      data: { category: { id: 1, name: 'Electronics' }, products: [] },
    } as any);

    render(<CategoryProductsView category={category} onBack={onBack} />);

    await user.click(await screen.findByText('← Wróć do kategorii'));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
