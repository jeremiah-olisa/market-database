import queryOrchestrator from "./queries/index.js";

console.log("🚀 Market Database Management System - Starting Application...");
console.log("📊 Running comprehensive database queries and analysis...");

// Use the built-in runAllQueries method from QueryOrchestrator
queryOrchestrator.runComprehensiveAnalysis().catch(error => {
  console.error("❌ Application failed to start:", error);
  process.exit(1);
});
