// filepath: c:\Users\Thanh Hieu\Desktop\Web_App-Proj-Bookstore\src\middleware\authMiddleware.js
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  res.redirect('/homepage');
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};