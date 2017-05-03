var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', async (req, res) => {
    try {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        var client = await pool.connect();

        const subvendorQueryResult = await client.query('SELECT name, travel_distance, location_address, ST_X (location::geometry) AS longitude, ST_Y (location::geometry) AS latitude ' +
            'FROM vendors ' +
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND vendors.id=$2',
            [userId, vendorId])

        res.send(subvendorQueryResult.rows[0]);
    } catch (e) {
        console.log('Error vendor data GET SQL query task', err);
        res.sendStatus(500);
    } finally {
        client && client.release && client.release();
    }
});

router.get('/subvendorsList', async (req, res) => {
    try {
        var client = await pool.connect();
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        const subvendorQueryResult = await client.query('SELECT subvendors.id AS id, ' +
            'subvendors.name AS name ' +
            'FROM subvendors ' +
            'JOIN vendors ON vendors.id=subvendors.parent_vendor_id ' +
            'JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND vendors.id=$2 ' +
            'ORDER BY subvendors.id;',
            [userId, vendorId]);
        client.release();
        res.send({ subvendors: subvendorQueryResult.rows });
    } catch (e) {
        console.log('Error vendor data GET SQL query task', e);
        res.sendStatus(500);
    }
});

router.put('/', async (req, res) => {
    try {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        var vendorDetails = req.body;
        var travelDistanceInMeters = parseInt(vendorDetails.travel_distance * 1609.34);
        var client = await pool.connect();
        const success = await client.query('UPDATE vendors ' +
            'SET name=$3, travel_distance=$4, location_address=$5, location=CAST(ST_SetSRID(ST_Point($6, $7),4326) AS geography) ' +
            'WHERE id = ( ' +
            'SELECT vendors.id ' +
            'FROM users_vendors ' +
            'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
            'WHERE vendors.id=$2);',
            [userId, vendorId, vendorDetails.name, travelDistanceInMeters, vendorDetails.location_address, vendorDetails.longitude, vendorDetails.latitude]);
        client.release();
        res.sendStatus(200);
    } catch (e) {
        console.log('Error subvendor data UPDATE SQL query task', err);
        res.sendStatus(500);
    }
});

module.exports = router;
