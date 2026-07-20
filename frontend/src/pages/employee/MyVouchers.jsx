import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import FilterBar from '../../components/FilterBar';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const MyVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchVouchers = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      // Map filters into query string
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...currentFilters,
      });

      const res = await apiClient.get(`/vouchers/my?${params.toString()}`);
      setVouchers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load vouchers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(1);
  }, []);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchVouchers(1, newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchVouchers(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft voucher?')) return;

    try {
      await apiClient.delete(`/vouchers/${id}`);
      toast.success('Voucher deleted successfully');
      fetchVouchers(pagination.page); // Refresh current page
    } catch (error) {
      toast.error(error.message || 'Delete operation failed');
    }
  };

  const handleSubmit = async (id, hasSignature) => {
    if (!hasSignature) {
      toast.error('Signature not attached. Please attach signature before submitting for approval.');
      return;
    }

    if (!window.confirm('Submit this voucher for approval? Once submitted, you can no longer edit it.')) return;

    try {
      await apiClient.patch(`/vouchers/${id}/submit`);
      toast.success('Voucher submitted successfully!');
      fetchVouchers(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Expense Vouchers</h2>
          <p className="text-muted small mb-0">View, edit, and track status of your expense claims</p>
        </div>
        <Link
          to="/employee/vouchers/new"
          className="btn btn-primary d-flex align-items-center gap-2"
          style={{ background: 'var(--primary-gradient)', border: 'none' }}
        >
          <i className="bi bi-plus-circle"></i> Create Voucher
        </Link>
      </div>

      {/* Reusable Filter panel */}
      <FilterBar onFilter={handleFilter} showEmployeeFilter={false} />

      {/* Vouchers Table */}
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
                  <th>Expense Title</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="fw-bold">
                      <Link to={`/employee/vouchers/${voucher._id}`} className="text-decoration-none">
                        {voucher.voucherNumber}
                      </Link>
                    </td>
                    <td>{voucher.expenseTitle}</td>
                    <td>{voucher.departmentName}</td>
                    <td>{new Date(voucher.expenseDate).toLocaleDateString()}</td>
                    <td>{voucher.expenseCategory}</td>
                    <td className="fw-semibold">₹{voucher.amount.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <Link to={`/employee/vouchers/${voucher._id}`} className="btn btn-outline-secondary btn-sm" title="View details">
                          <i className="bi bi-eye"></i>
                        </Link>
                        {voucher.status === 'Draft' ? (
                          <>
                            <Link to={`/employee/vouchers/${voucher._id}/edit`} className="btn btn-outline-primary btn-sm" title="Edit draft">
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              onClick={() => handleSubmit(voucher._id, !!voucher.employeeSignatureUrl)}
                              className={`btn btn-sm ${voucher.employeeSignatureUrl ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                              title={voucher.employeeSignatureUrl ? 'Submit for Approval' : 'Signature not attached — attach signature before submitting'}
                            >
                              <i className="bi bi-send"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(voucher._id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete voucher"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1"></i>
            <p className="mt-2">No matching vouchers found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <nav className="d-flex justify-content-between align-items-center mt-3 no-print">
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

export default MyVouchers;
