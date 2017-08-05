var env = process.env.NODE_ENV || 'development';

function redirectChecker (req, res, next) {
    if (env === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            var urlAfterConversion = ['https://', req.get('Host'), req.url].join('');
            return res.redirect(urlAfterConversion);
        }
    }
    return next();
};

function forceSSLInProduction (urlToCheck) {
    var urlToRedirect = urlToCheck;
    if (env === 'production') {
        urlToRedirect = 'https:' + urlToCheck.split(':')[1];
    }
    return urlToRedirect;
};

module.exports = {
    redirectChecker: redirectChecker,
    forceSSLInProduction: forceSSLInProduction
};