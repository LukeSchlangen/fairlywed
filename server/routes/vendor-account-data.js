var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get("/", function (req, res) {
    pool.connect(function (err, client, done) {
        var userId = req.decodedToken.userSQLId;
        client.query('SELECT * FROM subvendors ' +
            'FULL OUTER JOIN vendors ON subvendors.parent_vendor_id=vendors.id ' +
            'FULL OUTER JOIN users_vendors ON users_vendors.vendor_id=vendors.id ' +
            'FULL OUTER JOIN users ON users.id=users_vendors.user_id ' +
            'JOIN subvendors_packages ON subvendors.id=subvendors_packages.subvendor_id ' +
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
                    var currentSubvendor = vendorQueryResult.rows[0].subvendor_id;
                    var currentVendorObject = { 
                        id: vendorQueryResult.rows[0].parent_vendor_id,
                        subvendors: []
                     };
                    var currentSubvendorArray = [];
                    vendorQueryResult.rows.forEach(function(package){
                        if(currentSubvendor !== package.subvendor_id){
                            currentSubvendor = package.subvendor_id;
                            currentVendorObject.subvendors.push(currentSubvendorArray);
                            currentSubvendorArray = [];
                        }
                        if(currentVendorObject.id !== package.parent_vendor_id){
                            vendorList.push(currentVendorObject);
                            currentVendorObject = {
                                id: package.parent_vendor_id,
                                subvendors: []
                            }
                        }
                        currentSubvendorArray.push(package);
                    });
                    currentVendorObject.subvendors.push(currentSubvendorArray);
                    vendorList.push(currentVendorObject);

                    res.send({ vendors: vendorList });
                }
            });
    });
});

module.exports = router;
