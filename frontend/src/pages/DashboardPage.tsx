import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { authAPI } from '../api';

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await authAPI.me();
      } catch (error) {
        clearAuth();
      }
    };

    if (user) {
      verifyAuth();
    }
  }, [user, clearAuth]);

  const handleLogout = () => {
    setLoading(true);
    clearAuth();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🚀 GPSR Product Manager
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">{user?.name}</span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            You are logged in as <strong>{user?.email}</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📂 Categories
              </h3>
              <p className="text-blue-700">Manage your product categories</p>
            </div>

            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                📦 Products
              </h3>
              <p className="text-green-700">Add and manage your products</p>
            </div>

            <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                ⚙️ GPSR Data
              </h3>
              <p className="text-purple-700">Manage GPSR compliance information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
