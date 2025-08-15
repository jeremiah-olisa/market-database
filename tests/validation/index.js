/**
 * Phase 12: Final Validation Test Suite
 * 
 * This module exports all validation tests for Phase 12 of the Requirements v2 migration.
 * It provides comprehensive validation of:
 * - Requirements compliance
 * - Business value delivery
 * - Technical excellence
 * - Advanced features functionality
 */

import Phase12ValidationRunner from './phase12-validation-runner.js';

// Export the main validation runner
export { Phase12ValidationRunner };

// Export individual test modules for specific validation areas
export { default as RequirementsComplianceTests } from './requirements-compliance.test.js';
export { default as BusinessValueValidationTests } from './business-value-validation.test.js';
export { default as TechnicalExcellenceValidationTests } from './technical-excellence-validation.test.js';
export { default as AdvancedFeaturesValidationTests } from './advanced-features-validation.test.js';

/**
 * Run all Phase 12 validation tests
 * @param {Object} options - Validation options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {boolean} options.stopOnError - Stop validation on first error
 * @returns {Promise<Object>} Validation results
 */
export async function runAllPhase12Validation(options = {}) {
  const runner = new Phase12ValidationRunner();
  
  if (options.verbose) {
    console.log('🔍 Running Phase 12 validation with verbose logging...');
  }
  
  try {
    const success = await runner.run();
    
    if (options.verbose) {
      console.log('\n📋 Detailed Validation Results:');
      console.log(JSON.stringify(runner.results, null, 2));
    }
    
    return {
      success,
      results: runner.results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Phase 12 validation failed:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run specific validation category
 * @param {string} category - Validation category (requirements, business, technical, advanced)
 * @returns {Promise<Object>} Category-specific results
 */
export async function runValidationCategory(category) {
  const runner = new Phase12ValidationRunner();
  
  if (!await runner.connect()) {
    return { success: false, error: 'Database connection failed' };
  }
  
  try {
    let results = {};
    
    switch (category.toLowerCase()) {
      case 'requirements':
        await runner.validateRequirements();
        results = runner.results.requirements;
        break;
      case 'business':
        await runner.validateBusinessValue();
        results = runner.results.business;
        break;
      case 'technical':
        await runner.validateTechnicalExcellence();
        results = runner.results.technical;
        break;
      case 'advanced':
        await runner.validateAdvancedFeatures();
        results = runner.results.advanced;
        break;
      default:
        throw new Error(`Unknown validation category: ${category}`);
    }
    
    return {
      success: true,
      category,
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      category,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await runner.disconnect();
  }
}

/**
 * Get validation test summary
 * @returns {Object} Test summary information
 */
export function getValidationTestSummary() {
  return {
    phase: 'Phase 12: Final Validation',
    description: 'Comprehensive validation of Requirements v2 implementation',
    testCategories: [
      {
        name: 'Requirements Compliance',
        description: 'Validates all V2 requirements are met',
        testFile: 'requirements-compliance.test.js',
        tests: [
          'Verify all 20+ tables are created',
          'Verify JSON/JSONB support is implemented',
          'Verify geospatial capabilities are working',
          'Verify full-text search is functional',
          'Verify materialized views are optimized',
          'Verify advanced indexing is implemented'
        ]
      },
      {
        name: 'Business Value Validation',
        description: 'Validates business intelligence capabilities',
        testFile: 'business-value-validation.test.js',
        tests: [
          'Test market intelligence capabilities',
          'Test customer analytics capabilities',
          'Test investment decision support',
          'Test competitive analysis capabilities'
        ]
      },
      {
        name: 'Technical Excellence Validation',
        description: 'Validates technical performance and reliability',
        testFile: 'technical-excellence-validation.test.js',
        tests: [
          'Verify query performance meets requirements',
          'Verify scalability under load',
          'Verify data integrity',
          'Verify system reliability'
        ]
      },
      {
        name: 'Advanced Features Validation',
        description: 'Validates advanced PostgreSQL features',
        testFile: 'advanced-features-validation.test.js',
        tests: [
          'Spatial analytics validation',
          'JSON analytics validation',
          'Full-text search validation',
          'Materialized view performance validation'
        ]
      }
    ],
    runner: 'phase12-validation-runner.js',
    totalTests: 20,
    estimatedDuration: '5-10 minutes'
  };
}

/**
 * Validate specific requirements
 * @param {string[]} requirements - List of requirements to validate
 * @returns {Promise<Object>} Validation results for specified requirements
 */
export async function validateSpecificRequirements(requirements) {
  const runner = new Phase12ValidationRunner();
  
  if (!await runner.connect()) {
    return { success: false, error: 'Database connection failed' };
  }
  
  try {
    const results = {};
    
    for (const requirement of requirements) {
      switch (requirement.toLowerCase()) {
        case 'tables':
          await runner.validateRequirements();
          results.tables = runner.results.requirements.tablesValid;
          break;
        case 'json':
          await runner.validateRequirements();
          results.json = runner.results.requirements.jsonSupport;
          break;
        case 'geospatial':
          await runner.validateRequirements();
          results.geospatial = runner.results.requirements.geospatial;
          break;
        case 'fulltext':
          await runner.validateRequirements();
          results.fullText = runner.results.requirements.fullTextSearch;
          break;
        case 'materialized':
          await runner.validateRequirements();
          results.materialized = runner.results.requirements.materializedViews;
          break;
        case 'indexing':
          await runner.validateRequirements();
          results.indexing = runner.results.requirements.advancedIndexing;
          break;
        default:
          results[requirement] = { error: 'Unknown requirement' };
      }
    }
    
    return {
      success: true,
      requirements: results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await runner.disconnect();
  }
}

// Default export
export default {
  Phase12ValidationRunner,
  runAllPhase12Validation,
  runValidationCategory,
  getValidationTestSummary,
  validateSpecificRequirements
};
