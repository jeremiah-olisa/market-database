import { jest } from '@jest/globals';

/**
 * Jest Setup File for Market Database Tests
 * Configures test environment and global test utilities
 */

// Set test timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Database connection test helper
  async testDatabaseConnection(pool) {
    try {
      const result = await pool.query("SELECT NOW()");
      return {
        success: true,
        timestamp: result.rows[0].now,
        message: "Database connection successful"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Database connection failed"
      };
    }
  },

  // Performance assertion helper
  assertPerformance(duration, maxDuration, testName) {
    if (duration > maxDuration) {
      throw new Error(
        `Performance test failed: ${testName} took ${duration}ms, expected < ${maxDuration}ms`
      );
    }
  },

  // Data validation helper
  assertDataExists(data, message) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error(`Data validation failed: ${message}`);
    }
  },

  // Schema validation helper
  assertTableExists(pool, tableName) {
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1
    `, [tableName]).then(result => {
      if (result.rows.length === 0) {
        throw new Error(`Table '${tableName}' does not exist`);
      }
      return true;
    });
  },

  // Query plan analysis helper
  analyzeQueryPlan(pool, query) {
    return pool.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`)
      .then(result => {
        const planData = result.rows[0]['QUERY PLAN'];
        if (!planData || !Array.isArray(planData) || planData.length === 0) {
          throw new Error('EXPLAIN query did not return expected format');
        }
        return planData[0];
      });
  },

  // Check if query uses indexes
  checkIndexUsage(plan) {
    const nodeType = plan['Node Type'];
    if (!nodeType) return false;
    
    return (
      nodeType.includes('Index Scan') || 
      nodeType.includes('Bitmap Index Scan') ||
      nodeType.includes('Index Only Scan')
    );
  },

  // Get execution time from plan
  getExecutionTime(plan) {
    return plan['Execution Time'] || plan['Actual Total Time'] || null;
  }
};

// Console output formatting for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console output during tests unless verbose mode
if (!process.env.VERBOSE_TESTS) {
  console.log = () => {};
  console.error = () => {};
}

// Restore console after tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
