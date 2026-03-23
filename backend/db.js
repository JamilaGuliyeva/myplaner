const { Pool } = require('pg');

// Render-də "Environment Variable" varsa ondan istifadə et, yoxdursa localhost-a bax
const isProduction = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : "postgresql://postgres:CQGq0806@localhost:5432/planner_db",
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = pool;