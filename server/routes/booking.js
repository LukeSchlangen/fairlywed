var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', function (req, res) {
    var location = req.body.location;
    var packageId = req.body.packageId;
    var clientId = 1;
    var requests = req.body.requests;
    var time = new Date(req.body.time);
    var subvendorId = req.body.subvendorId;
    var stripeToken = req.body.stripeToken;
    pool.connect(function (err, client, done) {
        client.query(
            // insert booking if photographer is listed as available for that date
            // This will need to return the photographer's price for the given package
            `WITH subvendor_pricing_info AS (SELECT price, subvendors_packages.subvendor_id, subvendors_packages.package_id, subvendor_availability.date_id, stripe_accounts.id AS stripe_account_id, stripe_accounts.stripe_user_id, vendors.id AS vendor_id, subvendor_availability.id AS subvendor_availability_id FROM subvendors 
            JOIN subvendor_availability ON 
            subvendor_availability.date_id=(
            SELECT id FROM calendar_dates WHERE day=$2::date
            ) 
            AND subvendors.id=$7
            AND subvendors.id=subvendor_availability.subvendor_id
            AND availability_id=(SELECT id FROM availability WHERE status='available')
            JOIN vendors ON vendors.id = subvendors.parent_vendor_id
            AND (SELECT ST_Distance( 
                        (SELECT COALESCE(subvendors.location, vendors.location)), 
                        (CAST(ST_SetSRID(ST_Point($4, $5),4326) As geography)) 
                    )) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance))
            JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id AND subvendors_packages.package_id=$1 
            JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id),
                    
            booking_temp_table AS (INSERT INTO bookings (package_id, time, requests, location, price, subvendor_id, client_id, vendor_id, stripe_account_id)
            VALUES ((SELECT package_id FROM subvendor_pricing_info), $2::timestamptz, $3, CAST(ST_SetSRID(ST_Point($4, $5),4326) AS geography), (SELECT price FROM subvendor_pricing_info), (SELECT subvendor_id FROM subvendor_pricing_info), $6, (SELECT vendor_id FROM subvendor_pricing_info), (SELECT stripe_account_id FROM subvendor_pricing_info)) RETURNING id),

            temp_throwaway AS (UPDATE subvendor_availability SET availability_id=(SELECT id FROM availability WHERE status='booked') RETURNING id)

            SELECT *, (SELECT id FROM booking_temp_table) AS booking_id FROM subvendor_pricing_info;`,
            [packageId, time, requests, location.longitude, location.latitude, 1, subvendorId],
            function (err, bookingResults) {
                done();
                if (err) {
                    console.log('error making booking query', err);
                    res.sendStatus(500);
                } else {
                    var booking = bookingResults.rows[0];
                    var totalPurchaseAmmount = booking.price * 100; // a $100 purchase
                    var stripePaymentFee = totalPurchaseAmmount * 0.029 + 30; // 2.9% plus 30 cents
                    var fairlywedApplicationFee = Math.floor(totalPurchaseAmmount * 0.10 - stripePaymentFee); // 10% minus stripe's cut, round down to nearest penny

                    console.log('The stripe token ', stripeToken);

                    // Create a Charge:
                    stripe.charges.create({
                        amount: totalPurchaseAmmount,
                        currency: "usd",
                        source: stripeToken.id,
                        application_fee: fairlywedApplicationFee,
                    }, {
                            stripe_account: booking.stripe_user_id,
                        }).then(function (charge) {
                            if (err) {
                                console.log('Error user data root INSERT SQL bookings', err);
                                res.sendStatus(500);
                            } else {
                                console.log('Stripe Charge successful', charge)
                                res.sendStatus(201);
                            }
                        }).catch(function (err) {
                            // remove booking from database, make photographer available again
                            console.log('Error creating stripe charge', err)
                            res.sendStatus(500);
                        });

                }
            }
        );
    });
});

module.exports = router;