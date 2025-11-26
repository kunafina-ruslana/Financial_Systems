const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const transactionController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validationMiddleware');

router.get('/', requireAuth, walletController.showWallet);
router.post('/deposit', requireAuth, validateTransaction, walletController.deposit);
router.post('/payment', requireAuth, validateTransaction, walletController.payment);
router.post('/transfer', requireAuth, validateTransaction, walletController.transfer);

router.get('/transactions', requireAuth, transactionController.getTransactions);

module.exports = router;