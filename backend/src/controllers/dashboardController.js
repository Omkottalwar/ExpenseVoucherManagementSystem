const Voucher = require('../models/Voucher');

// Helper to get start and end of today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get Employee Dashboard statistics
// @route   GET /api/v1/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Status counts
    const statusCounts = await Voucher.aggregate([
      { $match: { employee: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
      Draft: 0,
      PendingApproval: 0,
      Approved: 0,
      Rejected: 0,
      Total: 0,
      TotalApprovedAmount: 0,
      TotalClaimedAmount: 0,
    };

    statusCounts.forEach((item) => {
      if (stats.hasOwnProperty(item._id)) {
        stats[item._id] = item.count;
      }
      stats.Total += item.count;
    });

    // Amounts sum
    const amountSums = await Voucher.aggregate([
      { $match: { employee: userId } },
      {
        $group: {
          _id: null,
          totalClaimed: { $sum: '$amount' },
          totalApproved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    if (amountSums.length > 0) {
      stats.TotalClaimedAmount = amountSums[0].totalClaimed;
      stats.TotalApprovedAmount = amountSums[0].totalApproved;
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Director Dashboard statistics
// @route   GET /api/v1/dashboard/director
// @access  Private (Director)
exports.getDirectorDashboard = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    // 1. Counts and Pending Amount
    const aggregations = await Voucher.aggregate([
      {
        $facet: {
          pendingCount: [
            { $match: { status: { $in: ['PendingApproval', 'Submitted'] } } },
            { $count: 'count' },
          ],
          pendingAmount: [
            { $match: { status: { $in: ['PendingApproval', 'Submitted'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ],
          approvedToday: [
            {
              $match: {
                status: 'Approved',
                approvalDate: { $gte: start, $lte: end },
              },
            },
            { $count: 'count' },
          ],
          rejectedToday: [
            {
              $match: {
                status: 'Rejected',
                updatedAt: { $gte: start, $lte: end },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const stats = {
      pendingCount: aggregations[0].pendingCount[0]?.count || 0,
      pendingAmount: aggregations[0].pendingAmount[0]?.total || 0,
      approvedToday: aggregations[0].approvedToday[0]?.count || 0,
      rejectedToday: aggregations[0].rejectedToday[0]?.count || 0,
    };

    // 2. Recent activity (last 10 vouchers submitted/approved/rejected)
    const recentActivity = await Voucher.find({
      status: { $ne: 'Draft' },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('voucherNumber employeeName expenseTitle amount status updatedAt');

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Accounts Dashboard statistics
// @route   GET /api/v1/dashboard/accounts
// @access  Private (Accounts)
exports.getAccountsDashboard = async (req, res) => {
  try {
    // 1. Status counts and totals
    const statusCounts = await Voucher.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
      Draft: 0,
      PendingApproval: 0,
      Approved: 0,
      Rejected: 0,
      Total: 0,
      TotalApprovedAmount: 0,
    };

    statusCounts.forEach((item) => {
      if (stats.hasOwnProperty(item._id)) {
        stats[item._id] = item.count;
      }
      stats.Total += item.count;
    });

    // Sum of approved amounts
    const approvedSum = await Voucher.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    stats.TotalApprovedAmount = approvedSum[0]?.total || 0;

    // 2. Recent Approved Vouchers (last 10 approved)
    const recentApproved = await Voucher.find({ status: 'Approved' })
      .sort({ approvalDate: -1 })
      .limit(10)
      .select('voucherNumber employeeName expenseTitle amount approvalDate departmentName');

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
