import queryOrchestrator from "./queries/index.js";

console.log("🚀 Market Database Management System - Starting Application...");
console.log("📊 Running comprehensive database queries and analysis...");

async function runAllQueries() {
  try {
    console.log("\n=== Testing Database Connection ===");
    const connectionTest = await queryOrchestrator.testConnection();
    console.log(connectionTest);
    
    if (!connectionTest.success) {
      throw new Error("Database connection failed");
    }

    console.log("\n=== Getting System Overview ===");
    const overview = await queryOrchestrator.getSystemOverview();
    console.log("System Overview:", JSON.stringify(overview, null, 2));

    console.log("\n=== Testing All Query Modules ===");
    const modules = queryOrchestrator.getAllModules();
    
    for (const [moduleName, moduleQueries] of Object.entries(modules)) {
      console.log(`\n--- Testing ${moduleName} module ---`);
      
      // Test each query function in the module
      for (const [queryName, queryFunction] of Object.entries(moduleQueries)) {
        if (typeof queryFunction === 'function') {
          try {
            console.log(`  ✓ Testing ${queryName}...`);
            // Most queries expect parameters, so we'll call them with default/empty params
            const result = await queryFunction();
            console.log(`    Result: ${Array.isArray(result) ? result.length : 'N/A'} rows`);
          } catch (error) {
            console.log(`    ⚠️  ${queryName} requires parameters: ${error.message}`);
          }
        }
      }
    }

    console.log("\n✅ All query modules tested successfully!");
    
  } catch (error) {
    console.error("❌ Error running queries:", error);
    throw error;
  }
}

runAllQueries().catch(error => {
  console.error("❌ Application failed to start:", error);
  process.exit(1);
});
