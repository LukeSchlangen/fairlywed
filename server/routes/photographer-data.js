var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');

router.get('/', function (req, res) {
  pg.connect(connectionString, function (err, client, done) {
    client.query(
      'SELECT COALESCE(subvendors.name, vendors.name) AS name, ' +
      'packages.name AS package, ' +
      'subvendors_packages.price, ' +
      'subvendors.url_slug AS url ' +
      'FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id ' +
      'JOIN vendors ON vendors.id = subvendors.parent_vendor_id ' +
      'JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id ' +
      'JOIN packages ON subvendors_packages.package_id = packages.id ' +
      'WHERE subvendortypes.name=$1 LIMIT $2;',
      ['photographer', Math.floor(Math.random() * 11) + 1 ],
      function (err, photographerQueryResult) {
        done();
        if (err) {
          console.log('Error user data root GET SQL query task', err);
          res.sendStatus(500);
        } else {
          res.send({ photographers: photographerQueryResult.rows });
        }
      });
  });
});

module.exports = router;
