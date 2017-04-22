var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var request = require('request');

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
                    res.send({ stripeUrl: stripeUrl });
                }
            });
    });
});

router.post('/authorizeStripeAccount', function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.body.vendor_id;
        var stripeConnectState = req.body.stripe_state;
        var stripeConnectCode = req.body.stripe_code;
        client.query('SELECT vendor_id ' +
            'FROM users_vendors ' +
            'WHERE user_id=$1 ' +
            'AND vendors_id=$2 ' +
            'AND stripe_connect_state=$3',
            [userId, vendorId, stripeConnectState],
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

                        // Make /oauth/token endpoint POST request
                        request.post({
                            url: 'https://connect.stripe.com/oauth/token',
                            form: {
                                grant_type: "authorization_code",
                                client_id: process.env.STRIPE_CLIENT_ID,
                                code: stripeConnectCode,
                                client_secret: process.env.STRIPE_SECRET_KEY
                            }
                        }, function (err, r, body) {

                            if (err) {
                                console.log('Error occurred in Stripe request post', err);
                                res.sendStatus(500);
                            } else {
                                var stripeUserAuthenticationCredentials = JSON.parse(body);

                                console.log(stripeUserAuthenticationCredentials);

                                // Do something with your accessToken
                                // Make vendors_stripe table | id | stripe_user_id | vendor_id | creator_user_id | refresh_token
                                // only allow insert if "scope": "read_write"
                                // do things differently for dev and production based on "livemode": false,
                                // Make foreign key to vendors_stripe table in vendors table

                                // TODO: Handle stripe errors

                                res.sendStatus(200);

                            }

                        });
                    } else {
                        console.log('There was no vendor id to match the stripe state received');
                        res.sendStatus(403);
                    }
                }
            });
    });
});


module.exports = router;