const Voucher = require('../models/Voucher');
const User = require('../models/User');
const { generateVoucherNumber } = require('../services/voucherNumberService');
const path = require('path');
const fs = require('fs');

/**
 * Reusable Query Builder for Vouchers
 * @param {Object} queryParams Request query parameters
 * @param {Object} baseFilter Initial filter (e.g. employeeId for employees)
 */
const buildVoucherQuery = (queryParams, baseFilter = {}) => {
  const filter = { ...baseFilter };

  // Partial search on Voucher Number
  if (queryParams.voucherNumber) {
    filter.voucherNumber = { $regex: queryParams.voucherNumber, $options: 'i' };
  }

  // Partial search on Employee Name
  if (queryParams.employeeName) {
    filter.employeeName = { $regex: queryParams.employeeName, $options: 'i' };
  }

  // Exact or partial search on Department
  if (queryParams.department) {
    filter.departmentName = { $regex: queryParams.department, $options: 'i' };
  }

  // Exact match on Category
  if (queryParams.expenseCategory) {
    filter.expenseCategory = queryParams.expenseCategory;
  }

  // Exact match on Status
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  // Date filter on expenseDate
  if (queryParams.expenseDate) {
    const searchDate = new Date(queryParams.expenseDate);
    const dateStr = searchDate.toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    filter.expenseDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  } else if (queryParams.dateFrom || queryParams.dateTo) {
    filter.expenseDate = {};
    if (queryParams.dateFrom) {
      filter.expenseDate.$gte = new Date(queryParams.dateFrom);
    }
    if (queryParams.dateTo) {
      filter.expenseDate.$lte = new Date(queryParams.dateTo);
    }
  }

  // Amount range filter
  if (queryParams.amountMin || queryParams.amountMax) {
    filter.amount = {};
    if (queryParams.amountMin) {
      filter.amount.$gte = parseFloat(queryParams.amountMin);
    }
    if (queryParams.amountMax) {
      filter.amount.$lte = parseFloat(queryParams.amountMax);
    }
  }

  // Sorting
  const sortBy = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Pagination
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { filter, sort, page, limit, skip };
};

// ==========================================
// EMPLOYEE VOUCHER CONTROLLERS
// ==========================================

// @desc    Create a new voucher (defaults to Draft)
// @route   POST /api/v1/vouchers
// @access  Private (Employee)
exports.createVoucher = async (req, res) => {
  try {
    const {
      expenseDate,
      departmentName,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeIdCode,
    } = req.body;

    const voucherNumber = await generateVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      expenseDate,
      departmentName,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeIdCode,
      employee: req.user._id,
      employeeName: req.user.name,
      // Signature must be explicitly uploaded per voucher — never auto-copy from profile
      employeeSignatureUrl: '',
      status: 'Draft',
    });

    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Edit a voucher (only if Draft and owned by requester)
// @route   PUT /api/v1/vouchers/:id
// @access  Private (Employee)
exports.updateVoucher = async (req, res) => {
  try {
    let voucher = await Voucher.findById(req.id || req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this voucher' });
    }

    // Status check (only Draft is editable)
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Vouchers can only be modified while in Draft status',
      });
    }

    const updateFields = {
      expenseDate: req.body.expenseDate || voucher.expenseDate,
      departmentName: req.body.departmentName || voucher.departmentName,
      expenseTitle: req.body.expenseTitle || voucher.expenseTitle,
      expenseCategory: req.body.expenseCategory || voucher.expenseCategory,
      expenseDescription: req.body.expenseDescription || voucher.expenseDescription,
      amount: req.body.amount || voucher.amount,
      employeeIdCode: req.body.employeeIdCode || voucher.employeeIdCode,
      updatedAt: Date.now(),
    };

    voucher = await Voucher.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a voucher (only if Draft and owned by requester)
// @route   DELETE /api/v1/vouchers/:id
// @access  Private (Employee)
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this voucher' });
    }

    // Status check
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Vouchers can only be deleted while in Draft status',
      });
    }

    await voucher.deleteOne();

    res.status(200).json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload employee signature
// @route   POST /api/v1/vouchers/:id/signature
// @access  Private (Employee)
exports.uploadEmployeeSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a signature image' });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this voucher' });
    }

    // Status check
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload signatures to a submitted or reviewed voucher',
      });
    }

    // Save signature URL
    const signaturePath = `/uploads/signatures/${req.file.filename}`;
    voucher.employeeSignatureUrl = signaturePath;
    await voucher.save();

    // Also update user's profile signature URL if they don't have one
    if (!req.user.signatureUrl) {
      await User.findByIdAndUpdate(req.user._id, { signatureUrl: signaturePath });
    }

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit a voucher (Draft -> PendingApproval)
// @route   PATCH /api/v1/vouchers/:id/submit
// @access  Private (Employee)
exports.submitVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ownership check
    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this voucher' });
    }

    // Status check
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Voucher is already in '${voucher.status}' status and cannot be submitted again`,
      });
    }

    // Employee signature validation — must be explicitly uploaded, not empty or whitespace
    if (!voucher.employeeSignatureUrl || !voucher.employeeSignatureUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Signature not attached. Please attach signature before submitting for approval.',
      });
    }

    voucher.status = 'PendingApproval'; // Transition Draft -> PendingApproval (workflow queue)
    await voucher.save();

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    List vouchers created by the logged-in employee (supports pagination/filtering)
// @route   GET /api/v1/vouchers/my
// @access  Private (Employee)
exports.getMyVouchers = async (req, res) => {
  try {
    const { filter, sort, page, limit, skip } = buildVoucherQuery(req.query, {
      employee: req.user._id,
    });

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: vouchers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    View single voucher details (checks role authorization)
// @route   GET /api/v1/vouchers/:id
// @access  Private (Employee, Director, Accounts)
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Role-based view authorization
    if (req.user.role === 'Employee' && voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own vouchers',
      });
    }

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// DIRECTOR CONTROLLERS
// ==========================================

// @desc    List all organization-wide vouchers (search, filter, sort, paginate)
// @route   GET /api/v1/vouchers
// @access  Private (Director, Accounts)
exports.getAllVouchers = async (req, res) => {
  try {
    const { filter, sort, page, limit, skip } = buildVoucherQuery(req.query);

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: vouchers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    List vouchers pending approval (Submitted/PendingApproval status)
// @route   GET /api/v1/vouchers/pending
// @access  Private (Director)
exports.getPendingVouchers = async (req, res) => {
  try {
    const queryParams = { ...req.query, status: 'PendingApproval' };
    const { filter, sort, page, limit, skip } = buildVoucherQuery(queryParams);

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: vouchers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload director signature to a voucher
// @route   POST /api/v1/vouchers/:id/director-signature
// @access  Private (Director)
exports.uploadDirectorSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a signature image' });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Only allow signatures for pending approval state
    if (voucher.status !== 'PendingApproval' && voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload director signature for vouchers that are not pending review',
      });
    }

    const signaturePath = `/uploads/signatures/${req.file.filename}`;
    voucher.directorSignatureUrl = signaturePath;
    await voucher.save();

    // Also update director's profile signature URL if they don't have one
    if (!req.user.signatureUrl) {
      await User.findByIdAndUpdate(req.user._id, { signatureUrl: signaturePath });
    }

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve voucher (sets Approved, approvalDate, reviewedBy)
// @route   PATCH /api/v1/vouchers/:id/approve
// @access  Private (Director)
exports.approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ensure status transitions only from PendingApproval / Submitted
    if (voucher.status !== 'PendingApproval' && voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Voucher is currently in '${voucher.status}' status and cannot be approved`,
      });
    }

    // Check for director signature on the voucher. If missing, check director user profile signature.
    // If director user has a signature on profile, copy it. Else, fail.
    if (!voucher.directorSignatureUrl) {
      if (req.user.signatureUrl) {
        voucher.directorSignatureUrl = req.user.signatureUrl;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Director signature is mandatory before approving a voucher',
        });
      }
    }

    voucher.status = 'Approved';
    voucher.approvalDate = new Date();
    voucher.reviewedBy = req.user._id;
    await voucher.save();

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject voucher (requires rejectionReason)
// @route   PATCH /api/v1/vouchers/:id/reject
// @access  Private (Director)
exports.rejectVoucher = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Ensure status transitions only from PendingApproval / Submitted
    if (voucher.status !== 'PendingApproval' && voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Voucher is currently in '${voucher.status}' status and cannot be rejected`,
      });
    }

    voucher.status = 'Rejected';
    voucher.rejectionReason = rejectionReason;
    voucher.reviewedBy = req.user._id;
    await voucher.save();

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
