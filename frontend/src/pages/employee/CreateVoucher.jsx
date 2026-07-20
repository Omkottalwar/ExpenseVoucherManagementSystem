import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import SignaturePad from '../../components/SignaturePad';
import { toast } from 'react-toastify';

const CreateVoucher = () => {
  const { user, updateSignature } = useContext(AuthContext);
  const navigate = useNavigate();

  const [departmentName, setDepartmentName] = useState(user?.department || '');
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Travel');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [employeeIdCode, setEmployeeIdCode] = useState(user?.employeeId || '');
  const [signatureFile, setSignatureFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Set local state signature file on save in child pad
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

      // 1. Create the draft voucher
      const voucherData = {
        departmentName,
        expenseDate,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        amount: parseFloat(amount),
        employeeIdCode,
      };

      const voucherRes = await apiClient.post('/vouchers', voucherData);
      const newVoucher = voucherRes.data.data;

      // 2. If a signature was provided, upload it to this voucher
      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);

        const sigRes = await apiClient.post(`/vouchers/${newVoucher._id}/signature`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Sync local signature cache in context on first signature upload
        if (sigRes.data.data.employeeSignatureUrl) {
          updateSignature(sigRes.data.data.employeeSignatureUrl);
        }
      }

      toast.success('Voucher created as Draft successfully!');
      navigate('/employee/vouchers');
    } catch (error) {
      toast.error(error.message || 'Failed to create voucher');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Create Expense Voucher</h2>
        <p className="text-muted small">File a new expense claim as Draft</p>
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
                    placeholder="e.g. Engineering"
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
                    placeholder="e.g. EMP-101"
                    value={employeeIdCode}
                    onChange={(e) => setEmployeeIdCode(e.target.value)}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-secondary">Expense Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Client lunch / Server hosting subscription"
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
                    min="0.01"
                    className="form-control"
                    placeholder="0.00"
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
                    placeholder="Provide additional details regarding the expense..."
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
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Signature Capture Column */}
        <div className="col-lg-5">
          <div className="mb-3">
            <SignaturePad onSave={handleSignatureSave} label="Employee Signature Upload / Draw *" />
          </div>
          {signatureFile ? (
            <div className="alert alert-success d-flex align-items-center mb-0 small">
              <i className="bi bi-patch-check-fill me-2 fs-5"></i>
              Signature captured! It will be uploaded automatically when you save the draft.
            </div>
          ) : (
            <div className="alert alert-danger small mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Signature Required:</strong> You must attach your signature to this voucher before it can be submitted for approval.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVoucher;
