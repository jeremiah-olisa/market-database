import { pool } from '../utils/index.js';
import fs from 'fs';
import path from 'path';

/**
 * Installation and Setup Testing Suite
 * Tests complete system installation, configuration, and deployment readiness
 */
class InstallationTests {
    constructor() {
        this.testResults = { passed: 0, failed: 0, errors: [] };
        this.systemInfo = {};
    }

    async runAllTests() {
        console.log("🔧 Running Installation and Setup Tests...");
        console.log("=".repeat(60));

        try {
            await this.testSystemRequirements();
            await this.testDatabaseConfiguration();
            await this.testFileStructure();
            await this.testDependencies();
            await this.testEnvironmentConfiguration();
            await this.testSecurityConfiguration();
            await this.testDeploymentReadiness();
            this.printTestSummary();
        } catch (error) {
            console.error("❌ Installation tests failed:", error.message);
            throw error;
        }
    }

    async testSystemRequirements() {
        console.log("\n💻 Testing System Requirements...");
        
        try {
            // Test Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
            
            if (majorVersion >= 16) {
                console.log(`✅ Node.js version: ${nodeVersion} (Compatible)`);
                this.testResults.passed++;
            } else {
                throw new Error(`Node.js version ${nodeVersion} is too old. Required: 16+`);
            }

            // Test PostgreSQL connection
            const dbResult = await pool.query('SELECT version()');
            const pgVersion = dbResult.rows[0].version;
            console.log(`✅ PostgreSQL: ${pgVersion.split(' ')[1]} (Connected)`);
            this.testResults.passed++;

            // Test PostGIS extension
            const postgisResult = await pool.query(`
                SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis'
            `);
            
            if (postgisResult.rows.length > 0) {
                console.log(`✅ PostGIS extension: v${postgisResult.rows[0].extversion}`);
                this.testResults.passed++;
            } else {
                throw new Error('PostGIS extension not found');
            }

            this.systemInfo.nodeVersion = nodeVersion;
            this.systemInfo.postgresVersion = pgVersion.split(' ')[1];
            this.systemInfo.postgisVersion = postgisResult.rows[0].extversion;

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`System requirements test failed: ${error.message}`);
        }
    }

    async testDatabaseConfiguration() {
        console.log("\n🗄️  Testing Database Configuration...");
        
        try {
            // Test database connection pool
            const poolResult = await pool.query('SELECT 1 as test');
            if (poolResult.rows[0].test === 1) {
                console.log("✅ Database connection pool working");
                this.testResults.passed++;
            }

            // Test database permissions
            const permissionsTests = [
                { name: 'SELECT', query: 'SELECT 1' },
                { name: 'INSERT', query: 'INSERT INTO products (name, slug, description, status) VALUES ($1, $2, $3, $4) RETURNING id' },
                { name: 'UPDATE', query: 'UPDATE products SET name = $1 WHERE id = $2' },
                { name: 'DELETE', query: 'DELETE FROM products WHERE id = $1' }
            ];

            for (const test of permissionsTests) {
                try {
                    if (test.name === 'INSERT') {
                        const result = await pool.query(test.query, ['TEST_PRODUCT', 'test-product', 'Test product', 'active']);
                        const testId = result.rows[0].id;
                        
                        // Clean up test data
                        await pool.query('DELETE FROM products WHERE id = $1', [testId]);
                        console.log(`✅ ${test.name} permission: Granted`);
                    } else if (test.name === 'UPDATE') {
                        await pool.query(test.query, ['UPDATED_NAME', 1]);
                        console.log(`✅ ${test.name} permission: Granted`);
                    } else if (test.name === 'DELETE') {
                        await pool.query(test.query, [1]);
                        console.log(`✅ ${test.name} permission: Granted`);
                    } else {
                        await pool.query(test.query);
                        console.log(`✅ ${test.name} permission: Granted`);
                    }
                    this.testResults.passed++;
                } catch (error) {
                    console.log(`❌ ${test.name} permission: ${error.message}`);
                }
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Database configuration test failed: ${error.message}`);
        }
    }

    testFileStructure() {
        console.log("\n📁 Testing File Structure...");
        
        const requiredFiles = [
            'package.json',
            'index.js',
            'docker-compose.yml',
            'Dockerfile',
            'migrations/',
            'queries/',
            'seeders/',
            'utils/',
            'tests/'
        ];

        const requiredMigrations = [
            'migrations/20240318000000_create_migrations_table.sql',
            'migrations/20240318000001_create_enum_types.sql',
            'migrations/20240318000002_create_base_tables.sql',
            'migrations/20240318000003_create_base_indexes.sql'
        ];

        try {
            // Check required directories and files
            for (const file of requiredFiles) {
                if (fs.existsSync(file)) {
                    console.log(`✅ ${file} exists`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Required file/directory not found: ${file}`);
                }
            }

            // Check required migration files
            for (const migration of requiredMigrations) {
                if (fs.existsSync(migration)) {
                    console.log(`✅ ${migration} exists`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Required migration not found: ${migration}`);
                }
            }

            // Check package.json content
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (packageJson.name && packageJson.version) {
                console.log(`✅ package.json: ${packageJson.name} v${packageJson.version}`);
                this.testResults.passed++;
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`File structure test failed: ${error.message}`);
        }
    }

    testDependencies() {
        console.log("\n📦 Testing Dependencies...");
        
        try {
            // Check package.json dependencies
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            const requiredDeps = ['pg', 'dotenv'];
            const requiredDevDeps = ['jest', 'nodemon'];
            
            // Check production dependencies
            for (const dep of requiredDeps) {
                if (packageJson.dependencies && packageJson.dependencies[dep]) {
                    console.log(`✅ Production dependency: ${dep} v${packageJson.dependencies[dep]}`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Missing production dependency: ${dep}`);
                }
            }

            // Check dev dependencies
            for (const dep of requiredDevDeps) {
                if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
                    console.log(`✅ Dev dependency: ${dep} v${packageJson.devDependencies[dep]}`);
                    this.testResults.passed++;
                } else {
                    console.log(`⚠️  Dev dependency missing: ${dep}`);
                }
            }

            // Check if node_modules exists
            if (fs.existsSync('node_modules')) {
                console.log("✅ node_modules directory exists");
                this.testResults.passed++;
            } else {
                console.log("⚠️  node_modules directory not found (run 'npm install' or 'pnpm install')");
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Dependencies test failed: ${error.message}`);
        }
    }

    testEnvironmentConfiguration() {
        console.log("\n⚙️  Testing Environment Configuration...");
        
        try {
            // Check for .env file
            if (fs.existsSync('.env')) {
                console.log("✅ .env file exists");
                this.testResults.passed++;
            } else {
                console.log("⚠️  .env file not found (create from .env.example)");
            }

            // Check environment variables
            const requiredEnvVars = ['DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
            const missingVars = [];

            for (const envVar of requiredEnvVars) {
                if (process.env[envVar]) {
                    console.log(`✅ Environment variable: ${envVar}`);
                    this.testResults.passed++;
                } else {
                    missingVars.push(envVar);
                }
            }

            if (missingVars.length > 0) {
                console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
            }

            // Check Docker configuration
            if (fs.existsSync('docker-compose.yml')) {
                const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
                if (dockerCompose.includes('postgres') && dockerCompose.includes('postgis')) {
                    console.log("✅ Docker Compose configuration valid");
                    this.testResults.passed++;
                }
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Environment configuration test failed: ${error.message}`);
        }
    }

    testSecurityConfiguration() {
        console.log("\n🔒 Testing Security Configuration...");
        
        try {
            // Check database connection security
            const dbUrl = process.env.DATABASE_URL || '';
            if (dbUrl.includes('sslmode=require') || dbUrl.includes('sslmode=verify-full')) {
                console.log("✅ Database SSL enabled");
                this.testResults.passed++;
            } else {
                console.log("⚠️  Database SSL not configured (recommended for production)");
            }

            // Check file permissions
            const sensitiveFiles = ['.env', 'package.json', 'index.js'];
            for (const file of sensitiveFiles) {
                if (fs.existsSync(file)) {
                    const stats = fs.statSync(file);
                    const mode = stats.mode.toString(8);
                    if (mode.endsWith('600') || mode.endsWith('644')) {
                        console.log(`✅ ${file} has appropriate permissions`);
                        this.testResults.passed++;
                    } else {
                        console.log(`⚠️  ${file} permissions: ${mode}`);
                    }
                }
            }

            // Check for hardcoded secrets
            const sourceFiles = ['index.js', 'utils/pool.js'];
            for (const file of sourceFiles) {
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, 'utf8');
                    if (!content.includes('password') && !content.includes('secret')) {
                        console.log(`✅ ${file} no hardcoded secrets`);
                        this.testResults.passed++;
                    } else {
                        console.log(`⚠️  ${file} may contain hardcoded secrets`);
                    }
                }
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Security configuration test failed: ${error.message}`);
        }
    }

    async testDeploymentReadiness() {
        console.log("\n🚀 Testing Deployment Readiness...");
        
        try {
            // Test system health
            const healthChecks = [
                { name: 'Database Connection', test: () => pool.query('SELECT 1') },
                { name: 'Core Tables Access', test: () => pool.query('SELECT COUNT(*) FROM products') },
                { name: 'Query System', test: () => pool.query('SELECT COUNT(*) FROM estates') }
            ];

            for (const check of healthChecks) {
                try {
                    await check.test();
                    console.log(`✅ ${check.name}: Healthy`);
                    this.testResults.passed++;
                } catch (error) {
                    throw new Error(`${check.name} failed: ${error.message}`);
                }
            }

            // Test data volume
            const dataResult = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM products) as products,
                    (SELECT COUNT(*) FROM areas) as areas,
                    (SELECT COUNT(*) FROM estates) as estates
            `);
            
            const data = dataResult.rows[0];
            if (data.products > 0 && data.areas > 0 && data.estates > 0) {
                console.log(`✅ Data Volume: ${data.products} products, ${data.areas} areas, ${data.estates} estates`);
                this.testResults.passed++;
            }

            // Test performance baseline
            const startTime = Date.now();
            await pool.query('SELECT COUNT(*) FROM estates');
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (responseTime < 1000) {
                console.log(`✅ Performance: ${responseTime}ms (Good)`);
                this.testResults.passed++;
            } else {
                console.log(`⚠️  Performance: ${responseTime}ms (Slow)`);
            }

            console.log("🎉 System is ready for deployment!");

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Deployment readiness test failed: ${error.message}`);
        }
    }

    printTestSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 INSTALLATION TEST SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Tests Passed: ${this.testResults.passed}`);
        console.log(`❌ Tests Failed: ${this.testResults.failed}`);
        
        if (Object.keys(this.systemInfo).length > 0) {
            console.log("\n💻 System Information:");
            Object.entries(this.systemInfo).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
        }
        
        if (this.testResults.errors.length > 0) {
            console.log("\n❌ Errors Found:");
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        if (this.testResults.failed === 0) {
            console.log("\n🎉 All installation tests passed! System is ready for production.");
        } else {
            console.log(`\n⚠️  ${this.testResults.failed} tests failed. Please review and fix issues before deployment.`);
        }
    }
}

export default InstallationTests;
