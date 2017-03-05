var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        var subvendorId = req.headers.subvendor_id;
        client.query('SELECT packages.id AS id, ' +
            'packages.name AS name, ' +
            'subvendors_packages.price AS price, ' +
            'subvendors_packages.is_active AS is_active ' +
            'FROM users_vendors ' +
            'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
            'JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 ' +
            'JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id ' +
            'RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id ' +
            'WHERE packages.is_active=TRUE AND packages.vendortype_id=1 ' + // hard coded for photographers
            'ORDER BY packages.id;',
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
