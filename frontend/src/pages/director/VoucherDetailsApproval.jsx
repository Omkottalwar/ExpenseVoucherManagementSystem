import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import SignaturePad from '../../components/SignaturePad';
import { toast } from 'react-toastify';

const VoucherDetailsApproval = () => {
  const { id } = useParams();
  const { user, updateSignature } = useContext(AuthContext);
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Signature state
  const [signatureFile, setSignatureFile] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/vouchers/${id}`);
      setVoucher(res.data.data);
    } catch (error) {
      toast.error('Failed to load voucher details');
      console.error(error);
      navigate('/director/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherDetails();
  }, [id]);

  const handleSignatureSave = (file) => {
    setSignatureFile(file);
  };

  const handleApprove = async () => {
    // We need a signature. Check if signatureFile is captured, or if director has a profile signature, or voucher already has directorSignatureUrl
    const hasSignature = signatureFile || user.signatureUrl || voucher.directorSignatureUrl;

    if (!hasSignature) {
      toast.error('Signature is mandatory before approving a voucher');
      return;
    }

    try {
      setSubmitting(true);

      // 1. If new signature captured, upload it first
      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);
        const sigRes = await apiClient.post(`/vouchers/${id}/director-signature`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        // Update local profile signature cache if empty
        if (sigRes.data.data.directorSignatureUrl && !user.signatureUrl) {
          updateSignature(sigRes.data.data.directorSignatureUrl);
        }
      }

      // 2. Call approve endpoint
      await apiClient.patch(`/vouchers/${id}/approve`);
      toast.success('Voucher approved successfully!');
      fetchVoucherDetails(); // Refresh details
    } catch (error) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is mandatory');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/vouchers/${id}/reject`, { rejectionReason });
      toast.success('Voucher rejected successfully');
      setShowRejectModal(false);
      fetchVoucherDetails();
    } catch (error) {
      toast.error(error.message || 'Rejection failed');
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

  const isPending = voucher.status === 'PendingApproval' || voucher.status === 'Submitted';
  const isApproved = voucher.status === 'Approved';
  const isRejected = voucher.status === 'Rejected';

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4 no-print">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm me-3">
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <div>
          <h2 className="fw-bold mb-0">Review Voucher</h2>
          <span className="text-muted small">ID: {voucher.voucherNumber}</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Detail Sheet */}
        <div className="col-lg-8">
          <div className="card glass-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
              <div>
                <h4 className="fw-bold text-primary mb-1">{voucher.expenseTitle}</h4>
                <p className="text-secondary small mb-0">
                  Filed by <strong className="text-dark">{voucher.employeeName}</strong> in{' '}
                  <strong className="text-dark">{voucher.departmentName}</strong>
                </p>
              </div>
              <StatusBadge status={voucher.status} />
            </div>

            {isRejected && (
              <div className="alert alert-danger border-0 p-3 mb-4 d-flex align-items-start gap-2">
                <i className="bi bi-exclamation-octagon-fill fs-5 mt-1"></i>
                <div>
                  <h6 className="fw-bold mb-1">Rejection Reason</h6>
                  <p className="mb-0 small">{voucher.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Grid */}
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
                <span className="fw-medium">{new Date(voucher.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="col-md-12">
                <span className="text-secondary small fw-semibold d-block">Description / Remarks</span>
                <p className="bg-light p-3 rounded text-secondary small border-start border-4 border-secondary mt-1">
                  {voucher.expenseDescription || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="row g-4 border-top pt-4">
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
                        e.target.parentNode.innerHTML = '<span class="text-muted small">No signature image cached</span>';
                      }}
                    />
                  ) : (
                    <span className="text-danger small">Missing Signature</span>
                  )}
                </div>
              </div>

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
                        e.target.parentNode.innerHTML = '<span class="text-muted small">No signature image cached</span>';
                      }}
                    />
                  ) : isApproved ? (
                    <span className="text-muted small">Approved without digital signature file</span>
                  ) : (
                    <span className="text-muted small">Awaiting approval signature</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Amount & Decision Panel */}
        <div className="col-lg-4">
          {/* Amount Card */}
          <div className="card text-white p-4 border-0 mb-4 shadow-sm" style={{ background: 'var(--secondary-gradient)' }}>
            <span className="small text-white-50 uppercase fw-bold tracking-wider">Requested Claim Amount</span>
            <h2 className="display-6 fw-bold mb-0 mt-1">₹{voucher.amount.toFixed(2)}</h2>
          </div>

          {/* Decision actions panel */}
          {isPending ? (
            <div className="card glass-card p-4 border-0 shadow-sm">
              <h5 className="fw-bold mb-3">Review Panel</h5>
              
              {/* Profile signature alert */}
              {user.signatureUrl && !signatureFile && (
                <div className="alert alert-info py-2 small mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Using signature saved on your user profile.
                </div>
              )}

              {/* Signature drawing canvas */}
              {!user.signatureUrl && !signatureFile && (
                <div className="mb-3">
                  <SignaturePad onSave={handleSignatureSave} label="Director Signature Required *" />
                </div>
              )}

              {signatureFile && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="bi bi-patch-check me-1"></i>
                  Signature captured and loaded!
                </div>
              )}

              {/* Confirm draw again button */}
              {(signatureFile || user.signatureUrl) && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 mb-3"
                  onClick={() => {
                    setSignatureFile(null);
                    // Temporarily wipe user signature URL visual cue to force pad redraw
                  }}
                >
                  Change/Redraw Signature
                </button>
              )}

              <div className="d-flex flex-column gap-2 mt-2">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="btn btn-success py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  {submitting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                  Approve Claim
                </button>
                
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="btn btn-danger py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-x-lg"></i>
                  Reject Claim
                </button>
              </div>
            </div>
          ) : (
            <div className="card glass-card p-4 border-0 shadow-sm text-center">
              <h6 className="fw-bold text-secondary uppercase tracking-wider mb-2">Claim Lifecycle State</h6>
              <div className="mb-2">
                <StatusBadge status={voucher.status} />
              </div>
              <p className="small text-muted mb-0">
                {isApproved && `Approved on ${new Date(voucher.approvalDate).toLocaleDateString()}`}
                {isRejected && 'Rejected by Management'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Rejection Bootstrap Dialog Modal overlay */}
      {showRejectModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Reject Voucher Claim</h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <form onSubmit={handleReject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label small fw-semibold text-secondary">
                      Provide Rejection Reason *
                    </label>
                    <textarea
                      id="reason"
                      className="form-control"
                      rows="4"
                      placeholder="Explain why this expense claim is being rejected (e.g. missing receipts, policy violations)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-danger">
                    {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetailsApproval;
