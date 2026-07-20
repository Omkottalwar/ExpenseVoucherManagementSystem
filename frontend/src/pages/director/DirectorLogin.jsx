import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const DirectorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Employee') navigate('/employee/dashboard');
      else if (user.role === 'Director') navigate('/director/dashboard');
      else if (user.role === 'Accounts') navigate('/accounts/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    
    if (result.success) {
      // Access role from local storage directly to verify
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser && savedUser.role !== 'Director') {
        await logout();
        toast.error('Access Denied: This login page is only for Directors');
        setSubmitting(false);
        return;
      }
      toast.success('Logged in successfully as Director!');
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
    }
    setSubmitting(false);
  };

  const fillCredentials = () => {
    setEmail('director@company.com');
    setPassword('Password123');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0 glass-card p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3" 
            style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #6610f2, #6f42c1)' }}
          >
            <i className="bi bi-shield-check fs-2"></i>
          </div>
          <h2 className="fw-bold mb-1">Director Portal</h2>
          <p className="text-muted small">Sign in to review and authorize claims</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-secondary small fw-semibold">Email address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope text-muted"></i></span>
              <input
                type="email"
                className="form-on-focus form-control border-start-0 ps-0"
                id="email"
                placeholder="director@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="password" className="form-label text-secondary small fw-semibold mb-0">Password</label>
              <Link to="/forgot-password?portal=Director" style={{ color: '#6610f2', fontSize: '0.825rem' }} className="text-decoration-none hover-link">Forgot Password?</Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted"></i></span>
              <input
                type="password"
                className="form-on-focus form-control border-start-0 ps-0"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mb-3"
            disabled={submitting}
            style={{ background: 'linear-gradient(135deg, #6610f2, #6f42c1)', border: 'none' }}
          >
            {submitting && (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            )}
            Sign In
          </button>
        </form>

        <div className="mt-2 text-center">
          <button
            onClick={fillCredentials}
            className="btn btn-outline-primary btn-sm w-100 mb-3"
            style={{ color: '#6f42c1', borderColor: '#6f42c1' }}
          >
            Use Director Demo Credentials
          </button>
          <Link to="/login" className="text-decoration-none small fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DirectorLogin;
