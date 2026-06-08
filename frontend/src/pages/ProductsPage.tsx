import { useState } from 'react';
import ProductsList from '../components/ProductsList';
import ProductForm from '../components/ProductForm';

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

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setSelectedProduct(undefined);
    setShowForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setSelectedProduct(undefined);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {!showForm && (
        <>
          <div>
            <button
              onClick={handleAddNew}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold mb-4"
            >
              + Dodaj nowy produkt
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Moje produkty</h2>
            <ProductsList onEdit={handleEdit} refreshTrigger={refreshTrigger} />
          </div>
        </>
      )}
    </div>
  );
}


