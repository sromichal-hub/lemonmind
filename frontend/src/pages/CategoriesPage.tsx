import { useState } from 'react';
import { categoriesAPI } from '../api';
import { CategoriesList, useCategoriesQuery, Category } from '../components/CategoriesList';
import { CategoryForm } from '../components/CategoryForm';

export default function CategoriesPage() {
  const { categories, loading, error, refetch } = useCategoriesQuery();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure? This will delete the category and all its subcategories.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await categoriesAPI.delete(id);
      refetch();
      setEditingCategory(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📂 Categories</h2>
        {!showForm && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + New Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading categories...</div>
      ) : (
        <CategoriesList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {deleteLoading && (
        <div className="text-center text-gray-500">Deleting...</div>
      )}
    </div>
  );
}
