var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var subvendorId = req.headers.subvendor_id;
        client.query('SELECT packages.name AS name, ' +
            'packages.id AS id, ' +
            'subvendors_packages.price AS price, ' +
            'subvendors_packages.is_active AS is_active ' +
            'FROM subvendors ' +
            'FULL OUTER JOIN vendors ON vendors.id=subvendors.parent_vendor_id ' +
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'FULL OUTER JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id  ' +
            'FULL OUTER JOIN packages ON subvendors_packages.package_id=packages.id ' +
            'WHERE (users_vendors.user_id=$1 AND subvendors.id=$2) ' +
            'ORDER BY subvendors.id;',
            [userId, subvendorId],
            function (err, subvendorQueryResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    res.send({ packages: subvendorQueryResult.rows });
                }
            });
    });
});

module.exports = router;
