import { useState, useEffect } from 'react';
import { categoriesAPI } from '../api';

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  userId: number;
  children: Category[];
  products: any[];
  createdAt: string;
  updatedAt: string;
}

interface TreeNodeProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  level: number;
}

function TreeNode({ category, onEdit, onDelete, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="py-2">
      <div className="flex items-center gap-2">
        {category.children.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 text-left text-blue-600 hover:text-blue-800"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        {category.children.length === 0 && (
          <div className="w-6"></div>
        )}
        
        <span className="flex-1 text-gray-800">{category.name}</span>
        
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>

      {expanded && category.children.length > 0 && (
        <div>
          {category.children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoriesListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoriesList({
  categories,
  onEdit,
  onDelete,
}: CategoriesListProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No categories yet</p>
      ) : (
        <div>
          {categories.map((category) => (
            <TreeNode
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function useCategoriesQuery() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
}
