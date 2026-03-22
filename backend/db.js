const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'planner_db', 
  password: 'CQGq0806', 
  port: 5432,
});

module.exports = pool;