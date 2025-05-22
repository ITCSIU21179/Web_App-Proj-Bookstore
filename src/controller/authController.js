const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const authModel = require('../model/authModel');
const {getCartIdByCustomerId} = require('../model/productModel');

// const getLoginPage = (req, res) => {
//   res.render('login', { errors: [], email: '' });
// };

const getRegisterPage = (req, res) => {
  res.render('registerPage.ejs', 
    { 
      // isLoggedIn: false, 
      errors: [], name: '', email: '' 
    });
};

// Modify your login function to handle both AJAX and traditional form submissions
const login = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // For AJAX requests
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors: errors.array() });
    }
    // For traditional form submissions
    // return res.render('login', { errors: errors.array(), email: req.body.email });
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await authModel.getUserByEmail(email);
    

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      // Authentication failed
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      // return res.render('login', { 
      //   errors: [{ msg: 'Invalid email or password' }], 
      //   email 
      // });
    }
    const cart = await getCartIdByCustomerId(user.customer_id);
    
    // Authentication successful
    req.session.user = {
      id: user.customer_id,
      name: user.name,
      email: user.email,
      cart_id: cart.cart_id,
    };
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ success: true });
    }
    
    res.redirect('/homepage');
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    res.status(500).render('login', { 
      errors: [{ msg: 'Server error. Please try again.' }], 
      email: req.body.email 
    });
  }
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('registerPage.ejs', { 
      // isLoggedIn: false,
      errors: errors.array(), 
      name: req.body.name, 
      email: req.body.email 
    });
  }

  try {
    const { name, email, password, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await authModel.getUserByEmail(email);
    if (existingUser) {
      return res.render('registerPage.ejs', {
        // isLoggedIn: false,  
        errors: [{ msg: 'Email already in use' }], 
        name, 
        email 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Save user to database
    const customer_id = await authModel.createUser(name, email, password_hash, phone, address);
    await authModel.createCart(customer_id);
    // Redirect to homepage or dashboard
    res.redirect('/homepage');
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register.ejs', { 
      // isLoggedIn: false,
      errors: [{ msg: 'Server error. Please try again.' }], 
      name: req.body.name, 
      email: req.body.email 
    });
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('sessionId');
    res.redirect('/homepage');
  });
};

module.exports = {
  // getLoginPage,
  getRegisterPage,
  login,
  register,
  logout
};