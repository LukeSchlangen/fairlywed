var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
    pool.connect(function (err, client, done) {
        var stripeConnectState = req.query.state;
        client.query('SELECT vendor_id ' +
            'FROM users_vendors ' +
            'WHERE stripe_connect_state=$1;',
            [stripeConnectState],
            function (err, stripeConnectVendorIdResult) {
                done();
                if (err) {
                    console.log('Error vendor id GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    if (stripeConnectVendorIdResult.rows[0] && stripeConnectVendorIdResult.rows[0].vendor_id) {
                        var stripeConnectVendorId = stripeConnectVendorIdResult.rows[0].vendor_id;
                    }
                    if (stripeConnectVendorId) {
                        var redirectUrl = [req.protocol, '://', req.get('Host'), '/#/account/vendor/details/', stripeConnectVendorId, '?', req.originalUrl.split("?").pop()].join('');
                        res.redirect(redirectUrl);
                    } else {
                        console.log('There was no vendor id to match the stripe state received');
                        res.sendStatus(403);
                    }
                }
            });
    });
});

module.exports = router;