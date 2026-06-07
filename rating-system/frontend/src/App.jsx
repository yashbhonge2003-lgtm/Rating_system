import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUserList from './pages/admin/UserList';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminStoreList from './pages/admin/StoreList';
import AdminAddUser from './pages/admin/AddUser';
import AdminAddStore from './pages/admin/AddStore';
import AdminEditStore from './pages/admin/EditStore';
import UserStoreList from './pages/user/StoreList';
import UserUpdatePassword from './pages/user/UpdatePassword';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerUpdatePassword from './pages/owner/UpdatePassword';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminUserList /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users/:id" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminUserDetail /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/stores" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminStoreList /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/add-user" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminAddUser /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/add-store" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminAddStore /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/stores/edit/:id" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout><AdminEditStore /></AppLayout>
            </PrivateRoute>
          } />

          {/* User Routes */}
          <Route path="/user/stores" element={
            <PrivateRoute allowedRoles={['user']}>
              <AppLayout><UserStoreList /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/user/password" element={
            <PrivateRoute allowedRoles={['user']}>
              <AppLayout><UserUpdatePassword /></AppLayout>
            </PrivateRoute>
          } />

          {/* Store Owner Routes */}
          <Route path="/owner/dashboard" element={
            <PrivateRoute allowedRoles={['store_owner']}>
              <AppLayout><OwnerDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/owner/password" element={
            <PrivateRoute allowedRoles={['store_owner']}>
              <AppLayout><OwnerUpdatePassword /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
