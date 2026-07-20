const { body } = require('express-validator');

exports.createVoucherRules = [
  body('departmentName')
    .notEmpty()
    .withMessage('Department is mandatory')
    .trim(),
  body('expenseTitle')
    .notEmpty()
    .withMessage('Expense Title is mandatory')
    .trim(),
  body('expenseDate')
    .notEmpty()
    .withMessage('Expense Date is mandatory')
    .isISO8601()
    .withMessage('Expense Date must be a valid date'),
  body('expenseCategory')
    .isIn(['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Other'])
    .withMessage('Invalid expense category'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is mandatory')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  body('expenseDescription')
    .optional()
    .trim(),
  body('employeeIdCode')
    .optional()
    .trim(),
];

exports.updateVoucherRules = [
  body('departmentName')
    .optional()
    .notEmpty()
    .withMessage('Department is mandatory')
    .trim(),
  body('expenseTitle')
    .optional()
    .notEmpty()
    .withMessage('Expense Title is mandatory')
    .trim(),
  body('expenseDate')
    .optional()
    .notEmpty()
    .withMessage('Expense Date is mandatory')
    .isISO8601()
    .withMessage('Expense Date must be a valid date'),
  body('expenseCategory')
    .optional()
    .isIn(['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Other'])
    .withMessage('Invalid expense category'),
  body('amount')
    .optional()
    .notEmpty()
    .withMessage('Amount is mandatory')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),
  body('expenseDescription')
    .optional()
    .trim(),
  body('employeeIdCode')
    .optional()
    .trim(),
];

exports.rejectRules = [
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection Reason is mandatory')
    .trim(),
];
