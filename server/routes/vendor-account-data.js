var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        client.query('SELECT vendors.id AS id, vendors.name AS name ' +
            'FROM vendors ' +
            'JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'WHERE users_vendors.user_id=$1 ' +
            'ORDER BY vendors.id;',
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

module.exports = router;
