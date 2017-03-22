var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');

router.get('/', function (req, res) {
  var searchObject = JSON.parse(req.query.search);
  pool.connect(function (err, client, done) {
    client.query(
      'SELECT COALESCE(subvendors.name, vendors.name) AS name, ' +
      'subvendors.id AS id, ' +
      'packages.name AS package, ' +
      'subvendors_packages.price, ' +
      'subvendors.url_slug AS url, ' +
      'ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography)) AS distance ' +
      'FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id ' +
      'JOIN vendors ON vendors.id = subvendors.parent_vendor_id ' +
      'JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id ' +
      'JOIN packages ON subvendors_packages.package_id = packages.id ' +
      'JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id ' +
      'WHERE subvendortypes.name=$1 ' +
      'AND packages.id=$2 ' +
      'AND (SELECT ST_Distance(' +
      '		(SELECT COALESCE(subvendors.location, vendors.location)),' +
      '		(CAST(ST_SetSRID(ST_Point($3, $4),4326) As geography))' +
      '	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance)) ' +
      'AND subvendor_availability.date_id = (SELECT id FROM calendar_dates WHERE day=$5) ' +
      'LIMIT 10;',
      [ searchObject.vendorType, searchObject.package.id, searchObject.longitude, searchObject.latitude, searchObject.date ],
      function (err, vendorQueryResult) {
        done();
        if (err) {
          console.log('Error user data root GET SQL query task', err);
          res.sendStatus(500);
        } else {
          res.send({ vendors: vendorQueryResult.rows });
        }
      });
  });
});

module.exports = router;
