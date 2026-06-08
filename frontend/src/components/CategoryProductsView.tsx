import { useState, useEffect } from 'react';
import { categoriesAPI, CategoryProduct } from '../api';
import { Category } from './CategoriesList';

interface CategoryProductsViewProps {
  category: Category;
  onBack: () => void;
}

export default function CategoryProductsView({
  category,
  onBack,
}: CategoryProductsViewProps) {
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await categoriesAPI.getProducts(category.id);
        setProducts(response.data.products);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Nie udało się załadować produktów');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          ← Wróć do kategorii
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          Produkty: {category.name}
        </h3>
      </div>

      <p className="text-sm text-gray-600">
        Wyświetlane są produkty z tej kategorii oraz wszystkich podkategorii.
      </p>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Ładowanie produktów...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Brak produktów w tej kategorii i podkategoriach.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Nazwa</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Kategoria</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Źródło</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Identyfikacja GPSR</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status Moderacji</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Data Utworzenia</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    {product.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.category?.name || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.isFromChildCategory ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                        Podkategoria
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        Ta kategoria
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {product.gpsrIdentificationDetails
                      ? product.gpsrIdentificationDetails.substring(0, 30) + '...'
                      : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.gpsrModerationStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : product.gpsrModerationStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.gpsrModerationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {new Date(product.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
