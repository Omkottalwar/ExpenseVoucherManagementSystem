import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal') || 'Employee';
  const [email] = useState('omkottalwar17@gmail.com');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/forgot-password', { 
        email: email.trim().toLowerCase(),
        portal
      });
      if (res.data.success) {
        setSuccess(true);
        toast.success('Reset email sent successfully!');
      }
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Failed to request password reset';
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
                <h3 className="fw-bold tracking-tight text-dark mb-1">Forgot Password?</h3>
                <p className="text-secondary small px-2">No worries! Click below to dispatch a reset link to your registered email address.</p>
              </div>

              {success ? (
                <div className="text-center py-3">
                  <div 
                    className="alert alert-success border-0 p-3 mb-4 text-start d-flex align-items-start gap-2"
                    style={{ background: 'rgba(25, 135, 84, 0.08)', color: '#198754', borderRadius: '12px' }}
                  >
                    <i className="bi bi-envelope-check-fill fs-5 mt-0.5"></i>
                    <div>
                      <span className="fw-bold d-block mb-1">Link Dispatched</span>
                      A secure password reset link has been sent to **`omkottalwar17@gmail.com`**.
                    </div>
                  </div>
                  <p className="text-secondary small mb-3">Please check your inbox for the link.</p>
                  <Link to="/login" className="btn btn-primary w-100 py-2 fw-bold" style={{ borderRadius: '8px' }}>
                    Return to Login
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

                  <div 
                    className="p-3 mb-4 text-center border rounded-3"
                    style={{ background: 'rgba(13, 110, 253, 0.04)', borderColor: 'rgba(13, 110, 253, 0.1)' }}
                  >
                    <span className="text-secondary small d-block fw-semibold mb-1" style={{ letterSpacing: '0.5px' }}>RECIPIENT EMAIL</span>
                    <span className="fs-6 fw-bold text-dark d-inline-flex align-items-center gap-2">
                      <i className="bi bi-envelope-at text-primary"></i> omkottalwar17@gmail.com
                    </span>
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
                    Send Reset Link
                  </button>

                  <div className="text-center mt-3">
                    <Link to="/login" className="text-decoration-none text-muted small hover-link">
                      <i className="bi bi-arrow-left me-1"></i> Back to Login Gate
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

export default ForgotPassword;
