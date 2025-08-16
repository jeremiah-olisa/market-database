import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "market_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  // Add timeout and connection configurations
  statement_timeout: 600000,        // 10 minutes in milliseconds
  query_timeout: 600000,            // 10 minutes in milliseconds
  connectionTimeoutMillis: 120000,  // 2 minutes
  idleTimeoutMillis: 600000,        // 10 minutes
  max: 20,                          // Maximum number of clients in the pool
  min: 2,                           // Minimum number of clients in the pool
});

export default pool;
