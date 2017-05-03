var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var request = require('request-promise');

router.get('/getConnectUrl', async (req, res) => {
    try {
        var client = await pool.connect();
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        const stripeConnectStateResult = await client.query('SELECT stripe_connect_state ' +
            'FROM users_vendors ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND users_vendors.vendor_id=$2',
            [userId, vendorId])
        var stripeConnectState = stripeConnectStateResult.rows[0].stripe_connect_state;
        var stripeUrl = process.env.STRIPE_AUTHORIZE_URL +
            '?response_type=' + process.env.STRIPE_RESPONSE_TYPE +
            '&client_id=' + process.env.STRIPE_CLIENT_ID +
            '&scope=' + process.env.STRIPE_SCOPE +
            '&redirect_uri=' + process.env.STRIPE_REDIRECT_URI +
            '&state=' + stripeConnectState;
        res.send({ stripeUrl: stripeUrl });
    } catch (e) {
        console.log('Error vendor data GET SQL query task', e);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.post('/authorizeStripeAccount', async (req, res) => {
    try {
        var client = await pool.connect();
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.body.vendor_id;
        var stripeConnectState = req.body.stripe_state;
        var stripeConnectCode = req.body.stripe_code;
        try {
            var stripeConnectVendorIdResult = await client.query('SELECT vendor_id ' +
                'FROM users_vendors ' +
                'WHERE user_id=$1 ' +
                'AND vendor_id=$2 ' +
                'AND stripe_connect_state=$3',
                [userId, vendorId, stripeConnectState]);
        } catch (e) {
            console.log('Error vendor id GET SQL query task', e);
            throw e
        }
        if (stripeConnectVendorIdResult.rows[0] && stripeConnectVendorIdResult.rows[0].vendor_id) {
            var stripeConnectVendorId = stripeConnectVendorIdResult.rows[0].vendor_id;
        }
        if (stripeConnectVendorId) {
            try {
                // Make /oauth/token endpoint POST request
                var body = await request.post({
                    url: 'https://connect.stripe.com/oauth/token',
                    form: {
                        grant_type: "authorization_code",
                        client_id: process.env.STRIPE_CLIENT_ID,
                        code: stripeConnectCode,
                        client_secret: process.env.STRIPE_SECRET_KEY
                    }
                });
            } catch (e) {
                console.log('Error occurred in Stripe request post', e);
                throw e;
            }

            var stripeUserAuthenticationCredentials = JSON.parse(body);
            if (stripeUserAuthenticationCredentials.error) {
                console.log('Stripe error', stripeUserAuthenticationCredentials.error, 'with description', stripeUserAuthenticationCredentials.error_description);
                throw e;
            } else if (stripeUserAuthenticationCredentials.scope != "read_write") {
                console.log('FairlyWed requires "read_write" account access, but got ', stripeUserAuthenticationCredentials.scope);
                throw e;
            } else {
                var env = process.env.NODE_ENV || 'development';
                if ((env === 'production' && stripeUserAuthenticationCredentials.livemode) || (env === 'development' && !stripeUserAuthenticationCredentials.livemode)) {
                    try {
                        var success = await client.query('WITH stripe_account_id AS ( ' +
                            '	INSERT INTO stripe_accounts (creator_user_id, stripe_user_id, stripe_refresh_user_token) ' +
                            '	VALUES ($1, $2, $3) ' +
                            '	RETURNING id ' +
                            ') ' +
                            'UPDATE vendors SET stripe_account_id=(SELECT id FROM stripe_account_id) ' +
                            'WHERE id=$4;',
                            [userId, stripeUserAuthenticationCredentials.stripe_user_id, stripeUserAuthenticationCredentials.refresh_token, stripeConnectVendorId]);
                        res.sendStatus(200);
                    } catch (e) {
                        console.log('Error adding stripe account to vendor', err);
                        throw e;
                    }
                } else {
                    console.error('Stripe livemode did not match environment. Environment is ', env, ' and livemode is ', stripeUserAuthenticationCredentials.livemode);
                    res.sendStatus(403);
                }
            }
        } else {
            console.log('There was no vendor id to match the stripe state received');
            res.sendStatus(403);
        }
    } catch (e) {
        console.log('Error in authorizeStripeAccount', e);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }

});


module.exports = router;