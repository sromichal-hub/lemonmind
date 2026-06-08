import { useState, useEffect } from 'react';
import { productsAPI, ProductData, categoriesAPI } from '../api';

interface Product {
  id: number;
  name: string;
  categoryId?: number;
  gpsrIdentificationDetails?: string;
  gpsrWarningPhrases?: string;
  gpsrWarningText?: string;
  gpsrPictograms?: string;
  gpsrAdditionalSafetyInfo?: string;
  gpsrStatementOfCompliance?: string;
  gpsrOnlineInstructionsUrl?: string;
  gpsrInstructionsManual?: string;
  gpsrDeclarationsOfConformity?: string;
  gpsrCertificates?: string;
  gpsrModerationStatus?: string;
  gpsrModerationComment?: string;
  gpsrSubmittedBySupplierUser?: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGpsrFields, setShowGpsrFields] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        gpsrIdentificationDetails: product.gpsrIdentificationDetails,
        gpsrWarningPhrases: product.gpsrWarningPhrases,
        gpsrWarningText: product.gpsrWarningText,
        gpsrPictograms: product.gpsrPictograms,
        gpsrAdditionalSafetyInfo: product.gpsrAdditionalSafetyInfo,
        gpsrStatementOfCompliance: product.gpsrStatementOfCompliance,
        gpsrOnlineInstructionsUrl: product.gpsrOnlineInstructionsUrl,
        gpsrInstructionsManual: product.gpsrInstructionsManual,
        gpsrDeclarationsOfConformity: product.gpsrDeclarationsOfConformity,
        gpsrCertificates: product.gpsrCertificates,
        gpsrModerationStatus: product.gpsrModerationStatus,
        gpsrModerationComment: product.gpsrModerationComment,
        gpsrSubmittedBySupplierUser: product.gpsrSubmittedBySupplierUser,
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      // Flatten the tree structure
      const flattenCategories = (cats: any[]): Category[] => {
        return cats.reduce((acc: Category[], cat) => {
          acc.push({ id: cat.id, name: cat.name });
          if (cat.children) {
            acc.push(...flattenCategories(cat.children));
          }
          return acc;
        }, []);
      };
      setCategories(flattenCategories(response.data));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'categoryId') {
        return {
          ...prev,
          [name]: value ? parseInt(value) : null,
        };
      }
      return {
        ...prev,
        [name]: value || undefined,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError('Nazwa produktu jest wymagana');
      return;
    }

    try {
      setLoading(true);
      if (product) {
        await productsAPI.update(product.id, formData);
      } else {
        await productsAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Nie udało się zapisać produktu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {product ? 'Edytuj produkt' : 'Dodaj nowy produkt'}
      </h2>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      {/* Podstawowe dane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-semibold mb-2">Nazwa produktu *</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Kategoria</label>
          <select
            name="categoryId"
            value={formData.categoryId || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Brak kategorii --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle dla pól GPSR */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowGpsrFields(!showGpsrFields)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-semibold"
        >
          {showGpsrFields ? '▼' : '▶'} Dane GPSR
        </button>
      </div>

      {/* Pola GPSR */}
      {showGpsrFields && (
        <div className="bg-gray-50 p-4 rounded mb-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold mb-4">Informacje GPSR</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Szczegóły Identyfikacji Produktu</label>
              <textarea
                name="gpsrIdentificationDetails"
                value={formData.gpsrIdentificationDetails || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Hasła Ostrzegawcze</label>
              <textarea
                name="gpsrWarningPhrases"
                value={formData.gpsrWarningPhrases || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Tekst Ostrzeżeń</label>
            <textarea
              name="gpsrWarningText"
              value={formData.gpsrWarningText || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20 mb-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Piktogramy Ostrzegawcze</label>
              <input
                type="text"
                name="gpsrPictograms"
                value={formData.gpsrPictograms || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="URL lub ścieżka pliku"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Dodatkowe Informacje o Bezpieczeństwa</label>
              <textarea
                name="gpsrAdditionalSafetyInfo"
                value={formData.gpsrAdditionalSafetyInfo || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Oświadczenie o Zgodności GPSR</label>
              <textarea
                name="gpsrStatementOfCompliance"
                value={formData.gpsrStatementOfCompliance || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Link do Cyfrowej Instrukcji</label>
              <input
                type="url"
                name="gpsrOnlineInstructionsUrl"
                value={formData.gpsrOnlineInstructionsUrl || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Instrukcja Użytkowania / Montażu</label>
              <input
                type="text"
                name="gpsrInstructionsManual"
                value={formData.gpsrInstructionsManual || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="URL lub ścieżka pliku"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Deklaracja Zgodności UE</label>
              <input
                type="text"
                name="gpsrDeclarationsOfConformity"
                value={formData.gpsrDeclarationsOfConformity || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="URL lub ścieżka pliku"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Atesty / Certyfikaty Bezpieczeństwa</label>
              <input
                type="text"
                name="gpsrCertificates"
                value={formData.gpsrCertificates || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="URL lub ścieżka pliku"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Status Moderacji</label>
              <select
                name="gpsrModerationStatus"
                value={formData.gpsrModerationStatus || 'PENDING'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="PENDING">Oczekujący</option>
                <option value="APPROVED">Zatwierdzone</option>
                <option value="REJECTED">Odrzucone</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-2">Komentarz Moderatora</label>
              <textarea
                name="gpsrModerationComment"
                value={formData.gpsrModerationComment || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Użytkownik Dostawcy Przesyłający Dane</label>
              <input
                type="text"
                name="gpsrSubmittedBySupplierUser"
                value={formData.gpsrSubmittedBySupplierUser || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Przyciski akcji */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Zapisywanie...' : product ? 'Aktualizuj' : 'Dodaj'}
        </button>
      </div>
    </form>
  );
}


