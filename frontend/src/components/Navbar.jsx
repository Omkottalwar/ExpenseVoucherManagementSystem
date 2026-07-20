import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active fw-bold' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2 no-print">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-wallet2 text-primary me-2"></i>
          <span className="fw-bold tracking-tight">ExpenseVoucher</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Employee Nav links */}
            {user.role === 'Employee' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/employee/dashboard')}`} to="/employee/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/employee/vouchers')}`} to="/employee/vouchers">
                    My Vouchers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/employee/vouchers/new')}`} to="/employee/vouchers/new">
                    Create Voucher
                  </Link>
                </li>
              </>
            )}

            {/* Director Nav links */}
            {user.role === 'Director' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/director/dashboard')}`} to="/director/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/director/pending')}`} to="/director/pending">
                    Pending Queue
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/director/vouchers')}`} to="/director/vouchers">
                    All Vouchers
                  </Link>
                </li>
              </>
            )}

            {/* Accounts Nav links */}
            {user.role === 'Accounts' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/accounts/dashboard')}`} to="/accounts/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/accounts/vouchers')}`} to="/accounts/vouchers">
                    All Vouchers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/accounts/add-employee')}`} to="/accounts/add-employee">
                    Add Employee
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end text-light small d-none d-sm-block">
              <div className="fw-semibold">{user.name}</div>
              <span className="badge bg-secondary small">{user.role}</span>
              {user.department && <span className="ms-1 text-muted">({user.department})</span>}
            </div>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
