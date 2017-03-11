var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        client.query('SELECT * ' +
            'FROM vendors ' +
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND vendors.id=$2',
            [userId, vendorId],
            function (err, subvendorQueryResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    res.send(subvendorQueryResult.rows[0]);
                }
            });
    });
});

router.get("/subvendorsList", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        client.query('SELECT subvendors.id AS id, ' +
            'subvendors.name AS name ' +
            'FROM subvendors ' +
            'FULL OUTER JOIN vendors ON vendors.id=subvendors.parent_vendor_id ' + 
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'WHERE users_vendors.user_id=$1 ' + // This line validates that the user is authorized to view this data
            'AND vendors.id=$2 ' +
            'ORDER BY subvendors.id;',
            [userId, vendorId],
            function (err, subvendorQueryResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    res.send({ subvendors: subvendorQueryResult.rows });
                }
            });
    });
});

router.post("/", function (req, res) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        var vendorDetails = req.body;
    pool.connect(function (err, client, done) {
                client.query('UPDATE vendors ' +
                    'SET name=$3, traveldistance=$4 ' +
                    'WHERE id = ( ' +
                    'SELECT vendors.id ' +
                    'FROM users_vendors ' +
                    'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                    'WHERE vendors.id=$2);',
                    [userId, vendorId, vendorDetails.name, vendorDetails.traveldistance],
                    function (err, subvendorQueryResult) {
                        done();
                        if (err) {
                            console.log('Error subvendor data UPDATE SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
    });
});

module.exports = router;
