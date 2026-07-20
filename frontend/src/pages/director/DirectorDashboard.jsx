import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const DirectorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/dashboard/director');
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity);
      } catch (error) {
        toast.error('Failed to load director statistics');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectorData();
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
    { name: 'Pending Review', value: stats.pendingCount, color: '#f59e0b' },
    { name: 'Approved Today', value: stats.approvedToday, color: '#10b981' },
    { name: 'Rejected Today', value: stats.rejectedToday, color: '#ef4444' },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Director Portal Dashboard</h2>
          <p className="text-muted small mb-0">Management review, audits, and approvals hub</p>
        </div>
        <Link to="/director/pending" className="btn btn-warning text-dark d-flex align-items-center gap-2 mt-3 mt-sm-0 fw-semibold">
          <i className="bi bi-clock-history"></i> Open Pending Queue ({stats.pendingCount})
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-warning text-dark rounded-3 p-3 me-3">
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Pending Approval</div>
                <div className="fs-3 fw-bold">{stats.pendingCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-3 p-3 me-3" style={{ background: 'var(--primary-gradient)' }}>
                <i className="bi bi-cash-stack fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Pending Liability</div>
                <div className="fs-3 fw-bold">₹{stats.pendingAmount.toFixed(2)}</div>
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
                <div className="text-secondary small fw-semibold">Approved Today</div>
                <div className="fs-3 fw-bold">{stats.approvedToday}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card glass-card hover-lift p-3 border-0 h-100">
            <div className="d-flex align-items-center">
              <div className="bg-danger text-white rounded-3 p-3 me-3">
                <i className="bi bi-x-octagon fs-4"></i>
              </div>
              <div>
                <div className="text-secondary small fw-semibold">Rejected Today</div>
                <div className="fs-3 fw-bold">{stats.rejectedToday}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Visual Charts */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 border-0 h-100">
            <h5 className="fw-bold mb-4">Daily Activity Overview</h5>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} claim(s)`, 'Count']} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="col-lg-7">
          <div className="card glass-card p-4 border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Recent Voucher Submissions</h5>
              <Link to="/director/vouchers" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>

            {recentActivity.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Voucher</th>
                      <th>Employee</th>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((voucher) => (
                      <tr key={voucher._id}>
                        <td>
                          <Link to={`/director/vouchers/${voucher._id}`} className="fw-bold text-decoration-none">
                            {voucher.voucherNumber}
                          </Link>
                        </td>
                        <td>{voucher.employeeName}</td>
                        <td>{voucher.expenseTitle}</td>
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
                <p className="mt-2">No recent submissions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
