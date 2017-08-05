var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var enfoceSSL = require('./modules/enforce-ssl');


router.get('/', async (req, res) => {
    var client = await pool.connect();
    try {
        var stripeConnectState = req.query.state;
        var stripeConnectVendorIdResult = await client.query('SELECT vendor_id ' +
            'FROM users_vendors ' +
            'WHERE stripe_connect_state=$1;',
            [stripeConnectState])
        client.release();
        if (stripeConnectVendorIdResult.rows[0] && stripeConnectVendorIdResult.rows[0].vendor_id) {
            var stripeConnectVendorId = stripeConnectVendorIdResult.rows[0].vendor_id;
        }
        if (stripeConnectVendorId) {
            var env = process.env.NODE_ENV || 'development';
            var redirectUrl = [req.protocol, '://', req.get('Host'), '/#/account/vendor/details/', stripeConnectVendorId, '?', req.originalUrl.split("?").pop()].join('');
            redirectUrl = enfoceSSL.forceSSLInProduction(redirectUrl);
            res.redirect(redirectUrl);
        } else {
            console.log('There was no vendor id to match the stripe state received');
            res.sendStatus(403);
        }
    } catch (e) {
        console.log('Error vendor id GET SQL query task', e);
        res.sendStatus(500);
    }
});

module.exports = router;