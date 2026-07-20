import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await apiClient.get('/dashboard/employee');
        setStats(statsRes.data.data);

        // Fetch recent vouchers (page=1, limit=5)
        const vouchersRes = await apiClient.get('/vouchers/my?limit=5');
        setRecentVouchers(vouchersRes.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    { name: 'Pending Approval', value: stats.PendingApproval, color: '#f59e0b' },
    { name: 'Approved', value: stats.Approved, color: '#10b981' },
    { name: 'Rejected', value: stats.Rejected, color: '#ef4444' },
  ].filter((item) => item.value > 0); // Only show items with values > 0

  return (
    <div className="container py-4">
      {/* Welcome header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user.name}!</h2>
          <p className="text-muted small mb-0">Track and submit your expense claims here.</p>
        </div>
        <Link
          to="/employee/vouchers/new"
          className="btn btn-primary d-flex align-items-center gap-2 mt-3 mt-sm-0"
          style={{ background: 'var(--primary-gradient)', border: 'none' }}
        >
          <i className="bi bi-plus-circle"></i> Create New Voucher
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-3 p-3 me-3" style={{ background: 'var(--primary-gradient)' }}>
                <i className="bi bi-files fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Total Claims</div>
                <div className="fs-3 fw-bold">{stats.Total}</div>
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
                <div className="text-secondary small fw-semibold">Pending Approval</div>
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
                <div className="text-secondary small fw-semibold">Total Approved</div>
                <div className="fs-3 fw-bold">₹{stats.TotalApprovedAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-danger text-white rounded-3 p-3 me-3">
                <i className="bi bi-x-circle fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Total Rejected</div>
                <div className="fs-3 fw-bold">{stats.Rejected}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Recent Activity */}
      <div className="row g-4">
        {/* Chart Card */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold mb-4">Claim Status Distribution</h5>
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
                No voucher data available for visualization.
              </div>
            )}
          </div>
        </div>

        {/* Recent Claims List */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <Link to="/employee/vouchers" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>

            {recentVouchers.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Voucher ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVouchers.map((voucher) => (
                      <tr key={voucher._id}>
                        <td>
                          <Link to={`/employee/vouchers/${voucher._id}`} className="fw-bold text-decoration-none">
                            {voucher.voucherNumber}
                          </Link>
                        </td>
                        <td>{voucher.expenseTitle}</td>
                        <td>{voucher.expenseCategory}</td>
                        <td className="fw-semibold">₹{voucher.amount.toFixed(2)}</td>
                        <td>
                          <StatusBadge status={voucher.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1"></i>
                <p className="mt-2">No vouchers created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
