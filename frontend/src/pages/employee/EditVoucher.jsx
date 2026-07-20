import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import SignaturePad from '../../components/SignaturePad';
import { toast } from 'react-toastify';

const EditVoucher = () => {
  const { id } = useParams();
  const { user, updateSignature } = useContext(AuthContext);
  const navigate = useNavigate();

  const [departmentName, setDepartmentName] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Travel');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [employeeIdCode, setEmployeeIdCode] = useState('');
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/vouchers/${id}`);
        const voucher = res.data.data;

        // Check if voucher status is Draft
        if (voucher.status !== 'Draft') {
          toast.error('Only Draft vouchers can be edited');
          navigate(`/employee/vouchers/${id}`);
          return;
        }

        // Check ownership
        if (voucher.employee.toString() !== user._id.toString()) {
          toast.error('You are not authorized to edit this voucher');
          navigate('/employee/vouchers');
          return;
        }

        setDepartmentName(voucher.departmentName);
        // Format date string to YYYY-MM-DD for date input
        const dateObj = new Date(voucher.expenseDate);
        const formattedDate = dateObj.toISOString().split('T')[0];
        setExpenseDate(formattedDate);
        setExpenseTitle(voucher.expenseTitle);
        setExpenseCategory(voucher.expenseCategory);
        setExpenseDescription(voucher.expenseDescription || '');
        setAmount(voucher.amount.toString());
        setEmployeeIdCode(voucher.employeeIdCode || '');
        setCurrentSignatureUrl(voucher.employeeSignatureUrl || '');
      } catch (error) {
        toast.error('Failed to load voucher details');
        console.error(error);
        navigate('/employee/vouchers');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id, user, navigate]);

  const handleSignatureSave = (file) => {
    setSignatureFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentName || !expenseDate || !expenseTitle || !amount) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Update text fields
      const voucherData = {
        departmentName,
        expenseDate,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        amount: parseFloat(amount),
        employeeIdCode,
      };

      await apiClient.put(`/vouchers/${id}`, voucherData);

      // 2. If new signature file captured, upload it
      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);

        const sigRes = await apiClient.post(`/vouchers/${id}/signature`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (sigRes.data.data.employeeSignatureUrl) {
          updateSignature(sigRes.data.data.employeeSignatureUrl);
        }
      }

      toast.success('Voucher updated successfully');
      navigate('/employee/vouchers');
    } catch (error) {
      toast.error(error.message || 'Failed to update voucher');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const hostUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:5050';

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Edit Voucher</h2>
        <p className="text-muted small">Update your draft expense claim information</p>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 border-0 shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Department *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Employee ID / Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={employeeIdCode}
                    onChange={(e) => setEmployeeIdCode(e.target.value)}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-secondary">Expense Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Expense Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Expense Category *</label>
                  <select
                    className="form-select"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    required
                  >
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-secondary">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-secondary">Description / Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/employee/vouchers')}
                  className="btn btn-outline-secondary px-4"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 ms-auto"
                  disabled={submitting}
                  style={{ background: 'var(--primary-gradient)', border: 'none' }}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Update Draft
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Signature Capture Column */}
        <div className="col-lg-5">
          {currentSignatureUrl && (
            <div className="card p-3 bg-white mb-3 border text-center shadow-sm">
              <label className="fw-semibold text-secondary small d-block mb-2">Current Active Signature</label>
              <div className="p-2 border rounded bg-light" style={{ maxHeight: '100px' }}>
                <img
                  src={`${hostUrl}${currentSignatureUrl}`}
                  alt="Current employee signature"
                  className="img-fluid"
                  style={{ maxHeight: '80px', objectFit: 'contain' }}
                  onError={(e) => {
                    // Fallback to text if loaded signature fails (e.g. empty seeded file)
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-muted small">No signature image cached</span>';
                  }}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <SignaturePad onSave={handleSignatureSave} label="Change / Update Signature" />
          </div>

          {signatureFile ? (
            <div className="alert alert-success d-flex align-items-center mb-0 small">
              <i className="bi bi-patch-check-fill me-2 fs-5"></i>
              New signature captured! It will be uploaded automatically when you save the changes.
            </div>
          ) : !currentSignatureUrl ? (
            <div className="alert alert-danger small mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Signature Required:</strong> You must attach your signature to this voucher before it can be submitted for approval.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EditVoucher;
