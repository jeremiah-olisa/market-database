# 🧪 Jest Testing Suite for Market Database

This directory contains comprehensive Jest tests for the Market Database Management System. All tests are designed to **FAIL** when criteria aren't met, ensuring strict quality control.

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:performance
npm run test:constraints
npm run test:indexes
```

## 📁 Test Structure

### Core Test Files

- **`basic-setup.test.js`** - Verifies Jest configuration and basic functionality
- **`schema-validation.test.js`** - Tests database schema, tables, and constraints
- **`migration-tests.test.js`** - Tests migration system and schema updates
- **`installation-tests.test.js`** - Tests system installation and configuration
- **`query-performance.test.js`** - Tests query performance and optimization

### Support Files

- **`setup.js`** - Jest setup configuration and global utilities
- **`run-all-tests.js`** - Jest test runner for comprehensive testing
- **`jest.config.js`** - Jest configuration for ES6 modules

## 🎯 Test Categories

### 1. Schema Validation Tests
Tests that **WILL FAIL** if:
- Required tables don't exist
- Column constraints are missing
- Foreign key relationships are broken
- Enum types are incorrect
- Indexes are missing

### 2. Migration Tests
Tests that **WILL FAIL** if:
- Migration system is broken
- Schema updates didn't apply correctly
- Data integrity is compromised
- Rollback safety is compromised

### 3. Installation Tests
Tests that **WILL FAIL** if:
- Database connection fails
- PostGIS extension is missing
- Required data isn't seeded
- System configuration is incorrect

### 4. Performance Tests
Tests that **WILL FAIL** if:
- Queries take longer than specified thresholds
- Indexes aren't being used
- Performance degrades below acceptable levels

## ⚠️ Strict Assertions

All tests use strict Jest assertions that **FAIL** (not warn) when criteria aren't met:

```javascript
// This WILL FAIL if performance criteria isn't met
expect(duration).toBeLessThan(100);

// This WILL FAIL if table doesn't exist
expect(result.rows.length).toBeGreaterThan(0);

// This WILL FAIL if constraint is missing
expect(constraintResult.rows.length).toBeGreaterThan(0);
```

## 🔧 Test Utilities

Global test utilities are available in `global.testUtils`:

```javascript
// Test database connection
const connection = await global.testUtils.testDatabaseConnection(pool);

// Assert performance requirements
global.testUtils.assertPerformance(duration, maxDuration, testName);

// Validate data existence
global.testUtils.assertDataExists(data, message);

// Check table existence
await global.testUtils.assertTableExists(pool, tableName);
```

## 📊 Performance Thresholds

### Query Performance Standards
- **Basic Queries**: < 100ms
- **Join Queries**: < 200ms  
- **Aggregation Queries**: < 500ms
- **Complex Analytics**: < 1000ms

### System Requirements
- **Database Connection**: < 50ms
- **Index Usage**: Must use indexes for key queries
- **Spatial Queries**: Must use spatial indexes
- **Concurrent Queries**: Must handle multiple queries efficiently

## 🚨 Failure Handling

When tests fail:

1. **Review Jest output** for specific failure details
2. **Check database state** - ensure migrations and seeding completed
3. **Verify system configuration** - check Docker, environment variables
4. **Fix the underlying issue** - don't just adjust test thresholds
5. **Re-run tests** to confirm fixes

## 🐳 Docker Testing

Tests are designed to work with the Docker environment:

```bash
# Start database
docker-compose up -d

# Wait for database to be ready
docker-compose exec db pg_isready -U postgres

# Run tests
npm test
```

## 📈 Coverage Requirements

Tests must maintain:
- **100% Schema Coverage** - All tables, constraints, and relationships
- **100% Migration Coverage** - All migration scenarios
- **100% Installation Coverage** - All setup requirements
- **100% Performance Coverage** - All performance criteria

## 🔍 Debugging Tests

### Enable Verbose Output
```bash
VERBOSE_TESTS=true npm test
```

### Run Single Test File
```bash
npm test -- tests/schema-validation.test.js
```

### Run Specific Test
```bash
npm test -- --testNamePattern="should have table products"
```

### Debug Database Issues
```bash
# Check database connection
docker-compose exec db psql -U postgres -d market_db -c "SELECT version();"

# Check table structure
docker-compose exec db psql -U postgres -d market_db -c "\d+ products"
```

## 📚 Best Practices

1. **Never Mock Database** - Tests must use real database
2. **Use Realistic Data** - Tests should reflect production scenarios
3. **Fail Fast** - Tests should fail immediately when criteria aren't met
4. **Clear Assertions** - Use descriptive test names and clear expectations
5. **Performance First** - Performance tests must pass for system to be production-ready

## 🎉 Success Criteria

Tests are considered successful when:
- ✅ All Jest tests pass
- ✅ Performance thresholds are met
- ✅ Schema validation passes
- ✅ Migration system works correctly
- ✅ Installation process completes successfully
- ✅ System is production-ready

## 🚀 Next Steps

After tests pass:
1. **Generate Coverage Report**: `npm run test:coverage`
2. **Review Performance Metrics**: Check query execution times
3. **Validate Production Readiness**: Ensure all criteria are met
4. **Deploy System**: System is ready for production use

---

**Remember**: These tests are designed to be strict. If they fail, fix the underlying issue rather than adjusting the test criteria. This ensures your system meets all business requirements and is truly production-ready.
