var express = require('express');
var router = express.Router();
var pool = require('../modules/pg-pool');
var vendorSearch = require('../modules/vendor-search')
var simpleRanker = require('../modules/simple-ranker')

router.get('/', async (req, res) => {
  try {
    var userId = req.decodedToken.userSQLId;
    var searchObject = JSON.parse(req.query.search);
    var recommendedPhotographers = await simpleRanker.recommendedPhotographers(userId);
    var subvendorsWithRatings = await vendorSearch(searchObject, recommendedPhotographers.orderBy, recommendedPhotographers.ratings);
    res.send(subvendorsWithRatings);
  } catch (e) {
    console.log('Error in vendor search data', e);
    res.sendStatus(500);
  }
});

router.get('/subvendorProfile', async (req, res) => {
  var client = await pool.connect();
  try {
    var searchObject = JSON.parse(req.query.search);

    // put these two things together either with a promise.all or in the sql
    var subvendorDetailsQueryResult = await client.query(
      'SELECT subvendors.* ' +
      'FROM subvendors ' +
      'WHERE subvendors.id=$1',
      [searchObject.subvendorId]);

    var subvendorPackagesQueryResult = await client.query('SELECT packages.id AS id, ' +
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
      '	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance)) ' +
      'AND subvendor_availability.day=$4 ' +
      'LIMIT 10;',
      [searchObject.subvendorId, searchObject.longitude, searchObject.latitude, searchObject.date])
    client.release();
    var currentSubvendor = subvendorDetailsQueryResult.rows[0];
    currentSubvendor.packages = subvendorPackagesQueryResult.rows;
    res.send(currentSubvendor);
  } catch (e) {
    console.log('Error user data root GET SQL query task', err);
    res.sendStatus(500);
  }
});

module.exports = router;
