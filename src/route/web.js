const express = require('express');
const router = express.Router();
const {getHomepage, getABC} = require('../controller/homeController');


router.get('/homepage', getHomepage);
router.get('/newroute', getABC);

module.exports = router;