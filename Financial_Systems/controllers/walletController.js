const { Wallet, Transaction, sequelize } = require('../models/bd');

const walletController = {
    showWallet: async (req, res) => {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.session.userId } });
            const transactions = await Transaction.findAll({
                where: { user_id: req.session.userId },
                order: [['created_at', 'DESC']],
                limit: 10
            });

            res.render('wallet', {
                username: req.session.username,
                balance: wallet ? wallet.total_balance : 0,
                transactions: transactions,
                error: req.query.error
            });
        } catch (error) {
            console.error('Wallet error:', error);
            res.render('wallet', {
                username: req.session.username,
                balance: 0,
                transactions: [],
                error: 'Ошибка загрузки данных'
            });
        }
    },

    deposit: async (req, res) => {
        try {
            const { amount, description } = req.body;
            const numericAmount = parseFloat(amount);

            if (numericAmount <= 0) {
                return res.redirect('/wallet?error=Неверная сумма');
            }

            await sequelize.transaction(async (t) => {
                // Обновление баланса
                const wallet = await Wallet.findOne({ 
                    where: { user_id: req.session.userId },
                    transaction: t 
                });

                if (!wallet) {
                    throw new Error('Кошелек не найден');
                }

                await wallet.increment('total_balance', { 
                    by: numericAmount,
                    transaction: t 
                });

                // Создание транзакции
                await Transaction.create({
                    type: 'income',
                    amount: numericAmount,
                    description: description || 'Пополнение кошелька',
                    user_id: req.session.userId,
                    status: 'completed'
                }, { transaction: t });
            });

            res.redirect('/wallet');
        } catch (error) {
            console.error('Deposit error:', error);
            res.redirect('/wallet?error=Ошибка пополнения: ' + error.message);
        }
    },

    payment: async (req, res) => {
        try {
            const { amount, description } = req.body;
            const numericAmount = parseFloat(amount);

            if (numericAmount <= 0) {
                return res.redirect('/wallet?error=Неверная сумма');
            }

            await sequelize.transaction(async (t) => {
                const wallet = await Wallet.findOne({ 
                    where: { user_id: req.session.userId },
                    transaction: t 
                });

                if (!wallet) {
                    throw new Error('Кошелек не найден');
                }

                if (wallet.total_balance < numericAmount) {
                    throw new Error('Недостаточно средств');
                }

                // Обновление баланса
                await wallet.decrement('total_balance', { 
                    by: numericAmount,
                    transaction: t 
                });

                // Создание транзакции
                await Transaction.create({
                    type: 'expense',
                    amount: numericAmount,
                    description: description || 'Оплата покупки',
                    user_id: req.session.userId,
                    status: 'completed'
                }, { transaction: t });
            });

            res.redirect('/wallet');
        } catch (error) {
            console.error('Payment error:', error);
            res.redirect('/wallet?error=' + encodeURIComponent(error.message));
        }
    },

    transfer: async (req, res) => {
        try {
            const { amount, recipient, description } = req.body;
            const numericAmount = parseFloat(amount);

            if (numericAmount <= 0) {
                return res.redirect('/wallet?error=Неверная сумма');
            }

            if (!recipient) {
                return res.redirect('/wallet?error=Укажите получателя');
            }

            await sequelize.transaction(async (t) => {
                const wallet = await Wallet.findOne({ 
                    where: { user_id: req.session.userId },
                    transaction: t 
                });

                if (!wallet) {
                    throw new Error('Кошелек не найден');
                }

                if (wallet.total_balance < numericAmount) {
                    throw new Error('Недостаточно средств');
                }

                // Обновление баланса
                await wallet.decrement('total_balance', { 
                    by: numericAmount,
                    transaction: t 
                });

                // Создание транзакции
                await Transaction.create({
                    type: 'transfer',
                    amount: numericAmount,
                    description: description || `Перевод ${recipient}`,
                    recipient: recipient,
                    sender: req.session.username,
                    user_id: req.session.userId,
                    status: 'completed'
                }, { transaction: t });
            });

            res.redirect('/wallet');
        } catch (error) {
            console.error('Transfer error:', error);
            res.redirect('/wallet?error=' + encodeURIComponent(error.message));
        }
    }
};

module.exports = walletController;