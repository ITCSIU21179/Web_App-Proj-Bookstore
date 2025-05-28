const express = require('express');
const router = express.Router();
const { 
    getHomepage 
} = require('../controller/homeController');

const { 
  getLoginPage, 
  getRegisterPage, 
  login, 
  register, 
  logout
} = require('../controller/authController');

const {getAllBooks} = require('../controller/productController');
const { 
  getProfile,
  editProfile 
} = require('../controller/customerController');

const { 
  registerValidationRules, 
  loginValidationRules 
} = require('../middleware/validationMiddleware');

const { 
  isAuthenticated, 
  isNotAuthenticated,
  isAdminAuthenticated 
} = require('../middleware/authMiddleware');

// Body parser for form data
router.use(express.urlencoded({ extended: true }));

// UI routes
router.get('/homepage', getHomepage);

// DATA routes
// 1.Auth routes
// router.get('/login', isNotAuthenticated, getLoginPage);
router.post('/login', loginValidationRules, login);
router.get('/register', isNotAuthenticated, getRegisterPage);
router.post('/register', registerValidationRules, register);
router.get('/logout', logout);

// 2. Products data 
router.get('/allbooks',getAllBooks);

// User protected routes example
router.get('/profile', isAuthenticated, getProfile);
router.post('/edit-profile', isAuthenticated, editProfile);

// 3. Cart data
const { addBookToCart, getCartItems, updateCartItems, removeFromCart, checkoutPage, processCheckout } = require('../controller/productController');
router.post('/add-to-cart', isAuthenticated, addBookToCart);
router.get('/cart-info', getCartItems);
router.post('/update-cart', isAuthenticated, updateCartItems);
router.post('/remove-from-cart', isAuthenticated, removeFromCart);
router.get('/checkout', isAuthenticated, checkoutPage);
router.get('/processCheckout', isAuthenticated, processCheckout);

// 4.admin routes
const {registerAdmin, login_admin, getAdminDashboard, getAllUsers, getAllOrdersWithStatus, confirmPayment } = require('../controller/adminController');
// router.get('/admin/login', isNotAuthenticated, login_admin);
router.post('/admin/register', registerValidationRules, registerAdmin);
router.post('/admin/login', loginValidationRules, login_admin);
router.get('/admin/dashboard', isAdminAuthenticated, getAdminDashboard);
// router.get('/admin/users', isAuthenticated, getAllUsers);
router.get('/admin/orders', isAdminAuthenticated, getAllOrdersWithStatus);
router.get('/admin/confirm-payment', isAdminAuthenticated, confirmPayment);


module.exports = router;