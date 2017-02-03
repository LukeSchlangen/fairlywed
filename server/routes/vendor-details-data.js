var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var vendorId = req.headers.vendor_id;
        client.query('SELECT * ' +
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

module.exports = router;
