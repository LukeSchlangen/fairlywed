var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/getConnectUrl', function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        client.query('SELECT stripe_connect_state ' +
            'FROM users_vendors ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND users_vendors.vendor_id=$2',
            [userId, vendorId],
            function (err, stripeConnectStateResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    var stripeConnectState = stripeConnectStateResult.rows[0].stripe_connect_state;
                    var stripeUrl = process.env.STRIPE_AUTHORIZE_URL +
                        '?response_type=' + process.env.STRIPE_RESPONSE_TYPE +
                        '&client_id=' + process.env.STRIPE_CLIENT_ID +
                        '&scope=' + process.env.STRIPE_SCOPE +
                        '&redirect_uri=' + process.env.STRIPE_REDIRECT_URI +
                        '&state=' + stripeConnectState;
                    res.send({stripeUrl: stripeUrl});
                }
            });
    });
});

module.exports = router;