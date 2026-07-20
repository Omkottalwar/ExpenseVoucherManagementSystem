const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, addEmployee, forgotPassword, resetPassword } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { registerRules, loginRules, addEmployeeRules } = require('../validators/authValidator');
const validate = require('../middleware/validate');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Private routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

// Accounts specific employee creation
router.post('/add-employee', authenticate, authorize(['Accounts']), addEmployeeRules, validate, addEmployee);

module.exports = router;
