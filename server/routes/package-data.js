var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
    var vendorType = req.query.vendorType;
    pool.connect(function (err, client, done) {
        client.query(
            'SELECT packages.id, packages.name ' +
            'FROM packages ' +
            'JOIN subvendortypes ON packages.vendortype_id = subvendortypes.id ' +
            'WHERE subvendortypes.name = $1 ORDER BY id;',
            [vendorType],
            function (err, photographerQueryResult) {
                done();
                if (err) {
                    console.log('Error user data root GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    res.send({ packages: photographerQueryResult.rows });
                }
            });
    });
});

module.exports = router;
