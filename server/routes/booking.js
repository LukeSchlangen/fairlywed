var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.post('/', function (req, res) {
    var location = req.body.location;
    var packageId = req.body.packageId;
    var phoneNumber = req.body.phoneNumber;
    var requests = req.body.requests;
    var time = new Date(req.body.time);
    var subvendorId = req.body.subvendorId;
    pool.connect(function (err, client, done) {
        client.query(
            'INSERT INTO bookings (packages_id, time, requests, location, phone_number, subvendor_id)' +
            'VALUES ($1, $2::timestamptz, $3,' +
            '		CAST(ST_SetSRID(ST_Point(COALESCE($4, -93.4687), COALESCE($5, 44.9212)),4326) AS geography), ' +
            '		$6, $7); ' +
            'UPDATE subvendor_availability' +
            'SET availability_id=3' +
            'WHERE ',
            [packageId, time, requests, location.longitude, location.latitude, phoneNumber, subvendorId],
            function (err) {
                done();
                if (err) {
                    console.log('Error user data root INSERT SQL bookings', err);
                    res.sendStatus(500);
                } else {
                    res.sendStatus(201);
                }
            });
    });
});

module.exports = router;