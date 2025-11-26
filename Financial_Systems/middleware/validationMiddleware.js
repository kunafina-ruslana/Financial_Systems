const validateRegistration = (req, res, next) => {
    const { username, telephone, login, password } = req.body;
    
    if (!username || !telephone || !login || !password) {
        return res.render('register', { error: 'Все поля обязательны для заполнения' });
    }
    
    if (password.length < 6) {
        return res.render('register', { error: 'Пароль должен быть не менее 6 символов' });
    }
    
    next();
};

const validateTransaction = (req, res, next) => {
    const { amount } = req.body;
    const numericAmount = parseFloat(amount);
    
    if (!amount || numericAmount <= 0) {
        return res.redirect('/wallet?error=Неверная сумма');
    }
    
    next();
};

module.exports = {
    validateRegistration,
    validateTransaction
};