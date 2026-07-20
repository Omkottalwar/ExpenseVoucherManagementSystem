const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Enable CORS (automatically strip any trailing slash from CLIENT_URL)
const allowedOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/$/, '')
  : 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve signature uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Root route placeholder
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Expense Voucher Management API' });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
