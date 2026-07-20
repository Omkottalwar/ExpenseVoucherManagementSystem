const express = require('express');
const router = express.Router();
const {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  uploadEmployeeSignature,
  submitVoucher,
  getMyVouchers,
  getVoucherById,
  getAllVouchers,
  getPendingVouchers,
  uploadDirectorSignature,
  approveVoucher,
  rejectVoucher,
} = require('../controllers/voucherController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { createVoucherRules, updateVoucherRules, rejectRules } = require('../validators/voucherValidator');
const validate = require('../middleware/validate');

// ALL routes below are private (require authentication)
router.use(authenticate);

// Specific GET routes (Must be defined BEFORE dynamic /:id route)
router.get('/my', authorize(['Employee']), getMyVouchers);
router.get('/pending', authorize(['Director']), getPendingVouchers);
router.get('/', authorize(['Director', 'Accounts']), getAllVouchers);

// Dynamic/Param GET routes
router.get('/:id', authorize(['Employee', 'Director', 'Accounts']), getVoucherById);

// Employee CRUD and upload/submit
router.post('/', authorize(['Employee']), createVoucherRules, validate, createVoucher);
router.put('/:id', authorize(['Employee']), updateVoucherRules, validate, updateVoucher);
router.delete('/:id', authorize(['Employee']), deleteVoucher);
router.post('/:id/signature', authorize(['Employee']), upload.single('signature'), uploadEmployeeSignature);
router.patch('/:id/submit', authorize(['Employee']), submitVoucher);

// Director approval/rejection and signature upload
router.post('/:id/director-signature', authorize(['Director']), upload.single('signature'), uploadDirectorSignature);
router.patch('/:id/approve', authorize(['Director']), approveVoucher);
router.patch('/:id/reject', authorize(['Director']), rejectRules, validate, rejectVoucher);

module.exports = router;
