const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/wallet');
    } else {
        next();
    }
};

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};