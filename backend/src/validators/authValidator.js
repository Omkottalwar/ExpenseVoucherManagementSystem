const { body } = require('express-validator');

exports.registerRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['Employee', 'Director', 'Accounts'])
    .withMessage('Role must be either Employee, Director, or Accounts'),
  body('department')
    .optional()
    .trim(),
  body('employeeId')
    .optional()
    .trim(),
];

exports.loginRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

exports.addEmployeeRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['Employee', 'Director', 'Accounts'])
    .withMessage('Role must be either Employee, Director, or Accounts'),
  body('department')
    .optional()
    .trim(),
  body('employeeId')
    .optional()
    .trim(),
];
