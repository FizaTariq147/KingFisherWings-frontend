import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/auth/dashboard/pages/DashboardPage';
import { MasterListPage } from '../components/layout/MasterListPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell title="Dashboard" />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'masters/airlines',
        element: (
          <MasterListPage
            title="Airlines"
            columns={[
              { key: 'code',    label: 'Code', mono: true },
              { key: 'name',    label: 'Name' },
              { key: 'country', label: 'Country' },
              { key: 'iata',    label: 'IATA', mono: true },
            ]}
            rows={[
              { code: 'EK', name: 'Emirates',       country: 'UAE',  iata: 'EK' },
              { code: 'FZ', name: 'Flydubai',       country: 'UAE',  iata: 'FZ' },
              { code: 'QR', name: 'Qatar Airways',  country: 'Qatar', iata: 'QR' },
            ]}
          />
        ),
      },
    ],
  },
]);