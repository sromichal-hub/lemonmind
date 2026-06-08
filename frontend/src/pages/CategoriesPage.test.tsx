import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriesPage from './CategoriesPage';

const mockCategories = [
  {
    id: 1,
    name: 'Electronics',
    parentId: null,
    userId: 1,
    children: [],
    products: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

vi.mock('../components/CategoriesList', async () => {
  const actual = await vi.importActual<typeof import('../components/CategoriesList')>(
    '../components/CategoriesList'
  );

  return {
    ...actual,
    useCategoriesQuery: () => ({
      categories: mockCategories,
      loading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

vi.mock('../components/CategoryProductsView', () => ({
  default: ({
    category,
    onBack,
  }: {
    category: { id: number; name: string };
    onBack: () => void;
  }) => (
    <div>
      <button onClick={onBack}>← Wróć do kategorii</button>
      <h3>Produkty: {category.name}</h3>
    </div>
  ),
}));

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders categories list', () => {
    render(<CategoriesPage />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('📂 Categories')).toBeInTheDocument();
  });

  it('navigates to category products view when Produkty is clicked', async () => {
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await act(async () => {
      await user.click(screen.getByText('Produkty'));
    });

    expect(await screen.findByText('Produkty: Electronics')).toBeInTheDocument();
    expect(screen.getByText('← Wróć do kategorii')).toBeInTheDocument();
    expect(screen.queryByText('📂 Categories')).not.toBeInTheDocument();
  });

  it('returns to categories list when back button is clicked', async () => {
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await act(async () => {
      await user.click(screen.getByText('Produkty'));
    });
    await act(async () => {
      await user.click(screen.getByText('← Wróć do kategorii'));
    });

    expect(await screen.findByText('📂 Categories')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
