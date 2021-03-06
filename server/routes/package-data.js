var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', async (req, res) => {
    var client = await pool.connect();
    try {
        var vendorType = req.query.vendorType;
        var photographerQueryResult = await client.query(
            'SELECT packages.id, packages.name, '+
            'packages.number_of_photographers, ' +
            'packages.number_of_hours, ' +
            'packages.engagement_session_is_included ' +
            'FROM packages ' +
            'JOIN subvendortypes ON packages.vendortype_id = subvendortypes.id ' +
            'WHERE subvendortypes.name = $1 ORDER BY id;',
            [vendorType]);
        client.release();
        res.send({ packages: photographerQueryResult.rows });
    } catch (e) {
        console.log('Error user data root GET SQL query task', e);
        res.sendStatus(500);
    }
});

module.exports = router;
