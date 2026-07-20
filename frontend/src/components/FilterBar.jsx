import React, { useState } from 'react';

const FilterBar = ({ onFilter, showEmployeeFilter = true }) => {
  const [voucherNumber, setVoucherNumber] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    const activeFilters = {};
    if (voucherNumber && voucherNumber.trim()) {
      activeFilters.voucherNumber = voucherNumber.trim();
    }
    if (showEmployeeFilter && employeeName && employeeName.trim()) {
      activeFilters.employeeName = employeeName.trim();
    }
    if (department && department.trim()) {
      activeFilters.department = department.trim();
    }
    if (expenseCategory) activeFilters.expenseCategory = expenseCategory;
    if (status) activeFilters.status = status;
    if (dateFrom) activeFilters.dateFrom = dateFrom;
    if (dateTo) activeFilters.dateTo = dateTo;
    if (amountMin) activeFilters.amountMin = amountMin;
    if (amountMax) activeFilters.amountMax = amountMax;

    onFilter(activeFilters);
  };

  const handleClear = () => {
    setVoucherNumber('');
    setEmployeeName('');
    setDepartment('');
    setExpenseCategory('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    
    // Clear filters in parent
    onFilter({});
  };

  return (
    <div className="card glass-card p-3 mb-4 shadow-sm">
      <h6 className="fw-bold mb-3 d-flex align-items-center">
        <i className="bi bi-funnel-fill text-primary me-2"></i>
        Filter & Search Vouchers
      </h6>
      <form onSubmit={handleApply}>
        <div className="row g-3">
          {/* Voucher Number */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Voucher Number</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. VOU-2026-000001"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
            />
          </div>

          {/* Employee Name (conditionally shown) */}
          {showEmployeeFilter && (
            <div className="col-md-3">
              <label className="form-label small text-secondary fw-semibold">Employee Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search employee..."
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>
          )}

          {/* Department */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Department</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          {/* Expense Category */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Category</label>
            <select
              className="form-select form-select-sm"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Status</label>
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="PendingApproval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date From */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Date From</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="col-md-3">
            <label className="form-label small text-secondary fw-semibold">Date To</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Amount Range */}
          <div className="col-md-3 col-6">
            <label className="form-label small text-secondary fw-semibold">Min Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-control form-control-sm"
              placeholder="0.00"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
            />
          </div>
          
          <div className="col-md-3 col-6">
            <label className="form-label small text-secondary fw-semibold">Max Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-control form-control-sm"
              placeholder="10000.00"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={handleClear}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary btn-sm px-4">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;
