var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');

router.get("/", function(req, res){
  pg.connect(connectionString, function(err, client, done){
    var userId = req.decodedToken.userSQLId;
    client.query('SELECT * FROM users WHERE id=$1', [userId], function(err, userDataQueryResult){
      done();
      if(err){
        console.log('Error user data root GET SQL query task', err);
        res.sendStatus(500);
      }else{
        res.send({name: userDataQueryResult.rows[0].name});
      }
    });
  });
});

module.exports = router;
