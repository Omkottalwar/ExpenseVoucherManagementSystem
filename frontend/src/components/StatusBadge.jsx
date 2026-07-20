import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Draft':
        return { bg: 'bg-secondary', label: 'Draft', icon: 'bi-pencil-fill' };
      case 'Submitted':
        return { bg: 'bg-info text-dark', label: 'Submitted', icon: 'bi-send-fill' };
      case 'PendingApproval':
        return { bg: 'bg-warning text-dark', label: 'Pending Approval', icon: 'bi-clock-history' };
      case 'Approved':
        return { bg: 'bg-success', label: 'Approved', icon: 'bi-check-circle-fill' };
      case 'Rejected':
        return { bg: 'bg-danger', label: 'Rejected', icon: 'bi-x-circle-fill' };
      default:
        return { bg: 'bg-secondary', label: status || 'Unknown', icon: 'bi-question-circle' };
    }
  };

  const { bg, label, icon } = getBadgeConfig();

  return (
    <span className={`badge ${bg} d-inline-flex align-items-center gap-1 py-2 px-3 fw-semibold`}>
      <i className={`bi ${icon} small`}></i>
      {label}
    </span>
  );
};

export default StatusBadge;
