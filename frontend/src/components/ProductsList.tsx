import { useState, useEffect } from 'react';
import { productsAPI } from '../api';

interface Product {
  id: number;
  name: string;
  categoryId?: number;
  category?: { id: number; name: string };
  gpsrIdentificationDetails?: string;
  gpsrWarningPhrases?: string;
  gpsrWarningText?: string;
  gpsrModerationStatus?: string;
  createdAt: string;
}

interface ProductsListProps {
  onEdit: (product: Product) => void;
  refreshTrigger: number;
}

export default function ProductsList({ onEdit, refreshTrigger }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Nie udało się załadować produktów');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;

    try {
      await productsAPI.delete(id);
      setProducts(products.filter((p: Product) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Nie udało się usunąć produktu');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Ładowanie produktów...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-4 text-gray-500">Brak produktów. Dodaj pierwszy produkt!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Nazwa</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Kategoria</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Identyfikacja GPSR</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status Moderacji</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Data Utworzenia</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 font-semibold">{product.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {product.category?.name || '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {product.gpsrIdentificationDetails
                  ? product.gpsrIdentificationDetails.substring(0, 30) + '...'
                  : '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  product.gpsrModerationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  product.gpsrModerationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.gpsrModerationStatus || 'PENDING'}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {new Date(product.createdAt).toLocaleDateString('pl-PL')}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



