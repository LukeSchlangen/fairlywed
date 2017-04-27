var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var vendorSearch = require('../modules/vendor-search')
var simpleRanker = require('../modules/simple-ranker')

router.get('/', function (req, res) {
  var userId = req.decodedToken.userSQLId;
  simpleRanker.recommendedPhotographers(req, res, userId, null, vendorSearch);
});

router.get('/subvendorProfile', function (req, res) {
  var searchObject = JSON.parse(req.query.search);
  pool.connect(function (err, client, done) {
    client.query(
      'SELECT subvendors.* ' +
      'FROM subvendors ' +
      'WHERE subvendors.id=$1',
      [searchObject.subvendorId],
      function (err, subvendorDetailsQueryResult) {
        client.query('SELECT packages.id AS id, ' +
          'packages.name AS package, ' +
          'subvendors_packages.price, ' +
          'ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point($2, $3),4326) As geography)) AS distance ' +
          'FROM subvendors ' +
          'JOIN vendors ON vendors.id = subvendors.parent_vendor_id ' +
          'JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id ' +
          'JOIN packages ON subvendors_packages.package_id = packages.id ' +
          'JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id ' +
          'WHERE subvendors.id=$1 ' +
          'AND (SELECT ST_Distance(' +
          '		(SELECT COALESCE(subvendors.location, vendors.location)),' +
          '		(CAST(ST_SetSRID(ST_Point($2, $3),4326) As geography))' +
          '	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance)) ' +
          'AND subvendor_availability.date_id = (SELECT id FROM calendar_dates WHERE day=$4) ' +
          'LIMIT 10;',
          [searchObject.subvendorId, searchObject.longitude, searchObject.latitude, searchObject.date],
          function (err, subvendorPackagesQueryResult) {
            done();
            if (err) {
              console.log('Error user data root GET SQL query task', err);
              res.sendStatus(500);
            } else {
              var currentSubvendor = subvendorDetailsQueryResult.rows[0];
              currentSubvendor.packages = subvendorPackagesQueryResult.rows;
              res.send(currentSubvendor);
            }
          });
      });
  });
});

module.exports = router;
