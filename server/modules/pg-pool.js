var pg = require('pg');
var config = {
  user: process.env.PG_USER || null, //env var: PGUSER
  database: process.env.DATABASE_NAME || 'fairlywed', //env var: PGDATABASE
  password: process.env.DATABASE_SECRET || null, //env var: PGPASSWORD
  host: process.env.DATABASE_SERVER || 'localhost', // Server hosting the postgres database
  port: process.env.DATABASE_PORT || 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

module.exports = new pg.Pool(config)