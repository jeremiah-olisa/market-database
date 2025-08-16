import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Jest Test Runner for Market Database
 * Executes all test suites using Jest for comprehensive system validation
 */
class JestTestRunner {
    constructor() {
        this.testSuites = [
            'schema-validation.test.js',
            'migration-tests.test.js',
            'installation-tests.test.js',
            'query-performance.test.js'
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
        console.log("🚀 PHASE 4: COMPREHENSIVE TESTING WITH JEST");
        console.log("=".repeat(80));
        console.log("🎯 Testing Schema, Migrations, Queries, and Installation");
        console.log("=".repeat(80));

        this.results.startTime = Date.now();

        try {
            // Run Jest with all test files
            console.log("\n📋 Running Jest Test Suite...");
            console.log("-".repeat(60));
            
            const jestCommand = 'node --experimental-vm-modules node_modules/.bin/jest';
            const jestArgs = [
                '--verbose',
                '--forceExit',
                '--detectOpenHandles',
                '--testTimeout=30000'
            ].join(' ');
            
            const fullCommand = `${jestCommand} ${jestArgs}`;
            
            console.log(`Executing: ${fullCommand}`);
            
            execSync(fullCommand, { 
                cwd: join(__dirname, '..'),
                stdio: 'inherit',
                encoding: 'utf8'
            });
            
            this.results.passedSuites = this.testSuites.length;
            this.results.totalSuites = this.testSuites.length;
            
            console.log("\n✅ All Jest tests completed successfully");
            
        } catch (error) {
            this.results.failedSuites = 1;
            this.results.totalSuites = this.testSuites.length;
            console.error("\n❌ Jest tests failed:", error.message);
            throw error;
        }

        this.results.endTime = Date.now();
        this.printFinalSummary();
    }

    printFinalSummary() {
        const duration = this.results.endTime - this.results.startTime;
        
        console.log("\n" + "=".repeat(80));
        console.log("🏆 JEST TESTING COMPLETE");
        console.log("=".repeat(80));
        console.log(`📊 Test Suites: ${this.results.totalSuites}`);
        console.log(`✅ Passed: ${this.results.passedSuites}`);
        console.log(`❌ Failed: ${this.results.failedSuites}`);
        console.log(`⏱️  Total Duration: ${duration}ms`);
        console.log(`📈 Success Rate: ${((this.results.passedSuites / this.results.totalSuites) * 100).toFixed(1)}%`);

        if (this.results.failedSuites === 0) {
            console.log("\n🎉 ALL JEST TESTS PASSED!");
            console.log("🚀 System is ready for production deployment");
            console.log("📚 Phase 4 testing complete with Jest");
        } else {
            console.log(`\n⚠️  ${this.results.failedSuites} test suite(s) failed`);
            console.log("🔧 Please review Jest output and fix issues before deployment");
        }

        console.log("\n📋 Next Steps:");
        console.log("   1. Review any failed tests in Jest output");
        console.log("   2. Fix any failing assertions");
        console.log("   3. Re-run tests: npm test");
        console.log("   4. Prepare deployment package");
        console.log("   5. Execute production deployment");
        
        console.log("\n🔧 Jest Commands:");
        console.log("   npm test                    - Run all tests");
        console.log("   npm run test:watch          - Run tests in watch mode");
        console.log("   npm run test:coverage       - Run tests with coverage");
        console.log("   npm run test:performance    - Run only performance tests");
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new JestTestRunner();
    runner.runAllTests().catch(console.error);
}

export default JestTestRunner;
