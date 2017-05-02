var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', async (req, res) => {
    try {
        var vendorType = req.query.vendorType;
        const client = await pool.connect();
        const photographerQueryResult = await client.query(
            'SELECT packages.id, packages.name ' +
            'FROM packages ' +
            'JOIN subvendortypes ON packages.vendortype_id = subvendortypes.id ' +
            'WHERE subvendortypes.name = $1 ORDER BY id;',
            [vendorType]);
        client.release();
        res.send({ packages: photographerQueryResult.rows });
    } catch (e) {
        console.log('Error user data root GET SQL query task', err);
        res.sendStatus(500);
    }
});

module.exports = router;
