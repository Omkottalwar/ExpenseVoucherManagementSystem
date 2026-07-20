import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

const AddEmployee = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Employee');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required fields');
      return;
    }

    setError('');
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        employeeId: employeeId.trim() || undefined,
        department: department.trim() || undefined,
        password: password.trim() || undefined
      };

      const res = await apiClient.post('/auth/add-employee', payload);
      
      if (res.data.success) {
        toast.success('Employee account created successfully!');
        setSuccessData({
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
          employeeId: res.data.data.employeeId,
          department: res.data.data.department,
          emailSent: res.data.emailSent,
          emailError: res.data.emailError
        });
      }
    } catch (error) {
      const msg = error.message || error.response?.data?.message || 'Failed to create employee account';
      setError(msg);
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setEmployeeId('');
    setDepartment('');
    setRole('Employee');
    setPassword('');
    setError('');
    setSuccessData(null);
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Add New Employee</h2>
        <p className="text-muted small">Register a new user in the organization and email them their portal credentials.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {successData ? (
            <div className="card shadow-lg border-0 glass-card p-5 text-center">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-4 mx-auto shadow-sm" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-person-check-fill fs-1"></i>
              </div>
              <h3 className="fw-bold mb-2 text-success">Registration Successful!</h3>
              <p className="text-secondary mb-4">The new user account has been registered in the database.</p>

              <div className="text-start mx-auto p-4 bg-light rounded shadow-inner mb-4" style={{ maxWidth: '500px' }}>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-bold text-secondary pb-2" style={{ width: '140px' }}>Name:</td>
                      <td className="fw-semibold pb-2">{successData.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-secondary pb-2">Email:</td>
                      <td className="fw-semibold pb-2">{successData.email}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-secondary pb-2">Portal Role:</td>
                      <td><span className="badge bg-secondary">{successData.role}</span></td>
                    </tr>
                    {successData.employeeId && (
                      <tr>
                        <td className="fw-bold text-secondary pb-2">Employee ID:</td>
                        <td className="fw-semibold pb-2">{successData.employeeId}</td>
                      </tr>
                    )}
                    {successData.department && (
                      <tr>
                        <td className="fw-bold text-secondary pb-2">Department:</td>
                        <td className="fw-semibold pb-2">{successData.department}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-bold text-secondary">Email Status:</td>
                      <td>
                        {successData.emailSent ? (
                          <span className="text-success fw-bold d-inline-flex align-items-center gap-1">
                            <i className="bi bi-envelope-check-fill"></i> Credentials sent via Resend API
                          </span>
                        ) : (
                          <span className="text-danger fw-bold d-inline-flex align-items-center gap-1" title={successData.emailError}>
                            <i className="bi bi-envelope-exclamation-fill"></i> Dispatch Failed (Check Logs)
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <button onClick={handleReset} className="btn btn-primary px-4">
                  Add Another Employee
                </button>
                <button onClick={() => navigate('/accounts/dashboard')} className="btn btn-outline-secondary px-4">
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="card shadow-lg border-0 glass-card p-4">
              <h5 className="fw-bold mb-4 border-bottom pb-2">
                <i className="bi bi-person-plus text-primary me-2"></i>Employee Details Form
              </h5>

              {error && (
                <div className="alert alert-danger border-0 p-3 mb-4 d-flex align-items-center gap-2 shadow-sm">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                  <div className="fw-semibold">{error}</div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email address */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. john.doe@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Employee ID */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Employee ID Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. EMP-2026-0042"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>

                  {/* Department */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  {/* Portal Role */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Portal Access Role *</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="Employee">Employee (Submit claims)</option>
                      <option value="Director">Director (Approve/Reject claims)</option>
                      <option value="Accounts">Accounts (Audit/Pay claims)</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="form-label small text-secondary fw-semibold">Password</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Leave blank to auto-generate"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="form-text small text-muted">
                      If left blank, a secure password will be generated and emailed via Resend.
                    </div>
                  </div>
                </div>

                <div className="alert alert-info border-0 p-3 mt-4 mb-4 small d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill text-info fs-5"></i>
                  <div>
                    An email containing login credentials and a sign-in link will be automatically dispatched to the specified address upon submission.
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate('/accounts/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                    style={{ background: 'var(--primary-gradient)', border: 'none' }}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    Register User
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
