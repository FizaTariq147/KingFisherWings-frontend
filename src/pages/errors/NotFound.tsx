import { SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm mx-auto text-center">
        <SearchX size={40} className="text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-medium text-gray-900 mb-2">404 Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-sm bg-[var(--btn-primary-bg)] px-5 py-2.5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}