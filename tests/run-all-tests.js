import SchemaValidationTests from './schema-validation.test.js';
import MigrationTests from './migration-tests.test.js';
import QueryPerformanceTests from './query-performance.test.js';

/**
 * Phase 4 Test Runner
 * Executes all test suites for comprehensive system validation
 */
class Phase4TestRunner {
    constructor() {
        this.testSuites = [
            { name: 'Schema Validation', runner: new SchemaValidationTests() },
            { name: 'Migration Tests', runner: new MigrationTests() },
            { name: 'Query Performance', runner: new QueryPerformanceTests() }
        ];
        this.results = {
            totalSuites: 0,
            passedSuites: 0,
            failedSuites: 0,
            startTime: null,
            endTime: null
        };
    }

    async runAllTests() {
        console.log("🚀 PHASE 4: COMPREHENSIVE TESTING & DOCUMENTATION");
        console.log("=".repeat(80));
        console.log("🎯 Testing Schema, Migrations, Queries, and Installation");
        console.log("=".repeat(80));

        this.results.startTime = Date.now();

        for (const suite of this.testSuites) {
            try {
                console.log(`\n📋 Running ${suite.name} Tests...`);
                console.log("-".repeat(60));
                
                await suite.runner.runAllTests();
                this.results.passedSuites++;
                console.log(`✅ ${suite.name} completed successfully`);
                
            } catch (error) {
                this.results.failedSuites++;
                console.error(`❌ ${suite.name} failed:`, error.message);
            }
            
            this.results.totalSuites++;
        }

        this.results.endTime = Date.now();
        this.printFinalSummary();
    }

    printFinalSummary() {
        const duration = this.results.endTime - this.results.startTime;
        
        console.log("\n" + "=".repeat(80));
        console.log("🏆 PHASE 4 TESTING COMPLETE");
        console.log("=".repeat(80));
        console.log(`📊 Test Suites: ${this.results.totalSuites}`);
        console.log(`✅ Passed: ${this.results.passedSuites}`);
        console.log(`❌ Failed: ${this.results.failedSuites}`);
        console.log(`⏱️  Total Duration: ${duration}ms`);
        console.log(`📈 Success Rate: ${((this.results.passedSuites / this.results.totalSuites) * 100).toFixed(1)}%`);

        if (this.results.failedSuites === 0) {
            console.log("\n🎉 ALL TEST SUITES PASSED!");
            console.log("🚀 System is ready for production deployment");
            console.log("📚 Phase 4 documentation and testing complete");
        } else {
            console.log(`\n⚠️  ${this.results.failedSuites} test suite(s) failed`);
            console.log("🔧 Please review and fix issues before deployment");
        }

        console.log("\n📋 Next Steps:");
        console.log("   1. Review any failed tests");
        console.log("   2. Generate comprehensive documentation");
        console.log("   3. Prepare deployment package");
        console.log("   4. Execute production deployment");
    }
}

// Run tests if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new Phase4TestRunner();
    runner.runAllTests().catch(console.error);
// }

export default Phase4TestRunner;
