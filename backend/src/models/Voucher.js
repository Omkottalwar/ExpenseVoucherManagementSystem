const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
    },
    voucherDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
    },
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    expenseTitle: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    expenseCategory: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Other'],
    },
    expenseDescription: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeIdCode: {
      type: String,
      trim: true,
    },
    employeeSignatureUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'PendingApproval', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    directorSignatureUrl: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Voucher', voucherSchema);
