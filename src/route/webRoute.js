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
  registerValidationRules, 
  loginValidationRules 
} = require('../middleware/validationMiddleware');

const { 
  isAuthenticated, 
  isNotAuthenticated 
} = require('../middleware/authMiddleware');

// Body parser for form data
router.use(express.urlencoded({ extended: true }));

// UI routes
router.get('/homepage', getHomepage);

// DATA routes
// 1.Auth routes
router.get('/login', isNotAuthenticated, getLoginPage);
router.post('/login', loginValidationRules, login);
router.get('/register', isNotAuthenticated, getRegisterPage);
router.post('/register', registerValidationRules, register);
router.get('/logout', logout);

// 2. Products data 
router.get('/allbooks',getAllBooks);
// Protected routes example
router.get('/account', isAuthenticated, (req, res) => {
  res.render('account', { user: req.session.user });
});

module.exports = router;