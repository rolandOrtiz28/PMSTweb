const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');



router.get('/services', (req, res) => {

    res.render('services/service')
})


router.get('/products', (req, res) => {

    res.render('services/products')
})


module.exports = router;