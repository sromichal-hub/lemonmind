import { useEffect, useState } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(err => setBackendStatus('Error connecting to backend'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 GPSR Product Manager
            </h1>
            <p className="text-gray-600 mb-6">
              Welcome to your GPSR Product Management Application
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="font-semibold text-blue-900 mb-2">Frontend Status</h2>
                <p className="text-sm text-blue-800">✅ React + Vite is running</p>
              </div>

              <div className={`p-4 rounded-lg border ${
                backendStatus?.includes('running') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <h2 className="font-semibold mb-2">
                  {backendStatus?.includes('running') ? '✅' : '⏳'} Backend Status
                </h2>
                <p className="text-sm">
                  {backendStatus || 'Connecting...'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Features to implement:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ User registration & login</li>
                <li>✓ Category tree management</li>
                <li>✓ Product management</li>
                <li>✓ GPSR compliance fields</li>
                <li>✓ File uploads (pictograms, manuals, certificates)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
