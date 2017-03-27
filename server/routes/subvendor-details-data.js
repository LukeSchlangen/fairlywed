var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT subvendors.id AS subvendor_id, ' +
                'subvendors.name AS name, ' +
                'subvendors.url_slug AS "urlSlug", ' +
                'subvendors.is_active AS is_active ' +
                'FROM users_vendors ' +
                'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                'JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2;',
                [userId, subvendorId],
                function (err, subvendorQueryResult) {
                    done();
                    if (err) {
                        console.log('Error subvendor data GET SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send(subvendorQueryResult.rows[0]);
                    }
                });

        }
    });
});

router.get('/packages', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT subvendors_packages.id AS id, ' +
                'packages.id AS package_id, ' +
                'subvendors.id AS subvendor_id, ' +
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
                        console.log('Error subvendor data GET SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send({ packages: subvendorQueryResult.rows });
                    }
                });

        }
    });
});

router.get('/availability', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('SELECT subvendor_availability.id, day, status ' +
                'FROM subvendor_availability ' +
                'JOIN availability ON availability.id=subvendor_availability.availability_id AND subvendor_id =( ' +
                '	SELECT subvendors.id ' +
                '	FROM users_vendors  ' +
                '	JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                '	JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2) ' +
                'RIGHT OUTER JOIN calendar_dates ON calendar_dates.id=subvendor_availability.date_id ' +
                'WHERE day >= (SELECT current_date - cast(extract(dow from current_date) as int)) AND day < (SELECT current_date - cast(extract(dow from current_date) as int)) + 371 ' +
                'ORDER BY day;',
                [userId, subvendorId],
                function (err, subvendorQueryResult) {
                    done();
                    if (err) {
                        console.log('Error subvendor data GET SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.send(subvendorQueryResult.rows);
                    }
                });
        }
    });
});

router.post('/', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var vendorId = req.headers.vendor_id;
    var subvendor = req.body;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            client.query('INSERT INTO subvendors (name, parent_vendor_id, vendortype_id, url_slug) ' +
                'VALUES ($3, ' +
                '(SELECT vendors.id ' +
                'FROM users_vendors ' +
                'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                'WHERE vendors.id=$2), ' +
                '1, ' + // -- hard coded for photographers
                '$4);',
                [userId, vendorId, subvendor.name, subvendor.urlSlug],
                function (err, subvendorQueryResult) {
                    done();
                    if (err) {
                        console.log('Error vendor data INSERT SQL query task', err);
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
        }
    });
});

router.put('/', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var subvendorDetails = req.body;
    pool.connect(function (err, client, done) {
        client.query('UPDATE subvendors ' +
            'SET name=$3, traveldistance=$4, url_slug=$5 ' +
            'WHERE id = ( ' +
            'SELECT subvendors.id ' +
            'FROM users_vendors ' +
            'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
            'JOIN subvendors ON subvendors.parent_vendor_id=vendors.id AND subvendors.id=$2);',
            [userId, subvendorId, subvendorDetails.name, subvendorDetails.traveldistance, subvendorDetails.urlSlug],
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

router.post('/upsertPackage', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var package = req.body;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            // if the package already exists, update the package
            if (package.id) {
                client.query('UPDATE subvendors_packages ' +
                    'SET price=$4, is_active=$5 ' +
                    'WHERE id = ( ' +
                    'SELECT subvendors_packages.id ' +
                    'FROM users_vendors ' +
                    'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                    'JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 ' +
                    'JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id ' +
                    'WHERE subvendors_packages.id=$3);',
                    [userId, subvendorId, package.id, package.price, !!package.is_active],
                    function (err, subvendorQueryResult) {
                        done();
                        if (err) {
                            console.log('Error subvendor data UPDATE SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
            } else {
                client.query('INSERT INTO subvendors_packages (subvendor_id, package_id, price, is_active)' +
                    'VALUES (' +
                    '    (SELECT subvendors.id  ' +
                    '    FROM users_vendors ' +
                    '    JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                    '    JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2), ' +
                    '    (SELECT id ' +
                    '    FROM packages ' +
                    '    WHERE id=$3 AND vendortype_id=1), ' + // currently hard-coded for photographers
                    '    $4, ' +
                    '    $5' +
                    ');',
                    [userId, subvendorId, package.package_id, package.price, !!package.is_active],
                    function (err, subvendorQueryResult) {
                        done();
                        if (err) {
                            console.log('Error vendor data INSERT SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
            }

        }
    });
});

router.post('/upsertAvailability', function (req, res) {
    var userId = req.decodedToken.userSQLId;
    var subvendorId = req.headers.subvendor_id;
    var availability = req.body;
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error connecting to database', err);
            res.sendStatus(500);
        } else {
            // if the availability already exists, update the availability
            if (availability.id) {
                client.query('UPDATE subvendor_availability ' +
                    'SET availability_id=(SELECT id FROM availability WHERE status=$4) ' +
                    'WHERE id = ( ' +
                    'SELECT subvendor_availability.id ' +
                    'FROM users_vendors ' +
                    'JOIN vendors ON users_vendors.user_id=$1 AND vendors.id=users_vendors.vendor_id ' +
                    'JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=$2 ' +
                    'JOIN subvendor_availability ON subvendor_availability.subvendor_id=subvendors.id ' +
                    'WHERE subvendor_availability.id=$3);',
                    [userId, subvendorId, availability.id, availability.status],
                    function (err, subvendorQueryResult) {
                        done();
                        if (err) {
                            console.log('Error subvendor data UPDATE SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
            } else {
                client.query('INSERT INTO subvendor_availability (subvendor_id, date_id, availability_id) ' +
                    'VALUES (' +
                    '	(' +
                    '	SELECT subvendors.id  ' +
                    '	FROM users_vendors  ' +
                    '	JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id ' +
                    '	JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1 ' +
                    '	), ' +
                    '	(SELECT id FROM calendar_dates WHERE day=$3), ' +
                    '	(SELECT id FROM availability WHERE status=$4) ' +
                    ');',
                    [userId, subvendorId, availability.date, availability.status],
                    function (err, subvendorQueryResult) {
                        done();
                        if (err) {
                            console.log('Error vendor data INSERT SQL query task', err);
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
            }

        }
    });
});

module.exports = router;