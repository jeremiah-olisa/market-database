import pool from "./utils/pool.js";

console.log("Market Database Management System started");
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database at:", res.rows[0].now);
  }
  pool.end();
});
