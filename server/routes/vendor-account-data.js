var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        client.query('SELECT * FROM subvendors ' +
            'JOIN vendors ON subvendors.parent_vendor_id=vendors.id ' +
            'JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'JOIN users ON users.id=users_vendors.user_id ' +
            'JOIN subvendors_packages ON subvendors.id=subvendors_packages.subvendor_id ' +
            'JOIN packages ON packages.id=subvendors_packages.package_id ' +
            'WHERE users.id=$1;', [userId], function (err, vendorQueryResult) {
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
