var pg = require('pg');
var connectionString = require('../modules/database-config');

function write(userSQLId, action) {
    pg.connect(connectionString, function(err, client, done){
    // Check the user's level of permision based on their email
    client.query('INSERT INTO logs (user_id, action) VALUES ($1, $2);', [userSQLId, action], function(err, clearanceLevelQueryResult){
      done();
      if(err){
        console.log('Error creating log', err);
      }
    });
  });
}

module.exports = { write: write };