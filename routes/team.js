const express = require('express');
const router = express.Router();

router.get('/team', (req, res) => {
    res.render('teams/team')

})



module.exports = router