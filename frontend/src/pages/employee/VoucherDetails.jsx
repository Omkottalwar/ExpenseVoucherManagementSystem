import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const VoucherDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/vouchers/${id}`);
      setVoucher(res.data.data);
    } catch (error) {
      toast.error('Failed to load voucher details');
      console.error(error);
      navigate('/employee/vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherDetails();
  }, [id]);

  const handleSubmit = async () => {
    if (!voucher.employeeSignatureUrl) {
      toast.error('Signature not attached. Please attach signature before submitting for approval.');
      return;
    }

    if (!window.confirm('Submit this voucher for approval? Once submitted, it will be read-only.')) return;

    try {
      setSubmitting(true);
      await apiClient.patch(`/vouchers/${id}/submit`);
      toast.success('Voucher submitted successfully!');
      fetchVoucherDetails(); // Reload details
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this draft voucher?')) return;

    try {
      await apiClient.delete(`/vouchers/${id}`);
      toast.success('Voucher deleted successfully');
      navigate('/employee/vouchers');
    } catch (error) {
      toast.error(error.message || 'Delete failed');
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

  // Calculate timeline steps
  const isDraft = voucher.status === 'Draft';
  const isPending = voucher.status === 'PendingApproval' || voucher.status === 'Submitted';
  const isApproved = voucher.status === 'Approved';
  const isRejected = voucher.status === 'Rejected';

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4 no-print">
        <button onClick={() => navigate('/employee/vouchers')} className="btn btn-outline-secondary btn-sm me-3">
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <div>
          <h2 className="fw-bold mb-0">Voucher Details</h2>
          <span className="text-muted small">Number: {voucher.voucherNumber}</span>
        </div>
        <div className="ms-auto d-inline-flex gap-2">
          {isDraft && (
            <>
              <Link to={`/employee/vouchers/${voucher._id}/edit`} className="btn btn-primary btn-sm">
                <i className="bi bi-pencil me-1"></i>Edit Draft
              </Link>
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-success btn-sm">
                <i className="bi bi-send me-1"></i>Submit for Approval
              </button>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Main Details Sheet */}
        <div className="col-lg-8">
          <div className="card glass-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
              <div>
                <h4 className="fw-bold text-primary mb-1">{voucher.expenseTitle}</h4>
                <p className="text-secondary small mb-0">Category: <strong className="text-dark">{voucher.expenseCategory}</strong></p>
              </div>
              <StatusBadge status={voucher.status} />
            </div>

            {/* Rejection alert */}
            {isRejected && (
              <div className="alert alert-danger border-0 p-3 mb-4 d-flex align-items-start gap-2">
                <i className="bi bi-exclamation-octagon-fill fs-5 mt-1"></i>
                <div>
                  <h6 className="fw-bold mb-1">Rejection Reason</h6>
                  <p className="mb-0 small">{voucher.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Voucher Details Grid */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <span className="text-secondary small fw-semibold d-block">Department Name</span>
                <span className="fw-medium">{voucher.departmentName}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-secondary small fw-semibold d-block">Employee ID Code</span>
                <span className="fw-medium">{voucher.employeeIdCode || 'N/A'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-secondary small fw-semibold d-block">Expense Date</span>
                <span className="fw-medium">{new Date(voucher.expenseDate).toLocaleDateString()}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-secondary small fw-semibold d-block">Submission Date</span>
                <span className="fw-medium">
                  {isDraft ? 'Not submitted yet' : new Date(voucher.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="col-md-12">
                <span className="text-secondary small fw-semibold d-block">Description / Remarks</span>
                <p className="bg-light p-3 rounded text-secondary small border-start border-4 border-secondary mt-1">
                  {voucher.expenseDescription || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Signatures Row */}
            <div className="row g-4 border-top pt-4">
              {/* Employee signature */}
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary d-block">Employee Signature</label>
                <div className="p-3 border rounded bg-light text-center" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {voucher.employeeSignatureUrl ? (
                    <img
                      src={`${hostUrl}${voucher.employeeSignatureUrl}`}
                      alt="Employee signature"
                      style={{ maxHeight: '80px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span class="text-muted small">Signature cache failed</span>';
                      }}
                    />
                  ) : (
                    <span className="text-muted small">No signature uploaded</span>
                  )}
                </div>
              </div>

              {/* Director signature */}
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary d-block">Director Signature</label>
                <div className="p-3 border rounded bg-light text-center" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {voucher.directorSignatureUrl ? (
                    <img
                      src={`${hostUrl}${voucher.directorSignatureUrl}`}
                      alt="Director signature"
                      style={{ maxHeight: '80px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span class="text-muted small">Signature cache failed</span>';
                      }}
                    />
                  ) : isApproved ? (
                    <span className="text-muted small">Approved without digital image</span>
                  ) : (
                    <span className="text-muted small">Awaiting review signature</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Status Timeline & Amount */}
        <div className="col-lg-4">
          {/* Amount Card */}
          <div className="card text-white p-4 border-0 mb-4 shadow-sm" style={{ background: 'var(--secondary-gradient)' }}>
            <span className="small text-white-50 uppercase fw-bold tracking-wider">Total Claim Amount</span>
            <h2 className="display-6 fw-bold mb-0 mt-1">₹{voucher.amount.toFixed(2)}</h2>
          </div>

          {/* Workflow Timeline */}
          <div className="card glass-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-4">Voucher Lifecycle</h5>
            <div className="d-flex flex-column gap-3">
              {/* Draft step */}
              <div className="timeline-item">
                <div className="timeline-marker bg-success"></div>
                <div className="fw-semibold small">1. Draft Created</div>
                <div className="text-muted small">Initial state on voucher save.</div>
              </div>

              {/* Submitted step */}
              <div className="timeline-item">
                <div className={`timeline-marker ${!isDraft ? 'bg-success' : 'bg-secondary'}`}></div>
                <div className="fw-semibold small">2. Submitted for Approval</div>
                <div className="text-muted small">Moved to Director's review queue.</div>
              </div>

              {/* Approval/Rejection step */}
              <div className="timeline-item">
                <div className={`timeline-marker ${isApproved ? 'bg-success' : isRejected ? 'bg-danger' : 'bg-secondary'}`}></div>
                <div className="fw-semibold small">3. Final Decision</div>
                <div className="text-muted small">
                  {isApproved && 'Approved by Director for payout.'}
                  {isRejected && 'Rejected by Director.'}
                  {isPending && 'Awaiting review from management.'}
                  {isDraft && 'Submit to trigger review.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetails;
