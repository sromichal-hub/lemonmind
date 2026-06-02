import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { categoriesAPI } from '../api';
import { Category } from './CategoriesList';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  categories,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      parentId: category?.parentId?.toString() || '',
    },
  });

  useEffect(() => {
    reset({
      name: category?.name || '',
      parentId: category?.parentId?.toString() || '',
    });
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    setError('');
    setLoading(true);

    try {
      const parentId = data.parentId ? parseInt(data.parentId) : undefined;

      if (category) {
        await categoriesAPI.update(category.id, data.name, parentId);
      } else {
        await categoriesAPI.create(data.name, parentId);
      }

      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const flatCategories = (cats: Category[]): Category[] => {
    return cats.flatMap((cat) => [cat, ...flatCategories(cat.children)]);
  };

  const availableParents = flatCategories(categories).filter(
    (cat) => !category || cat.id !== category.id
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter category name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category
        </label>
        <select
          {...register('parentId')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">None (Root category)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : category ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-lg hover:bg-gray-500 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
