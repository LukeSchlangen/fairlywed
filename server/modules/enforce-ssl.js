var env = process.env.NODE_ENV || 'development';

var forceSSL = function (req, res, next) {
    if (env === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        }
    }
    return next();
};

module.exports = forceSSL;