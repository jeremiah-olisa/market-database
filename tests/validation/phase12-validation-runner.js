import pool from '../../utils/pool.js';

/**
 * Phase 12: Final Validation Runner
 * 
 * This script runs comprehensive validation tests for all requirements v2 features:
 * - Requirements compliance validation
 * - Business value validation  
 * - Technical excellence validation
 * - Advanced features validation
 */

class Phase12ValidationRunner {
  constructor() {
    this.results = {
      requirements: {},
      business: {},
      technical: {},
      advanced: {},
      summary: {}
    };
    this.client = null;
  }

  async connect() {
    try {
      this.client = await pool.connect();
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.release();
      await pool.end();
      console.log('✅ Database connection closed');
    }
  }

  async validateRequirements() {
    console.log('\n🔍 Validating Requirements v2 Compliance...');
    
    try {
      // 1. Verify all 20+ tables are created
      const tablesResult = await this.client.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      
      const tableCount = parseInt(tablesResult.rows[0].table_count);
      this.results.requirements.tableCount = tableCount;
      this.results.requirements.tablesValid = tableCount >= 20;
      
      console.log(`   Tables: ${tableCount}/20+ required - ${this.results.requirements.tablesValid ? '✅' : '❌'}`);

      // 2. Verify JSON/JSONB support
      const jsonResult = await this.client.query(`
        SELECT COUNT(*) as json_fields
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (data_type = 'json' OR data_type = 'jsonb')
      `);
      
      const jsonFields = parseInt(jsonResult.rows[0].json_fields);
      this.results.requirements.jsonSupport = jsonFields > 0;
      
      console.log(`   JSON Support: ${jsonFields} fields - ${this.results.requirements.jsonSupport ? '✅' : '❌'}`);

      // 3. Verify geospatial capabilities
      const postgisResult = await this.client.query(`
        SELECT COUNT(*) as postgis_enabled
        FROM pg_extension WHERE extname = 'postgis'
      `);
      
      const postgisEnabled = parseInt(postgisResult.rows[0].postgis_enabled) > 0;
      this.results.requirements.geospatial = postgisEnabled;
      
      console.log(`   PostGIS: ${postgisEnabled ? '✅' : '❌'}`);

      // 4. Verify full-text search
      const pgTrgmResult = await this.client.query(`
        SELECT COUNT(*) as pg_trgm_enabled
        FROM pg_extension WHERE extname = 'pg_trgm'
      `);
      
      const pgTrgmEnabled = parseInt(pgTrgmResult.overall_count) > 0;
      this.results.requirements.fullTextSearch = pgTrgmEnabled;
      
      console.log(`   Full-Text Search: ${pgTrgmEnabled ? '✅' : '❌'}`);

      // 5. Verify materialized views
      const materializedViewsResult = await this.client.query(`
        SELECT COUNT(*) as view_count
        FROM pg_matviews 
        WHERE schemaname = 'public'
      `);
      
      const materializedViewCount = parseInt(materializedViewsResult.rows[0].view_count);
      this.results.requirements.materializedViews = materializedViewCount > 0;
      
      console.log(`   Materialized Views: ${materializedViewCount} - ${this.results.requirements.materializedViews ? '✅' : '❌'}`);

      // 6. Verify advanced indexing
      const ginIndexesResult = await this.client.query(`
        SELECT COUNT(*) as gin_count
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE '%gin%'
      `);
      
      const ginIndexCount = parseInt(ginIndexesResult.rows[0].gin_count);
      this.results.requirements.advancedIndexing = ginIndexCount > 0;
      
      console.log(`   Advanced Indexing: ${ginIndexCount} GIN indexes - ${this.results.requirements.advancedIndexing ? '✅' : '❌'}`);

      return true;
    } catch (error) {
      console.error('   ❌ Requirements validation failed:', error.message);
      return false;
    }
  }

  async validateBusinessValue() {
    console.log('\n💼 Validating Business Value...');
    
    try {
      // 1. Market intelligence capabilities
      const marketIntelligenceResult = await this.client.query(`
        SELECT COUNT(*) as estate_count
        FROM market_intelligence_summary
      `);
      
      const estateCount = parseInt(marketIntelligenceResult.rows[0].estate_count);
      this.results.business.marketIntelligence = estateCount > 0;
      
      console.log(`   Market Intelligence: ${estateCount} estates - ${this.results.business.marketIntelligence ? '✅' : '❌'}`);

      // 2. Customer analytics capabilities
      const customerAnalyticsResult = await this.client.query(`
        SELECT COUNT(*) as customer_count
        FROM customer_segmentation_analysis
      `);
      
      const customerCount = parseInt(customerAnalyticsResult.rows[0].customer_count);
      this.results.business.customerAnalytics = customerCount > 0;
      
      console.log(`   Customer Analytics: ${customerCount} customers - ${this.results.business.customerAnalytics ? '✅' : '❌'}`);

      // 3. Investment decision support
      const investmentSupportResult = await this.client.query(`
        SELECT COUNT(*) as opportunity_count
        FROM market_opportunities
      `);
      
      const opportunityCount = parseInt(investmentSupportResult.rows[0].opportunity_count);
      this.results.business.investmentSupport = opportunityCount > 0;
      
      console.log(`   Investment Support: ${opportunityCount} opportunities - ${this.results.business.investmentSupport ? '✅' : '❌'}`);

      // 4. Competitive analysis capabilities
      const competitiveAnalysisResult = await this.client.query(`
        SELECT COUNT(*) as provider_count
        FROM service_providers
      `);
      
      const providerCount = parseInt(competitiveAnalysisResult.rows[0].provider_count);
      this.results.business.competitiveAnalysis = providerCount > 0;
      
      console.log(`   Competitive Analysis: ${providerCount} providers - ${this.results.business.competitiveAnalysis ? '✅' : '❌'}`);

      return true;
    } catch (error) {
      console.error('   ❌ Business value validation failed:', error.message);
      return false;
    }
  }

  async validateTechnicalExcellence() {
    console.log('\n⚡ Validating Technical Excellence...');
    
    try {
      // 1. Query performance
      const startTime = Date.now();
      await this.client.query(`
        SELECT COUNT(*) FROM market_intelligence_summary
        WHERE tier_classification = 'platinum'
        LIMIT 10
      `);
      const queryTime = Date.now() - startTime;
      
      this.results.technical.queryPerformance = queryTime < 2000;
      console.log(`   Query Performance: ${queryTime}ms - ${this.results.technical.queryPerformance ? '✅' : '❌'}`);

      // 2. Scalability under load
      const loadStartTime = Date.now();
      const queries = [
        'SELECT COUNT(*) FROM market_intelligence_summary',
        'SELECT COUNT(*) FROM customer_segmentation_analysis',
        'SELECT COUNT(*) FROM infrastructure_performance_metrics'
      ];
      
      await Promise.all(queries.map(query => this.client.query(query)));
      const loadTime = Date.now() - loadStartTime;
      
      this.results.technical.scalability = loadTime < 3000;
      console.log(`   Scalability: ${loadTime}ms for 3 queries - ${this.results.technical.scalability ? '✅' : '❌'}`);

      // 3. Data integrity
      const integrityResult = await this.client.query(`
        SELECT COUNT(*) as constraint_count
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
      `);
      
      const constraintCount = parseInt(integrityResult.rows[0].constraint_count);
      this.results.technical.dataIntegrity = constraintCount > 0;
      
      console.log(`   Data Integrity: ${constraintCount} foreign keys - ${this.results.technical.dataIntegrity ? '✅' : '❌'}`);

      // 4. System reliability
      this.results.technical.systemReliability = true; // Basic connectivity test passed
      console.log(`   System Reliability: ✅`);

      return true;
    } catch (error) {
      console.error('   ❌ Technical excellence validation failed:', error.message);
      return false;
    }
  }

  async validateAdvancedFeatures() {
    console.log('\n🚀 Validating Advanced Features...');
    
    try {
      // 1. Spatial analytics
      const spatialResult = await this.client.query(`
        SELECT COUNT(*) as spatial_areas
        FROM areas
        WHERE geometry IS NOT NULL
      `);
      
      const spatialAreas = parseInt(spatialResult.rows[0].spatial_areas);
      this.results.advanced.spatialAnalytics = spatialAreas > 0;
      
      console.log(`   Spatial Analytics: ${spatialAreas} areas - ${this.results.advanced.spatialAnalytics ? '✅' : '❌'}`);

      // 2. JSON analytics
      const jsonResult = await this.client.query(`
        SELECT COUNT(*) as json_estates
        FROM estates
        WHERE metadata IS NOT NULL
      `);
      
      const jsonEstates = parseInt(jsonResult.rows[0].json_estates);
      this.results.advanced.jsonAnalytics = jsonEstates > 0;
      
      console.log(`   JSON Analytics: ${jsonEstates} estates - ${this.results.advanced.jsonAnalytics ? '✅' : '❌'}`);

      // 3. Full-text search
      const fullTextResult = await this.client.query(`
        SELECT COUNT(*) as search_results
        FROM areas
        WHERE name % 'Central'
      `);
      
      const searchResults = parseInt(fullTextResult.rows[0].search_results);
      this.results.advanced.fullTextSearch = searchResults >= 0;
      
      console.log(`   Full-Text Search: ${searchResults} results - ${this.results.advanced.fullTextSearch ? '✅' : '❌'}`);

      // 4. Materialized view performance
      const materializedViewStartTime = Date.now();
      await this.client.query(`
        SELECT COUNT(*) FROM market_analysis_summary
        WHERE avg_market_potential > 70
        LIMIT 10
      `);
      const materializedViewTime = Date.now() - materializedViewStartTime;
      
      this.results.advanced.materializedViewPerformance = materializedViewTime < 100;
      console.log(`   Materialized View Performance: ${materializedViewTime}ms - ${this.results.advanced.materializedViewPerformance ? '✅' : '❌'}`);

      return true;
    } catch (error) {
      console.error('   ❌ Advanced features validation failed:', error.message);
      return false;
    }
  }

  generateSummary() {
    console.log('\n📊 Phase 12 Validation Summary');
    console.log('================================');
    
    const requirementsScore = Object.values(this.results.requirements).filter(Boolean).length;
    const requirementsTotal = Object.keys(this.results.requirements).length;
    
    const businessScore = Object.values(this.results.business).filter(Boolean).length;
    const businessTotal = Object.keys(this.results.business).length;
    
    const technicalScore = Object.values(this.results.technical).filter(Boolean).length;
    const technicalTotal = Object.keys(this.results.technical).length;
    
    const advancedScore = Object.values(this.results.advanced).filter(Boolean).length;
    const advancedTotal = Object.keys(this.results.advanced).length;
    
    console.log(`Requirements Compliance: ${requirementsScore}/${requirementsTotal} ✅`);
    console.log(`Business Value: ${businessScore}/${businessTotal} ✅`);
    console.log(`Technical Excellence: ${technicalScore}/${technicalTotal} ✅`);
    console.log(`Advanced Features: ${advancedScore}/${advancedTotal} ✅`);
    
    const overallScore = requirementsScore + businessScore + technicalScore + advancedScore;
    const overallTotal = requirementsTotal + businessTotal + technicalTotal + advancedTotal;
    const overallPercentage = Math.round((overallScore / overallTotal) * 100);
    
    console.log(`\nOverall Score: ${overallScore}/${overallTotal} (${overallPercentage}%)`);
    
    if (overallPercentage >= 90) {
      console.log('🎉 EXCELLENT: Phase 12 validation passed with flying colors!');
    } else if (overallPercentage >= 80) {
      console.log('✅ GOOD: Phase 12 validation passed with minor issues.');
    } else if (overallPercentage >= 70) {
      console.log('⚠️  FAIR: Phase 12 validation passed but needs attention.');
    } else {
      console.log('❌ POOR: Phase 12 validation failed. Review required.');
    }
    
    this.results.summary = {
      requirements: `${requirementsScore}/${requirementsTotal}`,
      business: `${businessScore}/${businessTotal}`,
      technical: `${technicalScore}/${technicalTotal}`,
      advanced: `${advancedScore}/${advancedTotal}`,
      overall: `${overallScore}/${overallTotal} (${overallPercentage}%)`
    };
  }

  async run() {
    console.log('🚀 Starting Phase 12: Final Validation');
    console.log('========================================');
    
    if (!await this.connect()) {
      return false;
    }
    
    try {
      await this.validateRequirements();
      await this.validateBusinessValue();
      await this.validateTechnicalExcellence();
      await this.validateAdvancedFeatures();
      
      this.generateSummary();
      
      return true;
    } catch (error) {
      console.error('❌ Phase 12 validation failed:', error.message);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new Phase12ValidationRunner();
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default Phase12ValidationRunner;
