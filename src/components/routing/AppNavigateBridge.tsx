import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAppNavigate } from '@/lib/appNavigate';

/** Mount under RouterProvider so toast / non-tree code can navigate in-app. */
export function AppNavigateBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setAppNavigate((to) => {
      void navigate(to);
    });
    return () => setAppNavigate(null);
  }, [navigate]);

  return null;
}
