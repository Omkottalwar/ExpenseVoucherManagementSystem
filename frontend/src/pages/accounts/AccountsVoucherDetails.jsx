import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const AccountsVoucherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/vouchers/${id}`);
      setVoucher(res.data.data);
    } catch (error) {
      toast.error('Failed to load voucher details');
      console.error(error);
      navigate('/accounts/vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
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

  const isApproved = voucher.status === 'Approved';
  const isRejected = voucher.status === 'Rejected';

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4 no-print">
        <div className="d-flex align-items-center">
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm me-3">
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <div>
            <h2 className="fw-bold mb-0 fs-3 fs-md-2">Expense Voucher</h2>
            <span className="text-muted small">Number: {voucher.voucherNumber}</span>
          </div>
        </div>
        <button onClick={handlePrint} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <i className="bi bi-printer"></i> Export / Print Voucher
        </button>
      </div>

      {/* Printable Area Wrapper */}
      <div className="row g-4 print-area">
        {/* Main Details Sheet */}
        <div className="col-lg-8 print-width-100">
          <div className="card glass-card p-4 border shadow-sm">
            {/* Print Header */}
            <div className="d-none print-only mb-4 border-bottom pb-3">
              <div className="row">
                <div className="col-6">
                  <h3 className="fw-bold text-dark mb-1">EXPENSE VOUCHER REPORT</h3>
                  <span className="text-muted small">Voucher Number: {voucher.voucherNumber}</span>
                </div>
                <div className="col-6 text-end">
                  <span className="small text-muted d-block">Generated: {new Date().toLocaleDateString()}</span>
                  <span className="small text-muted d-block">Department: {voucher.departmentName}</span>
                </div>
              </div>
            </div>

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
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Department Name</span>
                <span className="fw-medium">{voucher.departmentName}</span>
              </div>
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Employee ID Code</span>
                <span className="fw-medium">{voucher.employeeIdCode || 'N/A'}</span>
              </div>
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Expense Date</span>
                <span className="fw-medium">{new Date(voucher.expenseDate).toLocaleDateString()}</span>
              </div>
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Submission Date</span>
                <span className="fw-medium">{new Date(voucher.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Total Claim Amount</span>
                <span className="fw-semibold text-success">₹{voucher.amount.toFixed(2)}</span>
              </div>
              <div className="col-sm-6 col-6">
                <span className="text-secondary small fw-semibold d-block">Audit Status</span>
                <span className="fw-semibold text-uppercase">{voucher.status}</span>
              </div>
              <div className="col-md-12 col-12">
                <span className="text-secondary small fw-semibold d-block">Description / Remarks</span>
                <p className="bg-light p-3 rounded text-secondary small border-start border-4 border-secondary mt-1">
                  {voucher.expenseDescription || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="row g-4 border-top pt-4">
              <div className="col-sm-6 col-6">
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
                    <span className="text-muted small">No signature uploaded</span>
                  )}
                </div>
              </div>

              <div className="col-sm-6 col-6">
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
                    <span className="text-muted small">Awaiting review signature</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Amount Summary */}
        <div className="col-lg-4 no-print-sidebar">
          {/* Amount Card */}
          <div className="card text-white p-4 border-0 mb-4 shadow-sm" style={{ background: 'var(--secondary-gradient)' }}>
            <span className="small text-white-50 uppercase fw-bold tracking-wider">Total Claim Amount</span>
            <h2 className="display-6 fw-bold mb-0 mt-1">₹{voucher.amount.toFixed(2)}</h2>
          </div>

          <div className="card glass-card p-4 border-0 shadow-sm text-center">
            <h6 className="fw-bold text-secondary uppercase tracking-wider mb-2">Audit Status</h6>
            <div className="mb-2">
              <StatusBadge status={voucher.status} />
            </div>
            <p className="small text-muted mb-0">
              {isApproved && `Reimbursement Authorized on ${new Date(voucher.approvalDate).toLocaleDateString()}`}
              {isRejected && 'Claim Audited & Rejected'}
              {!isApproved && !isRejected && 'Awaiting review verification'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsVoucherDetails;
