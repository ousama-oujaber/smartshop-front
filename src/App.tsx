import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductsListPage, ProductFormPage } from './features/products';
import { ClientsListPage, ClientFormPage, ClientDetailPage } from './features/clients';
import { OrdersListPage, OrderDetailPage, CreateOrderPage } from './features/orders';
import { AddPaymentPage } from './features/payments';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />

        {/* Products Routes */}
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />

        {/* Clients Routes */}
        <Route path="/clients" element={<ClientsListPage />} />
        <Route path="/clients/new" element={<ClientFormPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/clients/:id/edit" element={<ClientFormPage />} />

        {/* Orders Routes */}
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/new" element={<CreateOrderPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        {/* Payments Routes */}
        <Route path="/orders/:orderId/payments/new" element={<AddPaymentPage />} />
        <Route path="/payments/new" element={<AddPaymentPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App
