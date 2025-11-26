const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');

router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);

router.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/wallet');
    } else {
        res.redirect('/auth/login');
    }
});

module.exports = router;