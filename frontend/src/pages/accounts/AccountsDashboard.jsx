import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AccountsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentApproved, setRecentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountsData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/dashboard/accounts');
        setStats(res.data.data.stats);
        setRecentApproved(res.data.data.recentApproved);
      } catch (error) {
        toast.error('Failed to load accounts dashboard');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Data for chart
  const chartData = [
    { name: 'Draft', value: stats.Draft, color: '#6b7280' },
    { name: 'Pending Review', value: stats.PendingApproval, color: '#f59e0b' },
    { name: 'Approved', value: stats.Approved, color: '#10b981' },
    { name: 'Rejected', value: stats.Rejected, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Accounts Reimbursement Dashboard</h2>
          <p className="text-muted small mb-0">Finance auditing, reimbursement logging, and reports</p>
        </div>
        <Link to="/accounts/vouchers" className="btn btn-primary d-flex align-items-center gap-2 mt-3 mt-sm-0" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
          <i className="bi bi-list-task"></i> Open Reimbursement Queue
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-3 p-3 me-3" style={{ background: 'var(--primary-gradient)' }}>
                <i className="bi bi-calculator fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Total Audited Claims</div>
                <div className="fs-3 fw-bold">{stats.Total}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-success text-white rounded-3 p-3 me-3">
                <i className="bi bi-wallet2 fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Total Approved Payouts</div>
                <div className="fs-3 fw-bold">₹{stats.TotalApprovedAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-warning text-dark rounded-3 p-3 me-3">
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Awaiting Approval</div>
                <div className="fs-3 fw-bold">{stats.PendingApproval}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-success text-white rounded-3 p-3 me-3">
                <i className="bi bi-check-circle fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Approved Claims</div>
                <div className="fs-3 fw-bold">{stats.Approved}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Chart */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold mb-4">Organizational Status Split</h5>
            {chartData.length > 0 ? (
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} claim(s)`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                No voucher data loaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Reimbursement List */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold mb-4">Reimbursement Queue (Recent Approved)</h5>

            {recentApproved.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Voucher</th>
                      <th>Employee</th>
                      <th>Title</th>
                      <th>Dept</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApproved.map((voucher) => (
                      <tr key={voucher._id}>
                        <td>
                          <Link to={`/accounts/vouchers/${voucher._id}`} className="fw-bold text-decoration-none">
                            {voucher.voucherNumber}
                          </Link>
                        </td>
                        <td>{voucher.employeeName}</td>
                        <td>{voucher.expenseTitle}</td>
                        <td>{voucher.departmentName}</td>
                        <td className="fw-semibold text-success">₹{voucher.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-wallet2 fs-1"></i>
                <p className="mt-2 text-dark fw-semibold">Queue Clear!</p>
                <p className="small">No approved claims are currently waiting for payout.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
