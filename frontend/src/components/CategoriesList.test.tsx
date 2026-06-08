import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriesList, { Category } from './CategoriesList';

const categories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    parentId: null,
    userId: 1,
    children: [
      {
        id: 2,
        name: 'Computers',
        parentId: 1,
        userId: 1,
        children: [],
        products: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    products: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('CategoriesList', () => {
  it('renders empty state when no categories', () => {
    render(
      <CategoriesList
        categories={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewProducts={vi.fn()}
      />
    );

    expect(screen.getByText('No categories yet')).toBeInTheDocument();
  });

  it('renders category tree with Produkty button', () => {
    render(
      <CategoriesList
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewProducts={vi.fn()}
      />
    );

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Computers')).toBeInTheDocument();
    expect(screen.getAllByText('Produkty')).toHaveLength(2);
  });

  it('calls onViewProducts when Produkty button is clicked', async () => {
    const user = userEvent.setup();
    const onViewProducts = vi.fn();

    render(
      <CategoriesList
        categories={categories}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewProducts={onViewProducts}
      />
    );

    const produktyButtons = screen.getAllByText('Produkty');
    await user.click(produktyButtons[0]);

    expect(onViewProducts).toHaveBeenCalledWith(categories[0]);
  });
});
