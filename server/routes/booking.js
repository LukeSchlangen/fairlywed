var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', function (req, res) {
    var userSubmittedPrice = req.body.price;
    var locationName = req.body.location;
    var longitude = req.body.longitude;
    var latitude = req.body.latitude;
    var packageId = req.body.packageId;
    var clientUserId = req.decodedToken.userSQLId;
    var requests = req.body.requests;
    var time = new Date(req.body.time);
    var subvendorId = req.body.subvendorId;
    var stripeToken = req.body.stripeToken;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('error connecting to database', err);
        } else {
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
                    )) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance))
            JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id AND subvendors_packages.package_id=$1 
            JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id),
                    
            booking_temp_table AS (INSERT INTO bookings (package_id, time, requests, location_name, location, price, subvendor_id, client_user_id, vendor_id, stripe_account_id)
            VALUES ((SELECT package_id FROM subvendor_pricing_info), $2::timestamptz, $3, $8, CAST(ST_SetSRID(ST_Point($4, $5),4326) AS geography), (SELECT price FROM subvendor_pricing_info), (SELECT subvendor_id FROM subvendor_pricing_info), $6, (SELECT vendor_id FROM subvendor_pricing_info), (SELECT stripe_account_id FROM subvendor_pricing_info)) RETURNING id),

            temp_throwaway AS (UPDATE subvendor_availability SET availability_id=(SELECT id FROM availability WHERE status='booked') WHERE id=(SELECT subvendor_availability_id FROM subvendor_pricing_info) RETURNING id)

            SELECT *, (SELECT id FROM booking_temp_table) AS booking_id FROM subvendor_pricing_info;`,
                [packageId, time, requests, longitude, latitude, clientUserId, subvendorId, locationName],
                function (err, bookingResults) {
                    done();
                    if (err) {
                        console.log('error making booking query', err);
                        res.sendStatus(500);
                    } else {
                        var booking = bookingResults.rows[0];
                        if (userSubmittedPrice == booking.price) {
                            var totalPurchaseAmountInCents = booking.price * 100; // the purchase price in dollars converted to cents
                            var stripePaymentFee = totalPurchaseAmountInCents * 0.029 + 30; // 2.9% plus 30 cents
                            var fairlywedApplicationFee = Math.floor(totalPurchaseAmountInCents * 0.10 - stripePaymentFee); // 10% minus stripe's cut, round down to nearest penny

                            // Create a Charge:
                            stripe.charges.create({
                                amount: totalPurchaseAmountInCents,
                                currency: "usd",
                                source: stripeToken.id,
                                application_fee: fairlywedApplicationFee,
                            }, {
                                    stripe_account: booking.stripe_user_id,
                                }).then(function (charge) {
                                    pool.connect(function (err, client, done) {
                                        client.query(`WITH charge_id_table AS (INSERT INTO stripe_charge_attempts (response_object, was_successful) VALUES ($2, TRUE) RETURNING id)
                                        UPDATE bookings SET stripe_charge_id=(SELECT id FROM charge_id_table) WHERE id=$1;`,
                                            [booking.booking_id, JSON.stringify(charge)],
                                            function (err) {
                                                done();
                                                if (err) {
                                                    console.log('Error with stripe_charge_id INSERT or tying booking to stripe charge after success on creating stripe charge', err);
                                                    res.sendStatus(500);
                                                } else {
                                                    res.sendStatus(201);
                                                }
                                            });
                                    });
                                }).catch(function (stripeError) {
                                    // remove booking from database, make photographer available again
                                    undoBooking('Error creating stripe charge', booking);
                                    console.log('Error creating stripe charge', stripeError);
                                    pool.connect(function (err, client, done) {
                                        client.query(`WITH charge_id_table AS (INSERT INTO stripe_charge_attempts (response_object, was_successful) VALUES ($2, FALSE) RETURNING id)
                                        UPDATE bookings SET stripe_charge_id=(SELECT id FROM charge_id_table) WHERE id=$1;`,
                                            [booking.booking_id, JSON.stringify(stripeError)],
                                            function (err) {
                                                done();
                                                if (err) {
                                                    console.log('Error with stripe_charge_id INSERT or tying booking to stripe charge after error on creating stripe charge', err);
                                                }
                                            });
                                    });
                                    res.sendStatus(500);
                                });
                        } else {
                            console.log('User price from DOM did not match user submitted price');
                            res.sendStatus(400);
                        }

                    }
                }
            );

        }
    });
});

function undoBooking(reasonForUndo, bookingToUndo) {
    pool.connect(function (err, client, done) {
        client.query(`UPDATE subvendor_availability 
                SET availability_id=(SELECT id FROM availability WHERE status='available') 
                WHERE id=$1`, [bookingToUndo.subvendor_availability_id], function (err) {
                done();
                if (err) {
                    console.log('UNDO BOOKING FAILED!! Booking created than undone due to ', reasonForUndo, 'but undo failed meaning photographer may have been booked multiple times for the same date.');
                } else {
                    console.log('Booking created than undone due to ', reasonForUndo);
                }
            });
    });
}

module.exports = router;