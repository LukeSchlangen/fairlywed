var pool = require('../modules/pg-pool');

function write(userSQLId, action) {
  //   pool.connect(function(err, client, done){
  //   // Check the user's level of permision based on their email
  //   client.query('INSERT INTO logs (user_id, action) VALUES ($1, $2);', [userSQLId, action], function(err, clearanceLevelQueryResult){
  //     done();
  //     if(err){
  //       console.log('Error creating log', err);
  //     }
  //   });
  // });
}

module.exports = { write: write };