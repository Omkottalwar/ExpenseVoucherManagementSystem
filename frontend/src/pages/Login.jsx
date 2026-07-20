import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Employee') navigate('/employee/dashboard');
      else if (user.role === 'Director') navigate('/director/dashboard');
      else if (user.role === 'Accounts') navigate('/accounts/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light py-5">
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 shadow" style={{ width: '70px', height: '70px', background: 'var(--primary-gradient)' }}>
          <i className="bi bi-wallet2 fs-1"></i>
        </div>
        <h1 className="display-5 fw-bold text-dark mb-2">ExpenseVoucher Management</h1>
        <p className="text-secondary fs-5 max-w-600 mx-auto">Select your portal below to sign in and access your workspace.</p>
      </div>

      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="row g-4 justify-content-center">
          {/* Employee Portal Card */}
          <div className="col-md-4">
            <div className="card h-100 shadow border-0 glass-card hover-lift p-4 text-center">
              <div 
                className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-4 mx-auto shadow-sm"
                style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #0d6efd, #0dcaf0)' }}
              >
                <i className="bi bi-person-workspace fs-3"></i>
              </div>
              <h4 className="fw-bold mb-2">Employee Portal</h4>
              <p className="text-muted small flex-grow-1 mb-4">
                Submit new expense claims, upload signatures, and track your reimbursement approvals.
              </p>
              <Link 
                to="/employee/login" 
                className="btn btn-primary py-2 w-100 fw-semibold"
                style={{ background: 'linear-gradient(135deg, #0d6efd, #0dcaf0)', border: 'none' }}
              >
                Enter Employee Portal
              </Link>
            </div>
          </div>

          {/* Director Portal Card */}
          <div className="col-md-4">
            <div className="card h-100 shadow border-0 glass-card hover-lift p-4 text-center">
              <div 
                className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-4 mx-auto shadow-sm"
                style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6610f2, #6f42c1)' }}
              >
                <i className="bi bi-shield-check fs-3"></i>
              </div>
              <h4 className="fw-bold mb-2">Director Portal</h4>
              <p className="text-muted small flex-grow-1 mb-4">
                Audit pending employee claims, sign off on approvals, or reject with custom feedback.
              </p>
              <Link 
                to="/director/login" 
                className="btn btn-primary py-2 w-100 fw-semibold"
                style={{ background: 'linear-gradient(135deg, #6610f2, #6f42c1)', border: 'none' }}
              >
                Enter Director Portal
              </Link>
            </div>
          </div>

          {/* Accounts Portal Card */}
          <div className="col-md-4">
            <div className="card h-100 shadow border-0 glass-card hover-lift p-4 text-center">
              <div 
                className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-4 mx-auto shadow-sm"
                style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #198754, #20c997)' }}
              >
                <i className="bi bi-wallet2 fs-3"></i>
              </div>
              <h4 className="fw-bold mb-2">Accounts Portal</h4>
              <p className="text-muted small flex-grow-1 mb-4">
                Monitor approved organization payouts, review historical lists, and audit expenses.
              </p>
              <Link 
                to="/accounts/login" 
                className="btn btn-success py-2 w-100 fw-semibold"
                style={{ background: 'linear-gradient(135deg, #198754, #20c997)', border: 'none' }}
              >
                Enter Accounts Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
