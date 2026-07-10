import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { router } from './router'
import { store } from './store'
import { AuthProvider } from './context/AuthContext'
import { AuthLoadingGate } from './components/skeletons/AuthLoadingGate'
import './styles/brand-tokens.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthLoadingGate>
            <RouterProvider router={router} />
          </AuthLoadingGate>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)