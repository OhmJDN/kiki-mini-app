import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authenticateWithLine } from './features/auth/auth-service';

import { CustomerLayout } from './components/layout/customer-layout';
import { AdminLayout } from './components/layout/admin-layout';

import { LandingPage } from './pages/customer/landing';
import { Home } from './pages/customer/home';
import { ServicesPage } from './pages/customer/services';
import { BookingsPage } from './pages/customer/bookings';

import { AdminDashboard } from './pages/admin/dashboard';
import { AdminBookingsPage } from './pages/admin/bookings';
import { AdminServicesPage } from './pages/admin/services';
import { AdminCustomersPage } from './pages/admin/customers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Attempt background LINE auth if inside LIFF
    authenticateWithLine();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Quick Shortcuts */}
          <Route path="/services" element={<Navigate to="/home/services" replace />} />
          <Route path="/bookings" element={<Navigate to="/home/bookings" replace />} />

          {/* Customer Routes */}
          <Route path="/home" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
