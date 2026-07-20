require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const User = require('./src/models/User');
const Voucher = require('./src/models/Voucher');
const Counter = require('./src/models/Counter');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Voucher.deleteMany();
    await Counter.deleteMany();
    console.log('Cleared existing database entries.');

    // Seed Users
    const users = await User.create([
      {
        name: 'Jane Director',
        email: 'director@company.com',
        password: 'Password123',
        role: 'Director',
        department: 'Management',
        employeeId: 'EMP-001',
      },
      {
        name: 'Bob Accountant',
        email: 'accounts@company.com',
        password: 'Password123',
        role: 'Accounts',
        department: 'Finance',
        employeeId: 'EMP-002',
      },
      {
        name: 'Alice Employee One',
        email: 'employee1@company.com',
        password: 'Password123',
        role: 'Employee',
        department: 'Engineering',
        employeeId: 'EMP-101',
        signatureUrl: '/uploads/signatures/seeded-alice-sig.png', // Pre-populated mock signature path
      },
      {
        name: 'Charlie Employee Two',
        email: 'employee2@company.com',
        password: 'Password123',
        role: 'Employee',
        department: 'Sales',
        employeeId: 'EMP-102',
        signatureUrl: '',
      },
      {
        name: 'David Employee Three',
        email: 'employee3@company.com',
        password: 'Password123',
        role: 'Employee',
        department: 'Marketing',
        employeeId: 'EMP-103',
        signatureUrl: '',
      },
      {
        name: 'Om Kottalwar',
        email: 'omkottalwar17@gmail.com',
        password: 'Password123',
        role: 'Employee',
        department: 'Engineering',
        employeeId: 'EMP-999',
        signatureUrl: '',
      },
    ]);

    const director = users[0];
    const alice = users[2];
    const charlie = users[3];
    const david = users[4];

    console.log('Seeded Users:');
    users.forEach((u) => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Password: Password123`);
    });

    const currentYear = new Date().getFullYear();

    // Seed Vouchers
    const vouchers = [
      {
        voucherNumber: `VOU-${currentYear}-000001`,
        voucherDate: new Date(),
        expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        departmentName: 'Engineering',
        expenseTitle: 'AWS Server Hosting Fees',
        expenseCategory: 'Other',
        expenseDescription: 'Monthly subscription cost for production AWS EC2 clusters.',
        amount: 850.50,
        employee: alice._id,
        employeeName: alice.name,
        employeeIdCode: alice.employeeId,
        employeeSignatureUrl: alice.signatureUrl,
        status: 'PendingApproval',
      },
      {
        voucherNumber: `VOU-${currentYear}-000002`,
        voucherDate: new Date(),
        expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        departmentName: 'Engineering',
        expenseTitle: 'Loom Subscription for Team',
        expenseCategory: 'Office Supplies',
        expenseDescription: 'Upgrade loom accounts for 5 engineers.',
        amount: 50.00,
        employee: alice._id,
        employeeName: alice.name,
        employeeIdCode: alice.employeeId,
        employeeSignatureUrl: alice.signatureUrl,
        status: 'Draft',
      },
      {
        voucherNumber: `VOU-${currentYear}-000003`,
        voucherDate: new Date(),
        expenseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        departmentName: 'Sales',
        expenseTitle: 'Client Dinner at Ruth\'s Chris',
        expenseCategory: 'Food',
        expenseDescription: 'Client dinner with ACME Corp stakeholders to discuss deal renewal.',
        amount: 320.00,
        employee: charlie._id,
        employeeName: charlie.name,
        employeeIdCode: charlie.employeeId,
        employeeSignatureUrl: '/uploads/signatures/seeded-charlie-sig.png',
        status: 'Approved',
        directorSignatureUrl: '/uploads/signatures/seeded-director-sig.png',
        approvalDate: new Date(),
        reviewedBy: director._id,
      },
      {
        voucherNumber: `VOU-${currentYear}-000004`,
        voucherDate: new Date(),
        expenseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        departmentName: 'Sales',
        expenseTitle: 'Flight to Chicago Conference',
        expenseCategory: 'Travel',
        expenseDescription: 'Roundtrip flight tickets to attend Chicago Tech Summit.',
        amount: 450.00,
        employee: charlie._id,
        employeeName: charlie.name,
        employeeIdCode: charlie.employeeId,
        employeeSignatureUrl: '/uploads/signatures/seeded-charlie-sig.png',
        status: 'Rejected',
        rejectionReason: 'Flight must be booked via company portal to avail corporate discounts.',
        reviewedBy: director._id,
      },
      {
        voucherNumber: `VOU-${currentYear}-000005`,
        voucherDate: new Date(),
        expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        departmentName: 'Marketing',
        expenseTitle: 'Google Ads Campaign',
        expenseCategory: 'Other',
        expenseDescription: 'Q3 marketing launch ad spend budget.',
        amount: 1500.00,
        employee: david._id,
        employeeName: david.name,
        employeeIdCode: david.employeeId,
        employeeSignatureUrl: '/uploads/signatures/seeded-david-sig.png',
        status: 'PendingApproval',
      },
    ];

    await Voucher.create(vouchers);
    console.log('Seeded sample vouchers.');

    // Seed Counter to start from 5 so next auto-generation gets VOU-YYYY-000006
    await Counter.create({
      _id: `voucher-${currentYear}`,
      seq: 5,
    });
    console.log(`Initialized voucher sequence counter for ${currentYear} at index 5.`);

    // Set up mock image directories and placeholder signature images if they don't exist
    const sigDir = path.join(__dirname, 'uploads/signatures');
    if (!fs.existsSync(sigDir)) {
      fs.mkdirSync(sigDir, { recursive: true });
    }

    // Write empty dummy signature files to satisfy file display paths
    const mockImages = [
      'seeded-alice-sig.png',
      'seeded-charlie-sig.png',
      'seeded-david-sig.png',
      'seeded-director-sig.png',
    ];
    mockImages.forEach((img) => {
      const filePath = path.join(sigDir, img);
      if (!fs.existsSync(filePath)) {
        // Create an extremely small 1x1 transparent pixel png file or just an empty file
        fs.writeFileSync(filePath, '');
      }
    });
    console.log('Mock signature image assets created.');

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
