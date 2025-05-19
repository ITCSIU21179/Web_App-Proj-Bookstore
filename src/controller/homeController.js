const getHomepage = (req, res) => {
    // Check if user is logged in (using session or JWT)
    const isLoggedIn = req.session && req.session.user ? true : false;
    const NameOfUser = req.session && req.session.user ? req.session.user.name : null;
    res.render('homePage.ejs', { isLoggedIn, NameOfUser });
};


module.exports = {
    getHomepage
};