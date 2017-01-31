var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        client.query('SELECT subvendors.parent_vendor_id AS parent_vendor_id, ' +
            'subvendors_packages.subvendor_id AS subvendor_id, ' +
            'packages.id AS package_id, ' +
            'vendors.name AS vendor_name, ' +
            'subvendors.name AS subvendor_name, ' +
            'packages.name AS package_name, ' +
            'subvendors_packages.price AS price, ' +
            'subvendors_packages.is_active AS is_active, ' +
            'packages.name AS package_name ' +
            'FROM subvendors ' +
            'FULL OUTER JOIN vendors ON subvendors.parent_vendor_id=vendors.id ' +
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'FULL OUTER JOIN users ON users.id=users_vendors.user_id ' +
            'FULL OUTER JOIN subvendors_packages ON subvendors.id=subvendors_packages.subvendor_id ' +
            'FULL OUTER JOIN packages ON packages.id=subvendors_packages.package_id ' +
            'WHERE users.id=$1 ' +
            'ORDER BY subvendors.parent_vendor_id, subvendors_packages.subvendor_id, subvendors_packages.package_id;',
            [userId],
            function (err, vendorQueryResult) {
                done();
                if (err) {
                    console.log('Error vendor data GET SQL query task', err);
                    res.sendStatus(500);
                } else {
                    var vendorList = [];
                    var currentSubvendorObject = {
                        id: vendorQueryResult.rows[0].subvendor_id,
                        name: vendorQueryResult.rows[0].subvendor_name,
                        packages: []
                    };

                    var currentVendorObject = {
                        id: vendorQueryResult.rows[0].parent_vendor_id,
                        name: vendorQueryResult.rows[0].vendor_name,
                        subvendors: []
                    };
                    vendorQueryResult.rows.forEach(function (package) {
                        if (currentSubvendorObject.id !== package.subvendor_id) {
                            currentVendorObject.subvendors.push(currentSubvendorObject);
                            currentSubvendorObject = {
                                id: package.subvendor_id,
                                name: package.subvendor_name,
                                packages: []
                            };
                        }
                        if (currentVendorObject.id !== package.parent_vendor_id) {
                            vendorList.push(currentVendorObject);
                            currentVendorObject = {
                                id: package.parent_vendor_id,
                                name: package.vendor_name,
                                subvendors: []
                            };
                        }
                        currentSubvendorObject.packages.push(package);
                    });
                    currentVendorObject.subvendors.push(currentSubvendorObject);
                    vendorList.push(currentVendorObject);

                    res.send({ vendors: vendorList });
                }
            });
    });
});

module.exports = router;
