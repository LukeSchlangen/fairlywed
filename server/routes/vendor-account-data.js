var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        client.query(`SELECT vendors.id AS id, vendors.name AS name 
            FROM vendors 
            JOIN users_vendors ON users_vendors.vendor_id=vendors.id 
            WHERE users_vendors.user_id=$1 
            ORDER BY vendors.id;`,
            [userId],
            function (err, vendorQueryResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    res.send({ vendors: vendorQueryResult.rows });
                }
            });
    });
});


router.post('/', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var vendor = req.body;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('WITH new_vendor_id AS (' +
                'INSERT INTO vendors (name, location_address, location) ' +
                'VALUES ($2, ' +
                '       $3, ' +
                '		CAST(ST_SetSRID(ST_Point($4, $5),4326) AS geography) ' +
                '		) ' +
                'RETURNING id' +
                ') ' +
                'INSERT INTO users_vendors (user_id, vendor_id) ' +
                'VALUES ($1, (SELECT id FROM new_vendor_id)) RETURNING vendor_id;',
                [userId, vendor.name, vendor.location_address, vendor.longitude, vendor.latitude],
                function (err, newVendorQueryResult) {
                    done();
                    if (err) {
                        console.log('Error vendor data INSERT SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send({newVendorId: newVendorQueryResult.rows[0].vendor_id});
                    }
                });
        }
    });
});

module.exports = router;
