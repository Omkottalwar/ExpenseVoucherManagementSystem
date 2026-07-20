const express = require('express');
const router = express.Router();
const {
  getEmployeeDashboard,
  getDirectorDashboard,
  getAccountsDashboard,
} = require('../controllers/dashboardController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Secure all dashboard endpoints
router.use(authenticate);

router.get('/employee', authorize(['Employee']), getEmployeeDashboard);
router.get('/director', authorize(['Director']), getDirectorDashboard);
router.get('/accounts', authorize(['Accounts']), getAccountsDashboard);

module.exports = router;
