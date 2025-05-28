const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const adminModel = require('../model/adminModel');

const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For AJAX requests
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors: errors.array() });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    const existingAdmin = await adminModel.getAdminByEmail(email);

    if (existingAdmin) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(400).json({ error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await adminModel.createAdmin(name, email, password_hash);

    res.redirect('/homepage');
  } catch (error) {
    console.error('Registration error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }

    res.status(500).render('register', {
      errors: [{ msg: 'Server error. Please try again.' }],
      name: req.body.name,
      email: req.body.email
    });
  }
};

const login_admin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For AJAX requests
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors: errors.array() });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const admin = await adminModel.getAdminByEmail(email);

    if (!admin || !await bcrypt.compare(password, admin.password_hash)) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.render('login', { errors: [{ msg: 'Invalid credential' }], email });
    }

    req.session.admin = {
      id: admin.admin_id,
      name: admin.name,
      email: admin.email
    };

    res.json({
      success: true,
      message: 'Admin Login successful',
      isAdminLogin: true
    });
  } catch (error) {
    console.error('Login error:', error);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/homepage');
    }
    const admin = req.session.admin;
    res.render('admin_dashboard', {
      isLoggedIn: true,
      adminName: admin.name,
      adminEmail: admin.email
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      isLoggedIn: true,
      message: 'Error loading admin dashboard'
    });
  }
};

const getAllOrdersWithStatus = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/homepage');
    }
    const status = req.query.status || 'all';
    if (!['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const orders = await adminModel.getAllOrdersWithStatus(status);
    res.status(200).json({
      isLoggedIn: true,
      orders: orders,
      status: status
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/homepage');
    }
    const orderId = req.query.order_id;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    await adminModel.confirmPayment(orderId);
    res.status(200).json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orderId = req.query.order_id;
    const orderItems = await adminModel.getOrderItems(orderId);
    
    res.status(200).json({
      success: true,
      orderItems: orderItems
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
};

module.exports = {
  login_admin,
  getAdminDashboard,
  registerAdmin,
  getAllOrdersWithStatus,
  confirmPayment,
  getOrderDetails
};
