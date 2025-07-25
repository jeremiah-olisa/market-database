import pool from "../utils/pool.js";
import { runProductQueries } from "./products-queries.js";
import { runAreaQueries } from "./areas-queries.js";
import { runEstateQueries } from "./estates-queries.js";
import { runEstateUnitQueries } from "./estate-units-queries.js";
import { runPriceTrendQueries } from "./price-trends-queries.js";
import { runAggregatedViewQueries } from "./aggregated-views-queries.js";

export async function runAllQueries() {
  try {
    console.log("🚀 Market Database Management System started");
    
    // Test database connection
    const connectionTest = await pool.query("SELECT NOW()");
    console.log("✅ Connected to database at:", connectionTest.rows[0].now);
    
    console.log("\n" + "=".repeat(80));
    console.log("📊 RUNNING ALL DATABASE QUERIES");
    console.log("=".repeat(80));
    
    // Run all query modules
    await runProductQueries();
    await runAreaQueries();
    await runEstateQueries();
    await runEstateUnitQueries();
    await runPriceTrendQueries();
    await runAggregatedViewQueries();
    
    console.log("\n" + "=".repeat(80));
    console.log("🎉 ALL QUERIES COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("❌ Error running queries:", error);
  } finally {
    await pool.end();
    console.log("🔌 Database connection closed");
  }
}