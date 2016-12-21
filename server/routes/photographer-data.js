var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');

// router.get("/", function(req, res){
//   pg.connect(connectionString, function(err, client, done){
//     client.query('SELECT * FROM subvendors JOIN subvendortypes ON subvendors.vendor_type = subvendortypes.id WHERE subvendortypes.name=$1 LIMIT 10', ['photographer'], function(err, photographerQueryResult){
//       done();
//       if(err){
//         console.log('Error user data root GET SQL query task', err);
//         res.sendStatus(500);
//       }else{
//         res.send({photographers: photographerQueryResult.rows});
//       }
//     });
//   });
// });

router.use(function(req, res){
  pg.connect(connectionString, function(err, client, done){
    client.query('SELECT COALESCE(subvendors.name, vendors.name) AS name FROM subvendors JOIN subvendortypes ON subvendors.vendor_type = subvendortypes.id JOIN vendors ON vendors.id = subvendors.parent_vendor_id WHERE subvendortypes.name=$1 LIMIT 10;',
    ['photographer'],
    function(err, photographerQueryResult){
      done();
      if(err){
        console.log('Error user data root GET SQL query task', err);
        res.sendStatus(500);
      }else{
        res.send({photographers: photographerQueryResult.rows});
      }
    });
  });
});

module.exports = router;
