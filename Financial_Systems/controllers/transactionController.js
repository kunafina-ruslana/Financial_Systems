const { Transaction } = require('../models/bd');

const transactionController = {
    getTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.findAll({
                where: { user_id: req.session.userId },
                order: [['created_at', 'DESC']]
            });
            
            res.render('transactions', {
                username: req.session.username,
                transactions: transactions
            });
        } catch (error) {
            console.error('Transactions error:', error);
            res.render('transactions', {
                username: req.session.username,
                transactions: [],
                error: 'Ошибка загрузки транзакций'
            });
        }
    }
};

module.exports = transactionController;