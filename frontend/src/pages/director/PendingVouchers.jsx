import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const PendingVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchPending = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/vouchers/pending?page=${page}&limit=${pagination.limit}`);
      setVouchers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load pending queue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPending(newPage);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Pending Approval Queue</h2>
        <p className="text-muted small">Claims awaiting review and authorization signature</p>
      </div>

      <div className="card glass-card border-0 shadow-sm">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : vouchers.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Voucher Number</th>
                  <th>Employee</th>
                  <th>Expense Title</th>
                  <th>Department</th>
                  <th>Expense Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="fw-bold">
                      <Link to={`/director/vouchers/${voucher._id}`} className="text-decoration-none">
                        {voucher.voucherNumber}
                      </Link>
                    </td>
                    <td>{voucher.employeeName}</td>
                    <td>{voucher.expenseTitle}</td>
                    <td>{voucher.departmentName}</td>
                    <td>{new Date(voucher.expenseDate).toLocaleDateString()}</td>
                    <td className="fw-semibold">₹{voucher.amount.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="text-end">
                      <Link to={`/director/vouchers/${voucher._id}`} className="btn btn-warning btn-sm fw-semibold text-dark">
                        <i className="bi bi-shield-check me-1"></i>Review Claim
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
            <p className="mt-2 fw-semibold">Inbox Zero!</p>
            <p className="small">No vouchers are currently pending approval.</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <nav className="d-flex justify-content-between align-items-center mt-3">
          <span className="small text-muted">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </span>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </button>
            </li>
            {[...Array(pagination.pages).keys()].map((p) => (
              <li key={p + 1} className={`page-item ${pagination.page === p + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(p + 1)}>
                  {p + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default PendingVouchers;
