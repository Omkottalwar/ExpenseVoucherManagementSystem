import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import EmployeeLogin from './pages/employee/EmployeeLogin';
import DirectorLogin from './pages/director/DirectorLogin';
import AccountsLogin from './pages/accounts/AccountsLogin';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyVouchers from './pages/employee/MyVouchers';
import CreateVoucher from './pages/employee/CreateVoucher';
import EditVoucher from './pages/employee/EditVoucher';
import VoucherDetails from './pages/employee/VoucherDetails';

// Director Pages
import DirectorDashboard from './pages/director/DirectorDashboard';
import PendingVouchers from './pages/director/PendingVouchers';
import AllVouchers from './pages/director/AllVouchers';
import VoucherDetailsApproval from './pages/director/VoucherDetailsApproval';

// Accounts Pages
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import AccountsAllVouchers from './pages/accounts/AccountsAllVouchers';
import AccountsVoucherDetails from './pages/accounts/AccountsVoucherDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          {/* Header Navbar */}
          <Navbar />

          {/* Main App Container */}
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/employee/login" element={<EmployeeLogin />} />
              <Route path="/director/login" element={<DirectorLogin />} />
              <Route path="/accounts/login" element={<AccountsLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Employee Guarded Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/vouchers"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <MyVouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/vouchers/new"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <CreateVoucher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/vouchers/:id"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <VoucherDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/vouchers/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <EditVoucher />
                  </ProtectedRoute>
                }
              />

              {/* Director Guarded Routes */}
              <Route
                path="/director/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Director']}>
                    <DirectorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/pending"
                element={
                  <ProtectedRoute allowedRoles={['Director']}>
                    <PendingVouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/vouchers"
                element={
                  <ProtectedRoute allowedRoles={['Director']}>
                    <AllVouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/vouchers/:id"
                element={
                  <ProtectedRoute allowedRoles={['Director']}>
                    <VoucherDetailsApproval />
                  </ProtectedRoute>
                }
              />

              {/* Accounts Guarded Routes */}
              <Route
                path="/accounts/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Accounts']}>
                    <AccountsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts/vouchers"
                element={
                  <ProtectedRoute allowedRoles={['Accounts']}>
                    <AccountsAllVouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts/vouchers/:id"
                element={
                  <ProtectedRoute allowedRoles={['Accounts']}>
                    <AccountsVoucherDetails />
                  </ProtectedRoute>
                }
              />


              {/* Catch-all Routing */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          {/* Toast Container notifications */}
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
