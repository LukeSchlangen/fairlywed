var env = process.env.NODE_ENV || 'development';

var forceSSL = function (req, res, next) {
    if (env === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            var urlBeforeConversion = req.url;
            var urlAfterConversion = ['https://', req.get('Host'), req.url].join('');
            console.log('urlBeforeConversion: ', urlBeforeConversion);
            console.log('urlAfterConversion: ', urlAfterConversion);
            return res.redirect(urlAfterConversion);
        }
    }
    return next();
};

module.exports = forceSSL;