import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useContext(AuthContext);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Employee') return '/employee/dashboard';
    if (user.role === 'Director') return '/director/dashboard';
    if (user.role === 'Accounts') return '/accounts/dashboard';
    return '/login';
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-5 glass-card shadow-lg rounded" style={{ maxWidth: '480px' }}>
        <div className="display-1 text-danger mb-4">
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h2 className="fw-bold mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <Link to={getDashboardPath()} className="btn btn-primary px-4 py-2" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
          <i className="bi bi-house-door me-2"></i>Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
