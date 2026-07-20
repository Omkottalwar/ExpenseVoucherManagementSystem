const Counter = require('../models/Counter');

/**
 * Generates an atomic, unique voucher number like VOU-YYYY-XXXXXX
 * @returns {Promise<string>} The generated voucher number
 */
const generateVoucherNumber = async () => {
  const currentYear = new Date().getFullYear();
  const counterId = `voucher-${currentYear}`;

  // Find counter and increment it atomically. If doesn't exist, create it.
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Format sequence number with leading zeros (e.g., 000001, 000123)
  const formattedSeq = String(counter.seq).padStart(6, '0');
  
  return `VOU-${currentYear}-${formattedSeq}`;
};

module.exports = {
  generateVoucherNumber,
};
