import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import DashboardLayout from './components/common/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      }} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Farmer Dashboard */}
        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <Navbar />
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<FarmerDashboard />} />
          <Route path="transactions" element={<FarmerDashboard />} />
          <Route path="credit" element={<FarmerDashboard />} />
          <Route path="profile" element={<FarmerDashboard />} />
        </Route>

        {/* Manager Dashboard */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Navbar />
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ManagerDashboard />} />
          <Route path="add-produce" element={<ManagerDashboard />} />
          <Route path="records" element={<ManagerDashboard />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Navbar />
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="centers" element={<AdminDashboard />} />
          <Route path="produce" element={<AdminDashboard />} />
          <Route path="credits" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
