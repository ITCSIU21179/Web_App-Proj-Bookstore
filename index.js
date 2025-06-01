require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const webRoutes = require('./src/route/webRoute');

const configViewEngine = require('./src/config/viewEngine');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'bookstore-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000 // 0.5 hour
  }
}));

// Add middleware to make user data available to all views
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session && req.session.user ? true : false;
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
});

// Configure view engine
configViewEngine(app);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', webRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at port: ${port}/`);
});