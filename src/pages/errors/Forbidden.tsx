import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm mx-auto text-center">
        <Lock size={40} className="text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-medium text-gray-900 mb-2">403 — Access Denied</h1>
        <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
        <button
          type="button"
          onClick={() => navigate('/app/dashboard')}
          className="bg-[#1a6e38] hover:bg-[#145530] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}