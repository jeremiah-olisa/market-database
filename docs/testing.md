# Testing Documentation

## Overview
Comprehensive testing framework for schema validation, migrations, and query performance.

## Test Structure

### Test Runner
`tests/index.js` - Main test orchestrator that executes all test suites.

### Test Suites
- `schema-validation.test.js` - Database schema integrity tests
- `migration-tests.test.js` - Migration and data integrity tests  
- `query-performance.test.js` - Query optimization tests

## Test Suites

### Schema Validation Tests

#### Purpose
Validates database schema integrity, constraints, and relationships.

#### Test Coverage
- Database connection validation
- Core table existence and structure
- Table constraints and validations
- Foreign key relationships
- Enum type definitions
- Database indexes
- Spatial data support (PostGIS)
- Database triggers

#### Usage
```bash
node tests/schema-validation.test.js
```

#### Key Tests
```javascript
// Test database connection
await testDatabaseConnection();

// Test core tables
await testCoreTables();

// Test constraints
await testTableConstraints();

// Test foreign keys
await testForeignKeyRelationships();

// Test enum types
await testEnumTypes();

// Test indexes
await testIndexes();

// Test spatial data
await testSpatialData();

// Test triggers
await testTriggers();
```

### Migration Tests

#### Purpose
Validates database migrations, data integrity, and seeding.

#### Test Coverage
- Migration history tracking
- Data integrity across tables
- Enum constraint validation
- Foreign key integrity
- Data seeding completeness

#### Usage
```bash
node tests/migration-tests.test.js
```

#### Key Tests
```javascript
// Test migration history
await testMigrationHistory();

// Test data integrity
await testDataIntegrity();

// Test enum constraints
await testEnumConstraints();

// Test foreign key integrity
await testForeignKeyIntegrity();

// Test data seeding
await testDataSeeding();
```

### Query Performance Tests

#### Purpose
Validates query optimization and performance metrics.

#### Test Coverage
- Basic query performance
- Join query performance
- Aggregation query performance
- Index effectiveness
- Complex query performance

#### Usage
```bash
node tests/query-performance.test.js
```

#### Key Tests
```javascript
// Test basic queries
await testBasicQueryPerformance();

// Test join queries
await testJoinQueryPerformance();

// Test aggregations
await testAggregationPerformance();

// Test index effectiveness
await testIndexEffectiveness();

// Test complex queries
await testComplexQueryPerformance();
```

## Running Tests

### Individual Test Suites
```bash
# Schema validation only
node tests/schema-validation.test.js

# Migration tests only
node tests/migration-tests.test.js

# Performance tests only
node tests/query-performance.test.js
```

### Complete Test Suite
```bash
# Run all tests
node tests/run-all-tests.js
```

### Test Output
```
🚀 PHASE 4: COMPREHENSIVE TESTING & DOCUMENTATION
================================================================================
🎯 Testing Schema, Migrations, Queries, and Installation
================================================================================

📋 Running Schema Validation Tests...
------------------------------------------------------------
🔍 Running Schema Validation Tests...
============================================================
📡 Testing Database Connection...
✅ Database connection successful
   PostgreSQL Version: 15.4

🏗️  Testing Core Tables...
✅ Table 'products' exists with 6 columns
✅ Table 'areas' exists with 7 columns
✅ Table 'estates' exists with 12 columns
✅ Table 'estate_units' exists with 8 columns
✅ Table 'price_trends' exists with 7 columns

🔒 Testing Table Constraints...
✅ Constraint 'products_name_check' exists on table 'products'
✅ Constraint 'estates_name_check' exists on table 'estates'
✅ Constraint 'estate_units_unit_type_check' exists on table 'estate_units'

🔗 Testing Foreign Key Relationships...
✅ FK: estates.product_id → products.id
✅ FK: estates.area_id → areas.id
✅ FK: estate_units.estate_id → estates.id
✅ FK: price_trends.product_id → products.id
✅ FK: price_trends.area_id → areas.id

📋 Testing Enum Types...
✅ Enum 'product_status': [active, inactive, archived]
✅ Enum 'estate_type': [apartment, bungalow, duplex, mansion, penthouse]
✅ Enum 'estate_classification': [luxury, middle_income, low_income]
✅ Enum 'occupancy_status': [fully_occupied, partially_occupied, under_construction, vacant]
✅ Enum 'unit_status': [available, occupied, under_construction, maintenance]
✅ Enum 'price_type': [rent, sale, maintenance]

📊 Testing Database Indexes...
✅ Index 'products_pkey' exists on table 'products'
✅ Index 'areas_pkey' exists on table 'areas'
✅ Index 'estates_pkey' exists on table 'estates'
✅ Index 'estate_units_pkey' exists on table 'estate_units'
✅ Index 'price_trends_pkey' exists on table 'price_trends'

🗺️  Testing Spatial Data Support...
✅ PostGIS extension enabled (v3.3.4)
✅ Found 1 spatial columns:
   - areas.coordinates: geometry

⚡ Testing Database Triggers...
✅ Found 5 updated_at triggers:
   - update_products_updated_at on products
   - update_areas_updated_at on areas
   - update_estates_updated_at on estates
   - update_estate_units_updated_at on estate_units
   - update_price_trends_updated_at on price_trends

============================================================
📊 SCHEMA VALIDATION TEST SUMMARY
============================================================
✅ Tests Passed: 8
❌ Tests Failed: 0
📈 Success Rate: 100.0%

🎉 All schema validation tests passed!
```

## Performance Benchmarks

### Expected Performance
- **Basic queries**: < 100ms (Excellent)
- **Join queries**: < 500ms (Good)
- **Aggregation queries**: < 1500ms (Good)
- **Complex queries**: < 2000ms (Acceptable)

### Performance Metrics
```javascript
// Performance tracking
this.performanceMetrics = {
    'Products Count': 15,
    'Areas Count': 23,
    'Estates Count': 45,
    'Estate Units Count': 67,
    'Price Trends Count': 89
};
```

## Test Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/market_database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=market_database
DB_USER=your_username
DB_PASSWORD=your_password

# Test configuration
NODE_ENV=test
TEST_TIMEOUT=30000
```

### Test Data Requirements
- Database must be seeded with sample data
- All core tables must exist
- PostGIS extension must be enabled
- Proper permissions must be set

## Error Handling

### Test Failures
```javascript
// Test failure handling
if (this.testResults.failed > 0) {
    console.log(`\n❌ Errors Found:`);
    this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
    });
}
```

### Database Errors
```javascript
try {
    const result = await pool.query(testQuery);
    // Process result
} catch (error) {
    this.testResults.failed++;
    this.testResults.errors.push(`Query failed: ${error.message}`);
    console.log(`❌ Test failed: ${error.message}`);
}
```

## Test Maintenance

### Adding New Tests
```javascript
// Add new test method
async testNewFeature() {
    console.log("\n🧪 Testing New Feature...");
    try {
        // Test logic here
        console.log("✅ New feature test passed");
        this.testResults.passed++;
    } catch (error) {
        this.testResults.failed++;
        this.testResults.errors.push(`New feature test failed: ${error.message}`);
        console.log(`❌ New feature test failed`);
    }
}

// Add to runAllTests method
async runAllTests() {
    // ... existing tests
    await this.testNewFeature();
    // ... rest of tests
}
```

### Updating Test Data
- Update expected values when schema changes
- Modify test queries for new table structures
- Adjust performance benchmarks as needed

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```
