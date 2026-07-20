import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  const getStrength = () => {
    if (!password) return { label: 'None', color: 'bg-secondary', pct: 0 };
    if (password.length < 6) return { label: 'Too Short', color: 'bg-danger', pct: 25 };
    if (password.length < 10) return { label: 'Medium Strength', color: 'bg-warning', pct: 60 };
    return { label: 'Strong Security', color: 'bg-success', pct: 100 };
  };

  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Token is invalid or has expired';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex-grow-1 d-flex align-items-center justify-content-center py-5" 
      style={{ background: '#f0f2f5', minHeight: '90vh' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div 
              className="card border-0 shadow-lg p-4 text-dark" 
              style={{ 
                background: '#ffffff', 
                borderRadius: '16px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)'
              }}
            >
              <div className="text-center mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'rgba(13, 110, 253, 0.08)',
                    border: '1px solid rgba(13, 110, 253, 0.15)'
                  }}
                >
                  <i className="bi bi-shield-lock text-primary fs-2"></i>
                </div>
                <h3 className="fw-bold tracking-tight text-dark mb-1">Set New Password</h3>
                <p className="text-secondary small px-2">Please enter a new, strong password to secure your workspace.</p>
              </div>

              {success ? (
                <div className="text-center py-3">
                  <div 
                    className="alert alert-success border-0 p-3 mb-4 text-start d-flex align-items-start gap-2"
                    style={{ background: 'rgba(25, 135, 84, 0.08)', color: '#198754', borderRadius: '12px' }}
                  >
                    <i className="bi bi-check-circle-fill fs-5 mt-0.5"></i>
                    <div>
                      <span className="fw-bold d-block mb-1">Password Changed</span>
                      Your password has been updated. Redirecting you to login portal...
                    </div>
                  </div>
                  <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2rem', height: '2rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <Link to="/login" className="btn btn-primary w-100 py-2 fw-bold" style={{ borderRadius: '8px' }}>
                    Login Now
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div 
                      className="alert alert-danger border-0 p-3 mb-4 small d-flex align-items-center gap-2"
                      style={{ background: 'rgba(220, 53, 69, 0.08)', color: '#dc3545', borderRadius: '12px' }}
                    >
                      <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">New Password</label>
                    <div className="input-group border rounded-3" style={{ overflow: 'hidden' }}>
                      <span className="input-group-text bg-light border-0 text-muted pe-2">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-0 bg-white text-dark py-2.5"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn bg-white border-0 text-muted px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center small text-secondary mb-1" style={{ fontSize: '0.75rem' }}>
                          <span>Strength: <strong>{strength.label}</strong></span>
                          <span>{password.length}/6 min</span>
                        </div>
                        <div className="progress" style={{ height: '4px', backgroundColor: '#e9ecef' }}>
                          <div 
                            className={`progress-bar ${strength.color} transition-all duration-300`} 
                            role="progressbar" 
                            style={{ width: `${strength.pct}%` }}
                            aria-valuenow={strength.pct} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-semibold">Confirm Password</label>
                    <div className="input-group border rounded-3" style={{ overflow: 'hidden' }}>
                      <span className="input-group-text bg-light border-0 text-muted pe-2">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control border-0 bg-white text-dark py-2.5"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn bg-white border-0 text-muted px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 fw-bold mb-3 shadow-sm"
                    disabled={loading}
                    style={{ 
                      background: '#0d6efd', 
                      borderColor: '#0d6efd',
                      borderRadius: '8px'
                    }}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    Reset Password
                  </button>

                  <div className="text-center mt-3">
                    <Link to="/login" className="text-decoration-none text-muted small hover-link">
                      Cancel and Return
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
