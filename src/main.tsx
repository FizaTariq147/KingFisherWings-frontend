import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ErpAccessBlockedModal } from './components/auth/ErpAccessBlockedModal'
import { SessionExpiredModal } from './components/auth/SessionExpiredModal'
import { SubscriptionExpiredModal } from './components/auth/SubscriptionExpiredModal'
import { SessionExpiryWatcher } from './components/auth/SessionExpiryWatcher'
import { ToastHost } from './components/toast'
import { queryClient } from './lib/queryClient'
import { installAlertToastBridge } from './lib/toastNotify'
import { router } from './router'
import { store } from './store'
import { AuthProvider } from './context/AuthContext'
import { AuthLoadingGate } from './components/skeletons/AuthLoadingGate'
import './styles/brand-tokens.css'
import './index.css'

installAlertToastBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthLoadingGate>
            <SessionExpiryWatcher />
            <SessionExpiredModal />
            <SubscriptionExpiredModal />
            <ErpAccessBlockedModal />
            <ToastHost />
            <RouterProvider router={router} />
          </AuthLoadingGate>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)