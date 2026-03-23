const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgres://myplanner_user:Ez0TltJCBJrtwHaKCATMXci9ar2Z@dpg-d707c22a214c73e53pq0-a.oregon-postgres.render.com/myplanner",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;