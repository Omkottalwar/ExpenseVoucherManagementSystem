import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import FilterBar from '../../components/FilterBar';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const AccountsAllVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchVouchers = async (page = 1, currentFilters = filters, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        ...currentFilters,
      });

      const res = await apiClient.get(`/vouchers?${params.toString()}`);
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
    fetchVouchers(1, newFilters, sortBy, sortOrder);
  };

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);
    fetchVouchers(1, filters, column, newOrder);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchVouchers(newPage);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <i className="bi bi-arrow-down-up text-muted small ms-1"></i>;
    return sortOrder === 'asc' ? (
      <i className="bi bi-sort-up text-primary small ms-1"></i>
    ) : (
      <i className="bi bi-sort-down text-primary small ms-1"></i>
    );
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Company Expense Vouchers</h2>
        <p className="text-muted small">Search, filter, and sort every voucher filed in the organization</p>
      </div>

      {/* Filter panel */}
      <FilterBar onFilter={handleFilter} showEmployeeFilter={true} />

      {/* Table */}
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
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('voucherNumber')}>
                    Voucher ID {getSortIcon('voucherNumber')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('employeeName')}>
                    Employee {getSortIcon('employeeName')}
                  </th>
                  <th>Title</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('departmentName')}>
                    Department {getSortIcon('departmentName')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('expenseDate')}>
                    Date {getSortIcon('expenseDate')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                    Amount {getSortIcon('amount')}
                  </th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td className="fw-bold">{voucher.voucherNumber}</td>
                    <td>{voucher.employeeName}</td>
                    <td>{voucher.expenseTitle}</td>
                    <td>{voucher.departmentName}</td>
                    <td>{new Date(voucher.expenseDate).toLocaleDateString()}</td>
                    <td className="fw-semibold">₹{voucher.amount.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="text-end">
                      <Link to={`/accounts/vouchers/${voucher._id}`} className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-eye me-1"></i>View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1"></i>
            <p className="mt-2">No matching vouchers found in the database.</p>
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

export default AccountsAllVouchers;
