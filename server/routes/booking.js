var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var emailSiteAdministrators = require('../modules/email-site-administrators');

router.post('/', async (req, res) => {
    var client = await pool.connect();
    try {
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
        try {
            var bookingResults = await client.query(
                // insert booking if photographer is listed as available for that date
                // This will need to return the photographer's price for the given package
                `WITH subvendor_pricing_info AS (SELECT price, subvendors_packages.subvendor_id, subvendors_packages.package_id, subvendor_availability.day, stripe_accounts.id AS stripe_account_id, stripe_accounts.stripe_user_id, vendors.id AS vendor_id FROM subvendors 
                JOIN subvendor_availability ON 
                subvendor_availability.day=$2::date 
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

                temp_throwaway AS (UPDATE subvendor_availability SET availability_id=(SELECT id FROM availability WHERE status='booked') WHERE day=$2::date AND subvendor_id=$7)

                SELECT *, (SELECT id FROM booking_temp_table) AS booking_id FROM subvendor_pricing_info;`,
                [packageId, time, requests, longitude, latitude, clientUserId, subvendorId, locationName]);
                emailSiteAdministrators('Client user with id ' + clientUserId + ' just attempted to book a wedding');
        } catch (e) {
            console.log('error making booking query', e);
            throw e;
        }
        var booking = bookingResults.rows[0];
        if (userSubmittedPrice == booking.price) {
            var totalPurchaseAmountInCents = booking.price * 100; // the purchase price in dollars converted to cents
            var stripePaymentFee = totalPurchaseAmountInCents * 0.029 + 30; // 2.9% plus 30 cents
            var fairlywedApplicationFee = Math.floor(totalPurchaseAmountInCents * 0.10 - stripePaymentFee); // 10% minus stripe's cut, round down to nearest penny
            try {
                // Create a Charge:
                var charge = await stripe.charges.create({
                    amount: totalPurchaseAmountInCents,
                    currency: "usd",
                    source: stripeToken.id,
                    application_fee: fairlywedApplicationFee,
                }, {
                        stripe_account: booking.stripe_user_id,
                    });
                try {
                    var success = await client.query(`WITH charge_id_table AS (INSERT INTO stripe_charge_attempts (response_object, was_successful) VALUES ($2, TRUE) RETURNING id)
                        UPDATE bookings SET stripe_charge_id=(SELECT id FROM charge_id_table) WHERE id=$1;`,
                        [booking.booking_id, JSON.stringify(charge)]);
                    emailSiteAdministrators('Client user just successfully booked a wedding');
                } catch (e) {
                    console.log('Error with stripe_charge_id INSERT or tying booking to stripe charge after success on creating stripe charge', e);
                    emailSiteAdministrators('Client user just failed at attempt to book a wedding due to' + e);
                    throw e;
                }
            } catch (e) {
                await undoBooking('Error creating stripe charge', booking);
                console.log('Error creating stripe charge', e);
                emailSiteAdministrators('Client user just failed at attempt to book a wedding due to' + e);
                try {
                    var success = await client.query(`WITH charge_id_table AS (INSERT INTO stripe_charge_attempts (response_object, was_successful) VALUES ($2, FALSE) RETURNING id)
                        UPDATE bookings SET stripe_charge_id=(SELECT id FROM charge_id_table) WHERE id=$1;`,
                        [booking.booking_id, JSON.stringify(e)]);
                } catch (e) {
                    console.log('Error with stripe_charge_id INSERT or tying booking to stripe charge after success on creating stripe charge', e);
                    emailSiteAdministrators('Client user just failed at attempt to book a wedding due to' + e);
                    throw e;
                }
            }
        } else {
            console.log('User price from DOM did not match user submitted price');
            res.sendStatus(400);
        }
    } catch (e) {
        console.log('error in booking', e);
        emailSiteAdministrators('Client user just failed at attempt to book a wedding due to' + e);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
    res.sendStatus(201);
});

async function undoBooking(reasonForUndo, bookingToUndo) {
    var client = await pool.connect();
    try {
        var success = await client.query(`UPDATE subvendor_availability 
            SET availability_id=(SELECT id FROM availability WHERE status='available') 
            WHERE id=$1`, [bookingToUndo.subvendor_availability_id]);
        client.release();
        console.log('Booking created than undone due to ', reasonForUndo);
        emailSiteAdministrators('Booking created then undone due to ' + reasonForUndo);
        return success;
    } catch (e) {
        console.log('UNDO BOOKING FAILED!! Booking created then undone due to ', reasonForUndo, 'but undo failed meaning photographer may have been booked multiple times for the same date. Failure was due to', e);
        emailSiteAdministrators('UNDO BOOKING FAILED!! Booking created then undone due to ' + reasonForUndo + 'but undo failed meaning photographer may have been booked multiple times for the same date. Failure was due to' + e);
        throw e;
    }
}

module.exports = router;