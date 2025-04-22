const getHomepage = (req, res) => {
    
    res.render('homePage.ejs');
};

const getABC = (req, res) => {
    res.send('Welcome to the abc page!');
}

module.exports = {
    getHomepage,
    getABC,
};